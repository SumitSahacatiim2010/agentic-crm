import { useState } from 'react';
import useSWR from 'swr';
import { WorkItem } from '@/services/branch-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Briefcase, CalendarClock, Target, RefreshCw, MessageSquare, CheckCircle, MapPin } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function BranchDetailPanel({ item, staffUser, onUpdated }: { item: WorkItem, staffUser: any, onUpdated: () => void }) {

    // If it's a lead, fetch its full BANT and scoring data
    const isLead = item.entityType === 'lead';
    const { data: leadData, mutate: mutateLead } = useSWR(isLead ? `/api/leads/${item.id}` : null, fetcher);

    const [updating, setUpdating] = useState(false);

    const lead = leadData?.data?.lead;
    const score = leadData?.data?.scoring?.score || 0;

    const toggleBant = async (field: string, currentValue: boolean) => {
        if (!lead) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/leads/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: !currentValue })
            });
            if (res.ok) {
                toast.success('BANT field updated');
                mutateLead();
                onUpdated();
            } else {
                toast.error('Failed to update field');
            }
        } catch {
            toast.error('Network Error');
        } finally {
            setUpdating(false);
        }
    };

    const handleAction = (action: string) => {
        toast.info(action, { description: `Workflow triggered for ${item.title}` });
        if (action === 'Convert to Opportunity') {
            // Mock Conversion
            setTimeout(() => { toast.success('Lead Converted Successfully'); onUpdated(); }, 1500);
        }
    };

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Badge variant="outline" className="text-xs">{item.entityType.toUpperCase()}</Badge>
                        <h2 className="text-2xl font-semibold text-white">{item.title}</h2>
                    </div>
                    <p className="text-slate-400">{item.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                    {isLead && <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAction('Convert to Opportunity')}><RefreshCw className="mr-2 h-4 w-4" /> Convert</Button>}
                    <Button variant="outline" size="sm" onClick={() => handleAction('Schedule Appointment')}><CalendarClock className="mr-2 h-4 w-4" /> Schedule</Button>
                    <Button variant="secondary" size="sm" onClick={() => handleAction('Create Task')}><Target className="mr-2 h-4 w-4" /> Create Task</Button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-2">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription>Status</CardDescription>
                        <CardTitle className="text-lg">{item.status}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription>Priority</CardDescription>
                        <CardTitle className="text-lg">{item.priority}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription>Owner</CardDescription>
                        <CardTitle className="text-lg truncate">{item.ownerName || 'Unassigned'}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription>SLA Due</CardDescription>
                        <CardTitle className="text-lg text-amber-500">
                            {item.slaDueAt ? new Date(item.slaDueAt).toLocaleString() : 'N/A'}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Dynamic content rendering based on entity type */}
            <div className="flex-1 overflow-y-auto mt-4 px-1 pb-4">

                {isLead && !lead && <div className="text-slate-500">Loading Lead Details...</div>}
                {isLead && lead && (
                    <div className="space-y-6">
                        {/* Scoring Ribbon */}
                        <div className="flex items-center justify-between p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-lg">
                            <div>
                                <h3 className="text-sm font-semibold text-indigo-300">Lead Score</h3>
                                <p className="text-xs text-indigo-400">Calculated from BANT and Profile</p>
                            </div>
                            <div className="text-2xl font-bold tracking-tighter text-indigo-400">
                                {score} <span className="text-sm font-medium text-slate-500">/ 100</span>
                            </div>
                        </div>

                        {/* Interactive BANT Validation */}
                        <div>
                            <h3 className="text-lg font-medium text-white mb-4">Qualification (BANT)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Card className={`bg-slate-900 border-slate-800 cursor-pointer hover:border-slate-600 transition-colors ${lead.bant_budget ? 'border-l-4 border-l-emerald-500' : ''}`} onClick={() => toggleBant('bant_budget', lead.bant_budget)}>
                                    <div className="p-4 flex gap-3">
                                        <Checkbox checked={lead.bant_budget} />
                                        <div>
                                            <p className="font-medium text-sm text-slate-200">Budget</p>
                                            <p className="text-xs text-slate-500 mt-1">Has sufficient funds/capacity.</p>
                                        </div>
                                    </div>
                                </Card>
                                <Card className={`bg-slate-900 border-slate-800 cursor-pointer hover:border-slate-600 transition-colors ${lead.bant_authority ? 'border-l-4 border-l-emerald-500' : ''}`} onClick={() => toggleBant('bant_authority', lead.bant_authority)}>
                                    <div className="p-4 flex gap-3">
                                        <Checkbox checked={lead.bant_authority} />
                                        <div>
                                            <p className="font-medium text-sm text-slate-200">Authority</p>
                                            <p className="text-xs text-slate-500 mt-1">Is primary decision maker.</p>
                                        </div>
                                    </div>
                                </Card>
                                <Card className={`bg-slate-900 border-slate-800 cursor-pointer hover:border-slate-600 transition-colors ${lead.bant_need ? 'border-l-4 border-l-emerald-500' : ''}`} onClick={() => toggleBant('bant_need', lead.bant_need)}>
                                    <div className="p-4 flex gap-3">
                                        <Checkbox checked={lead.bant_need} />
                                        <div>
                                            <p className="font-medium text-sm text-slate-200">Need</p>
                                            <p className="text-xs text-slate-500 mt-1">Clear requirement for product.</p>
                                        </div>
                                    </div>
                                </Card>
                                <Card className={`bg-slate-900 border-slate-800 cursor-pointer hover:border-slate-600 transition-colors ${lead.bant_timeline ? 'border-l-4 border-l-emerald-500' : ''}`} onClick={() => toggleBant('bant_timeline', lead.bant_timeline)}>
                                    <div className="p-4 flex gap-3">
                                        <Checkbox checked={lead.bant_timeline} />
                                        <div>
                                            <p className="font-medium text-sm text-slate-200">Timeline</p>
                                            <p className="text-xs text-slate-500 mt-1">Action within 30 days.</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* Product-Specific Stubs */}
                        <div className="mt-8 border-t border-slate-800 pt-6">
                            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-indigo-400" />
                                Product Specifics: {item.productInterest || 'General'}
                            </h3>

                            {/* Rendering different questionnaires based on product type */}
                            <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-800">
                                {item.productInterest?.toLowerCase().includes('loan') || item.productInterest?.toLowerCase().includes('mortgage') ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                                            <span className="text-slate-400">Credit Score Check</span>
                                            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">Pre-Qualified</Badge>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                                            <span className="text-slate-400">LTV Ratio Expected</span>
                                            <span className="text-slate-200 font-mono">80%</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                                            <span className="text-slate-400">Employment Status</span>
                                            <span className="text-slate-200">Verified W2</span>
                                        </div>
                                    </div>
                                ) : item.productInterest?.toLowerCase().includes('invest') || item.productInterest?.toLowerCase().includes('wealth') ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                                            <span className="text-slate-400">Risk Appetite</span>
                                            <span className="text-amber-400">Moderate</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                                            <span className="text-slate-400">Investment Horizon</span>
                                            <span className="text-slate-200">5-10 Years</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                                            <span className="text-slate-400">ID Verification Status</span>
                                            <span className="text-slate-200">Pending Scan</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                                            <span className="text-slate-400">Funding Method</span>
                                            <span className="text-slate-200">Internal Transfer</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {item.entityType === 'case' && (
                    <div className="space-y-6">
                        <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-800">
                            <h3 className="text-lg font-medium text-white mb-4">Case Investigation</h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs text-slate-500">Subject</span>
                                    <p className="text-sm text-slate-300 font-medium">{item.title}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-slate-500">SLA Baseline</span>
                                        <p className="text-sm text-amber-400">24 Hours</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500">Origin Channel</span>
                                        <p className="text-sm text-slate-300">Omnichannel / IVR</p>
                                    </div>
                                </div>
                                <div className="pt-4 mt-2 border-t border-slate-800">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" /> Omnichannel Log
                                        </span>
                                        <Button variant="outline" size="sm" className="h-7 text-xs">Jump to Thread</Button>
                                    </div>
                                    <div className="bg-slate-950 rounded p-3 text-xs text-slate-400 font-mono space-y-2 max-h-40 overflow-y-auto">
                                        <p><span className="text-blue-400">[10:00 AM]</span> Call initiated by customer.</p>
                                        <p><span className="text-blue-400">[10:02 AM]</span> Intent parsed: "Unauthorized transaction dispute"</p>
                                        <p><span className="text-emerald-400">[10:03 AM]</span> IVR failed to resolve. Routing to Branch Ops.</p>
                                        <p><span className="text-indigo-400">[10:04 AM]</span> System automatically generated Case {item.id.slice(0, 6)}.</p>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <Button variant="outline" size="sm">Escalate to L2</Button>
                                    <Button variant="default" size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => handleAction('Resolve Case')}>Mark Resolved</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {item.entityType === 'task' && (
                    <div className="space-y-6">
                        <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-800">
                            <h3 className="text-lg font-medium text-white mb-4">Task Instructions</h3>
                            <div className="p-4 bg-slate-950 rounded border border-slate-800 text-sm text-slate-300 space-y-4">
                                <p><strong>Action Required:</strong> Please contact the customer to verify the document variations picked up by the ID scanning utility during onboarding.</p>
                                <div className="flex items-center gap-2 text-amber-500">
                                    <MapPin className="h-4 w-4" /> <strong>Location:</strong> {staffUser.branches?.name || 'In-Branch'}
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-2">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 w-full" onClick={() => handleAction('Complete Task')}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Mark Task as Complete
                                </Button>
                                <Button variant="outline" className="w-full">
                                    Reassign to Another Member
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
