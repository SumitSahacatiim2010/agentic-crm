import { CLVWidget } from "./CLVWidget";

export function FinancialsTab({ data }: { data: any }) {
    const customerId = data?.party_id || data?.id || 'demo';

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-100">Financial Overview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <CLVWidget customerId={customerId} />
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full flex flex-col justify-center text-slate-500 text-sm">
                    <p className="text-center mb-4 text-slate-300 font-semibold">Financial Health Breakdown</p>
                    <div className="space-y-4 px-2">
                        <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <span className="text-xs text-slate-400 uppercase tracking-wide">Liquidity</span>
                            <span className="text-emerald-400 font-bold text-sm">Good</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <span className="text-xs text-slate-400 uppercase tracking-wide">Debt</span>
                            <span className="text-amber-400 font-bold text-sm">Moderate</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <span className="text-xs text-slate-400 uppercase tracking-wide">Savings</span>
                            <span className="text-emerald-400 font-bold text-sm">Excellent</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-64 flex items-center justify-center text-slate-500 text-sm">
                Recent Transactions List (Placeholder)
            </div>
        </div>
    );
}
