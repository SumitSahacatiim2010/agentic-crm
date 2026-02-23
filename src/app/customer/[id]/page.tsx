import { notFound } from "next/navigation";
import { getParty360 } from "@/lib/crm-service";
import Customer360Client from "@/components/customer-360/Customer360Client";

export default async function Customer360Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const data = await getParty360(params.id);

    if (!data) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <Customer360Client data={data} id={params.id} />
        </div>
    );
}
