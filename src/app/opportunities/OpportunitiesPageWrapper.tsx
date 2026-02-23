"use client";

import { useState, useEffect } from "react";
import { OpportunityKanban, OpportunityRecord } from "@/components/opportunities/OpportunityKanban";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Plus, Filter, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { NewDealDialog } from "@/components/opportunities/NewDealDialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface OpportunitiesPageWrapperProps {
    initialOpps: OpportunityRecord[];
}

function getStageClass(stage: string) {
    if (stage === 'Closed-Won') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (stage === 'Closed-Lost') return 'bg-red-500/10 text-red-400 border border-red-500/20';
    return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
}

const PRODUCT_TYPES = ['All', 'Deposits', 'Lending', 'Investments', 'Cards', 'Insurance'];

export function OpportunitiesPageWrapper({ initialOpps }: OpportunitiesPageWrapperProps) {
    const [view, setView] = useState<'kanban' | 'list'>('kanban');
    const [isNewDealOpen, setIsNewDealOpen] = useState(false);
    const [productType, setProductType] = useState('All');
    const [opps, setOpps] = useState<OpportunityRecord[]>(initialOpps);
    const [isLoading, setIsLoading] = useState(false);

    // Filters State
    const [rmFilter, setRmFilter] = useState("");
    const [minValFilter, setMinValFilter] = useState("");
    const [minProbFilter, setMinProbFilter] = useState("");

    // Fetch when product type changes
    useEffect(() => {
        if (productType === 'All') {
            setOpps(initialOpps);
            return;
        }

        const fetchOpps = async () => {
            setIsLoading(true);
            try {
                // Determine active persona
                const activePersona = localStorage.getItem('crm_active_persona') || '';
                let personaParam = '';
                if (activePersona === 'RETAIL_RM') personaParam = '&persona=retail_rm';
                if (activePersona === 'CORPORATE_RM') personaParam = '&persona=corp_rm';

                const res = await fetch(`/api/opportunities?product_type=${productType}${personaParam}`);
                if (res.ok) {
                    const json = await res.json();
                    setOpps(json.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch opportunities", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOpps();
    }, [productType, initialOpps]);

    // Derived Filtered List
    const filteredOpps = opps.filter(opp => {
        let match = true;
        if (rmFilter && !opp.opportunity_name?.toLowerCase().includes(rmFilter.toLowerCase()) && !opp.customer_name?.toLowerCase().includes(rmFilter.toLowerCase())) match = false;
        if (minValFilter && (opp.projected_value || 0) < Number(minValFilter)) match = false;
        if (minProbFilter && (opp.probability_weighting || opp.probability || 0) < Number(minProbFilter)) match = false;
        return match;
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
            <header className="flex flex-col gap-4 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Sales Pipeline</h1>
                        <p className="text-slate-400">Manage institutional and retail sales opportunities.</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        {/* View switcher */}
                        <div className="flex rounded-lg border border-slate-700 overflow-hidden">
                            <button
                                onClick={() => setView('kanban')}
                                className={`px-3 py-2 flex items-center gap-1.5 text-xs font-medium transition-colors ${view === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                            >
                                <LayoutGrid className="h-3.5 w-3.5" /> Kanban
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`px-3 py-2 flex items-center gap-1.5 text-xs font-medium transition-colors ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                            >
                                <List className="h-3.5 w-3.5" /> List
                            </button>
                        </div>

                        {/* Filters Popover */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={`border-slate-700 bg-slate-900 ${rmFilter || minValFilter || minProbFilter ? 'text-indigo-400 border-indigo-500/50' : 'text-slate-300'}`}>
                                    <Filter className="h-4 w-4 mr-2" /> Filter {(rmFilter || minValFilter || minProbFilter) ? '(Active)' : ''}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 bg-slate-900 border-slate-700 text-slate-100 p-4" align="end">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-sm border-b border-slate-800 pb-2">Filter Opportunities</h4>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-slate-400">Search Name/Customer</Label>
                                        <Input value={rmFilter} onChange={e => setRmFilter(e.target.value)} placeholder="Type to search..." className="h-8 text-xs bg-slate-950 border-slate-800 text-white" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-slate-400">Min Value ($)</Label>
                                            <Input type="number" value={minValFilter} onChange={e => setMinValFilter(e.target.value)} placeholder="e.g. 50000" className="h-8 text-xs bg-slate-950 border-slate-800 text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-slate-400">Min Prob. (%)</Label>
                                            <Input type="number" value={minProbFilter} onChange={e => setMinProbFilter(e.target.value)} placeholder="e.g. 50" className="h-8 text-xs bg-slate-950 border-slate-800 text-white" />
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="w-full text-xs text-slate-400 hover:text-white" onClick={() => { setRmFilter(''); setMinValFilter(''); setMinProbFilter(''); }}>
                                        Clear Filters
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setIsNewDealOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" /> New Deal
                        </Button>
                    </div>
                </div>

                {/* Product Type Filter Row */}
                <div className="flex gap-2">
                    {PRODUCT_TYPES.map(type => (
                        <button
                            key={type}
                            onClick={() => setProductType(type)}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-colors ${productType === type ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                        >
                            {type}
                        </button>
                    ))}
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin text-indigo-400 ml-4 self-center" />}
                </div>
            </header>

            {view === 'kanban' ? (
                <OpportunityKanban initialOpps={filteredOpps} />
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800/50 text-slate-400 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Opportunity</th>
                                <th className="px-6 py-4">Stage</th>
                                <th className="px-6 py-4">Value</th>
                                <th className="px-6 py-4">Probability</th>
                                <th className="px-6 py-4">Close Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredOpps.map((opp) => (
                                <tr key={opp.opportunity_id} className="hover:bg-slate-800/30 transition-colors cursor-pointer group">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-100 group-hover:text-indigo-400">{opp.opportunity_name || opp.title}</div>
                                        <div className="text-xs text-slate-500">{opp.customer_name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStageClass(opp.stage)}`}>
                                            {opp.stage}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-300">
                                        ${Number(opp.projected_value || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-indigo-500 h-full" style={{ width: `${opp.probability_weighting || opp.probability || 0}%` }} />
                                            </div>
                                            <span className="text-xs text-slate-400">{opp.probability_weighting || opp.probability || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-xs">
                                        {opp.expected_close_date ? new Date(opp.expected_close_date).toLocaleDateString() : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <NewDealDialog open={isNewDealOpen} onOpenChange={setIsNewDealOpen} />
        </div>
    );
}

