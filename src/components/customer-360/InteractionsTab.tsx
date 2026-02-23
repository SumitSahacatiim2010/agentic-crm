import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { fmtDateTime } from "@/lib/date-utils";

export function InteractionsTab({ data }: { data: any }) {
    const interactions = data?.interactions || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full h-full">
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-100">Interaction History</h2>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs"><Plus className="h-3.5 w-3.5 mr-1" /> Log Meeting</Button>
                </div>

                <div className="space-y-3">
                    {interactions.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-xl">No interactions logged.</div>
                    ) : (
                        interactions.map((int: any) => (
                            <div key={int.interaction_id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-300 capitalize">{int.type} via {int.channel}</span>
                                    <span className="text-[10px] text-slate-500">{fmtDateTime(int.interaction_date)}</span>
                                </div>
                                <p className="text-sm text-slate-400">{int.summary}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center justify-center text-slate-500 text-sm">
                Channel Filter & Meeting Form (Placeholder)
            </div>
        </div>
    );
}
