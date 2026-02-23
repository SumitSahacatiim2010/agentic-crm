import { NextBestActionWidget } from "./NextBestActionWidget";

export function TasksTab({ data }: { data: any }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-full items-start">
            <div className="w-full">
                <NextBestActionWidget customerId={data?.party_id || data?.id || 'demo'} />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-64 flex flex-col items-center justify-center text-slate-500 text-sm">
                <p className="font-bold text-slate-300 mb-2">Pending Follow-ups</p>
                <p className="text-xs text-center">Quick-add tasks and reminders coming soon.</p>
            </div>
        </div>
    );
}
