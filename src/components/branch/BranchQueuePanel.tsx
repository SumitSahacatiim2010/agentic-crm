import { FileText, LifeBuoy, CheckSquare, Clock } from 'lucide-react';
import { WorkItem } from '@/services/branch-service';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
    items: WorkItem[];
    isLoading: boolean;
    selectedId: string | null;
    onSelect: (id: string) => void;
    onRefresh: () => void;
}

export function BranchQueuePanel({ items, isLoading, selectedId, onSelect, onRefresh }: Props) {
    if (isLoading) {
        return <div className="p-4 text-slate-400">Loading queue...</div>;
    }

    if (items.length === 0) {
        return <div className="p-4 text-slate-500">No work items found.</div>;
    }

    return (
        <ScrollArea className="flex-1">
            <div className="flex flex-col p-3 gap-2">
                {items.map((item) => {
                    const isSelected = item.id === selectedId;

                    let Icon = FileText;
                    let iconColor = "text-blue-400";
                    if (item.entityType === 'case') { Icon = LifeBuoy; iconColor = "text-orange-400"; }
                    if (item.entityType === 'task') { Icon = CheckSquare; iconColor = "text-emerald-400"; }

                    return (
                        <div
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            className={`p-3 rounded-md cursor-pointer border transition-colors ${isSelected
                                    ? 'bg-indigo-900/40 border-indigo-500/50'
                                    : 'bg-slate-900/50 border-slate-800/50 hover:border-slate-700'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-2 items-center">
                                    <Icon className={`h-4 w-4 ${iconColor}`} />
                                    <h4 className="font-medium text-slate-200 truncate pr-2 max-w-[200px]">{item.title}</h4>
                                </div>
                                <Badge variant={item.priority === 'High' || item.priority === 'P1-Critical' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0 h-4">
                                    {item.priority}
                                </Badge>
                            </div>

                            <p className="text-xs text-slate-400 mb-2 truncate">{item.subtitle}</p>

                            <div className="flex items-center justify-between mt-auto">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.status === 'New' || item.status === 'Open' ? 'bg-emerald-500/20 text-emerald-300'
                                        : 'bg-slate-800 text-slate-300'
                                    }`}>
                                    {item.status}
                                </span>

                                {item.slaDueAt && (
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                        <Clock className="h-3 w-3" />
                                        <span>{new Date(item.slaDueAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}
