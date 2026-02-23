import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { fmtDate } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, User, Building2, Edit, Activity, Briefcase } from "lucide-react";
import { OpportunityRecord } from "./OpportunityKanban";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { useState } from "react";
import Link from "next/link";

interface DealDetailSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    opp: OpportunityRecord | null;
}

export function DealDetailSheet({ open, onOpenChange, opp }: DealDetailSheetProps) {
    const { mutate } = useSWRConfig();
    const [updating, setUpdating] = useState(false);

    if (!opp) return null;

    const handleStageChange = async (newStage: string) => {
        if (!opp || opp.stage === newStage) return;
        setUpdating(true);
        try {
            const res = await fetch('/api/opportunities/update-stage', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ opportunity_id: opp.opportunity_id, stage: newStage })
            });
            if (res.ok) {
                toast.success('Stage updated successfully');
                mutate('/api/opportunities?limit=100');
                onOpenChange(false);
            } else {
                const err = await res.json();
                toast.error('Failed to update stage', { description: err.error });
            }
        } catch { toast.error('Network error'); }
        setUpdating(false);
    };

    const formatValue = (v?: number) => {
        if (!v) return '$0';
        return `$${v.toLocaleString()}`;
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="bg-slate-950 border-l border-slate-800 text-slate-100 sm:max-w-md w-[400px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <SheetTitle className="text-xl font-bold text-slate-100">{opp.opportunity_name || opp.title}</SheetTitle>
                            <p className="text-xs text-slate-500 font-mono mt-1">{opp.opportunity_id}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </div>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Primary Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                <DollarSign className="h-3.5 w-3.5" />
                                <span className="text-[10px] uppercase font-bold tracking-wider">Projected Value</span>
                            </div>
                            <p className="text-lg font-mono text-slate-200">{formatValue(opp.projected_value)}</p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                <Activity className="h-3.5 w-3.5" />
                                <span className="text-[10px] uppercase font-bold tracking-wider">Probability</span>
                            </div>
                            <p className="text-lg font-mono text-slate-200">{opp.probability_weighting || opp.probability || 0}%</p>
                        </div>
                    </div>

                    {/* Stage & Timeline */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1">Status</h4>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Current Stage</span>
                            <Select value={opp.stage} onValueChange={handleStageChange} disabled={updating}>
                                <SelectTrigger className="w-[180px] h-8 text-xs bg-slate-900 border-slate-700 text-slate-200">
                                    <SelectValue placeholder="Stage" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                                    <SelectItem value="Prospecting">Prospecting</SelectItem>
                                    <SelectItem value="Qualification">Qualification</SelectItem>
                                    <SelectItem value="Needs Analysis">Needs Analysis</SelectItem>
                                    <SelectItem value="Proposal">Proposal</SelectItem>
                                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Closed-Won">Closed-Won</SelectItem>
                                    <SelectItem value="Closed-Lost">Closed-Lost</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Expected Close</span>
                            <span className="text-slate-200 flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                {fmtDate(opp.expected_close_date)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Last Updated</span>
                            <span className="text-slate-200 flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-slate-500" />
                                {fmtDate(opp.updated_at)}
                            </span>
                        </div>
                    </div>

                    {/* Customer */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1">Customer</h4>
                        {opp.customer_id ? (
                            <Link href={`/customer/${opp.customer_id}`} className="block">
                                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 hover:border-indigo-500/50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400">
                                            {opp.customer_name?.includes('Inc') || opp.customer_name?.includes('Corp') ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300">{opp.customer_name}</p>
                                            <p className="text-xs text-slate-500 font-mono">{opp.customer_id}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div className="text-sm text-slate-500 italic p-2">{opp.customer_name || 'No customer linked.'}</div>
                        )}
                    </div>

                    {/* Details Placeholder */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1">Details & Assets</h4>
                        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-lg p-6 text-center text-xs text-slate-500">
                            <Briefcase className="h-6 w-6 mx-auto mb-2 text-slate-600" />
                            <p>Attached Documents</p>
                            <p>Win/Loss History</p>
                            <p>Team Members</p>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// Temporary import for the clock icon used above
import { Clock } from "lucide-react";
