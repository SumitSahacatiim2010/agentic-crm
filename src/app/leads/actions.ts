
"use server";

import { insforge, getInsforgeServer } from "@/lib/insforge";
import { revalidatePath } from "next/cache";

export async function convertLeadToOpportunity(lead: any, formData: {
    opportunity_name: string;
    projected_value: number;
    expected_close_date: string;
    owner: string;
}) {
    try {
        // 1. Create Opportunity
        const serverClient = await getInsforgeServer();
        const { data: opp, error: oppError } = await serverClient.database
            .from('opportunities')
            .insert({
                customer_id: lead.converted_customer_id || null, // Assuming lead might have a customer mapped
                deal_name: formData.opportunity_name,
                pipeline_stage: 'Qualification',
                probability: 25,
                deal_value: formData.projected_value,
                expected_close_date: formData.expected_close_date,
                assigned_rm: formData.owner,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (oppError) throw oppError;

        // 2. Update Lead Status
        const { error: leadError } = await serverClient.database
            .from('leads')
            .update({
                status: 'Qualified',
                updated_at: new Date().toISOString()
            })
            .eq('id', lead.id || lead.lead_id);

        if (leadError) throw leadError;

        revalidatePath('/leads');
        revalidatePath('/dashboard');

        return { success: true, opportunityId: opp.opportunity_id };
    } catch (error: any) {
        console.error("Conversion failed:", error);
        return { success: false, error: error.message };
    }
}
