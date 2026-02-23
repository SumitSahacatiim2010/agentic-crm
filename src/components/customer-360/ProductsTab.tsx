import { Badge } from "@/components/ui/badge";

export function ProductsTab({ data }: { data: any }) {
    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-100">Product Holdings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Checking</span>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Active</Badge>
                    </div>
                    <p className="text-xl font-mono text-slate-100">$24,500.00</p>
                    <p className="text-[10px] text-slate-500 mt-2">Opened Mar 2023</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Credit Card</span>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Active</Badge>
                    </div>
                    <p className="text-xl font-mono text-slate-100">$1,200.00 <span className="text-xs text-slate-500">/ $10k Limit</span></p>
                    <p className="text-[10px] text-slate-500 mt-2">Opened Jun 2023</p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-64 flex items-center justify-center text-slate-500 text-sm">
                Cross-Sell Eligibility & Product Timeline (Placeholder)
            </div>
        </div>
    );
}
