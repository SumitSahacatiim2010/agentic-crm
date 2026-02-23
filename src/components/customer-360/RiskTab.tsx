import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, AlertTriangle, Scale } from "lucide-react";
import { fmtDate } from "@/lib/date-utils";

export function RiskTab({ data }: { data: any }) {
    const comp = data?.compliance;

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-100">Risk & Compliance Profile</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                            <h3 className="text-sm font-semibold text-slate-300">KYC Status</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                            <div><span className="text-slate-500 block mb-1 uppercase font-bold text-[10px]">Status</span><span className="text-slate-200">{comp?.kyc_status || 'Unknown'}</span></div>
                            <div><span className="text-slate-500 block mb-1 uppercase font-bold text-[10px]">Refresh Due</span><span className="text-slate-200">{fmtDate(comp?.kyc_expiry)}</span></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <h3 className="text-sm font-semibold text-slate-300">AML Risk Rating</h3>
                        </div>
                        <div className="pt-2">
                            <span className={`text-lg font-bold ${comp?.aml_risk_rating === 'High' ? 'text-red-400' : comp?.aml_risk_rating === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>{comp?.aml_risk_rating || 'Low'}</span>
                            <span className="block text-xs text-slate-500 mt-1">PEP Status: {comp?.pep_status ? 'True' : 'False'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                            <Scale className="h-4 w-4 text-indigo-500" />
                            <h3 className="text-sm font-semibold text-slate-300">FATCA / CRS</h3>
                        </div>
                        <div className="pt-2">
                            <span className="text-sm text-slate-200">{comp?.fatca_crs_status || 'Compliant'}</span>
                            <span className="block text-xs text-slate-500 mt-1">Self-certification valid</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-64 flex items-center justify-center text-slate-500 text-sm mt-6">
                Sanctions & PEP History Timeline (Placeholder)
            </div>
        </div>
    );
}
