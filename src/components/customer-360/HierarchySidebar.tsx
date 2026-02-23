import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronRight, Users, Building, ArrowRight } from "lucide-react";
import { HierarchyNode } from "@/lib/mock-data";

interface HierarchySidebarProps {
    nodes: HierarchyNode[];
}

export function HierarchySidebar({ nodes }: HierarchySidebarProps) {
    const formatCurrency = (val?: number) => {
        if (!val) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };

    const renderNode = (node: HierarchyNode, depth = 0) => (
        <div key={node.id} className="mb-4">
            <div className={`flex items-center gap-3 p-3 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-colors ml-${depth * 4}`}>
                {node.relation === 'Household' || node.relation === 'Spouse' ? (
                    <Users className="h-8 w-8 text-blue-400 p-1.5 bg-blue-500/10 rounded-full" />
                ) : (
                    <Building className="h-8 w-8 text-indigo-400 p-1.5 bg-indigo-500/10 rounded-full" />
                )}

                <div className="flex-1">
                    <div className="text-sm font-medium text-slate-200">{node.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                        <span>{node.relation}</span>
                        {node.net_worth && (
                            <>
                                <span>•</span>
                                <span className="text-emerald-500">{formatCurrency(node.net_worth)}</span>
                            </>
                        )}
                    </div>
                </div>

                <ArrowRight className="h-4 w-4 text-slate-600" />
            </div>

            {node.children && (
                <div className="border-l border-slate-800 ml-4 pl-4 mt-2">
                    {node.children.map(child => renderNode(child, depth + 1))}
                </div>
            )}
        </div>
    );

    return (
        <div className="h-full border-l border-slate-800 bg-slate-950 p-6 hidden lg:block w-[350px]">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Household Hierarchy
                </h3>
                <Badge variant="outline" className="text-xs">
                    2 Linked Members
                </Badge>
            </div>

            <div className="space-y-1">
                {nodes.map(node => renderNode(node))}
            </div>

            <div className="mt-8 p-4 bg-slate-900 rounded-lg border border-slate-800">
                <h4 className="text-xs uppercase text-slate-500 font-bold mb-2">Aggregated Net Worth</h4>
                <div className="text-2xl font-bold text-white">
                    $18,700,000
                </div>
                <div className="text-xs text-slate-400 mt-1">
                    +12.5% vs Last Year
                </div>
            </div>
        </div>
    );

    // Helper component for badge used above since I can't import Badge inside the component efficiently without splitting.
    // Actually I can, it's already imported at top.
}

import { Badge } from "@/components/ui/badge";
