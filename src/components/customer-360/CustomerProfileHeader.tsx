import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Building2, UserCircle2, AlertCircle } from "lucide-react";

export function CustomerProfileHeader({ data, id }: { data: any, id: string }) {
    if (!data) return null;

    const { party, individual, corporate, compliance } = data;
    const isCorp = party?.party_type === 'corporate';

    // Safety fallback for displayName based on available data
    let displayName = "Unknown Customer";
    let initials = "UC";
    let typeIcon = <UserCircle2 className="h-6 w-6 text-indigo-400" />;

    if (isCorp && corporate) {
        displayName = corporate.company_name;
        initials = corporate.company_name.substring(0, 2).toUpperCase();
        typeIcon = <Building2 className="h-6 w-6 text-indigo-400" />;
    } else if (!isCorp && individual) {
        displayName = individual.full_legal_name || `${individual.first_name || ''} ${individual.last_name || ''}`.trim() || 'Unknown Individual';
        initials = (individual.first_name?.[0] || '') + (individual.last_name?.[0] || '') || 'UI';
    }

    const tier = individual?.segment_tier || 'Standard';
    const nps = 85; // Placeholder for now

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-start gap-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                {typeIcon}
            </div>

            <Avatar className="h-20 w-20 border-2 border-slate-800 bg-slate-950">
                <AvatarFallback className="text-xl font-bold text-slate-300 bg-slate-800">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-100">{displayName}</h1>
                            {compliance?.kyc_status === 'Approved' ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] uppercase">KYC Cleared</Badge>
                            ) : (
                                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] uppercase gap-1">
                                    <AlertCircle className="h-3 w-3" /> KYC Pending
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 font-mono mt-0.5">{id} · {isCorp ? 'Corporate Entity' : 'Retail Individual'}</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-6 text-right">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Segment Tier</p>
                            <Badge variant="outline" className={`
                                ${tier === 'UHNW' ? 'border-purple-500 text-purple-400' : ''}
                                ${tier === 'HNW' ? 'border-blue-500 text-blue-400' : ''}
                                ${tier === 'Premium' ? 'border-amber-500 text-amber-400' : ''}
                                ${tier === 'Standard' ? 'border-slate-500 text-slate-400' : ''}
                            `}>{tier}</Badge>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Health Score</p>
                            <div className="flex items-center gap-2 justify-end">
                                <span className="text-lg font-bold text-emerald-400">92</span><span className="text-xs text-slate-500">/100</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">NPS</p>
                            <span className="text-lg font-bold text-indigo-400">+{nps}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-500" />
                        contact@{id.toLowerCase()}.demo.com
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-500" />
                        +1 (555) 019-2834
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        {individual?.nationality || 'US'}, New York
                    </div>
                    <div className="ml-auto text-xs">
                        Assigned RM: <span className="text-slate-200 font-medium">Sarah Jenkins</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
