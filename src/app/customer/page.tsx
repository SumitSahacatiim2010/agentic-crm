import { insforge } from "@/lib/insforge-client";
import { CustomerList, CustomerSummary } from "@/components/customer-directory/CustomerList";
import { Users } from "lucide-react";
import { MOCK_CUSTOMER } from "@/lib/mock-data";

export const dynamic = 'force-dynamic'; // Always fetch fresh data

async function getCustomers() {
    try {
        const { data, error } = await insforge.database
            .from('individual_parties')
            .select(`
                id,
                full_name,
                tier,
                nationality,
                employment_status
            `)
            .limit(100);

        if (error || !data || data.length === 0) {
            console.error("Error/Empty fetching customers, using fallback");
            return [{
                party_id: MOCK_CUSTOMER.customer_id,
                party_type: 'individual',
                full_legal_name: MOCK_CUSTOMER.full_legal_name,
                segment_tier: MOCK_CUSTOMER.tier,
                nationality: 'US',
                employment_status: 'Employed'
            }] as CustomerSummary[];
        }

        return data.map((p: any) => {
            return {
                party_id: p.id,
                party_type: 'individual',
                full_legal_name: p.full_name || 'Unknown',
                segment_tier: p.tier || 'Standard',
                nationality: p.nationality || 'N/A',
                employment_status: p.employment_status || 'N/A'
            };
        }) as CustomerSummary[];

    } catch (e) {
        console.error("Failed to fetch customers, using fallback:", e);
        return [{
            party_id: MOCK_CUSTOMER.customer_id,
            party_type: 'individual',
            full_legal_name: MOCK_CUSTOMER.full_legal_name,
            segment_tier: MOCK_CUSTOMER.tier,
            nationality: 'US',
            employment_status: 'Employed'
        }] as CustomerSummary[];
    }
}

export default async function CustomerDirectoryPage() {
    const customers = await getCustomers();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
                    <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-400">
                        <Users size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Customer Directory
                        </h1>
                        <p className="text-slate-400 mt-1">
                            {customers.length} Active Profiles
                        </p>
                    </div>
                </div>

                {/* List */}
                <CustomerList customers={customers} />

            </div>
        </div>
    );
}
