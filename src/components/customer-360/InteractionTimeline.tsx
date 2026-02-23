import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Phone, Users, Globe, Mail, MessageSquare } from "lucide-react";
import { Interaction } from "@/lib/mock-data";
import { fmtDate } from "@/lib/date-utils";

interface InteractionTimelineProps {
    interactions: Interaction[];
}

export function InteractionTimeline({ interactions }: InteractionTimelineProps) {
    const getIcon = (channel: string) => {
        switch (channel) {
            case 'Branch': return <Users className="h-4 w-4 text-emerald-400" />;
            case 'Mobile App': return <Globe className="h-4 w-4 text-blue-400" />;
            case 'IVR': return <Phone className="h-4 w-4 text-purple-400" />;
            case 'Email': return <Mail className="h-4 w-4 text-slate-400" />;
            case 'Meeting': return <Users className="h-4 w-4 text-amber-400" />;
            default: return <MessageSquare className="h-4 w-4 text-slate-400" />;
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg h-full flex flex-col">
            <div className="p-4 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Recent Interactions</h3>
            </div>
            <ScrollArea className="flex-1 p-4 h-[400px]">
                <div className="space-y-6">
                    {interactions.map((interaction, index) => (
                        <div key={interaction.id} className="relative pl-6 border-l border-slate-800 last:border-0">
                            {/* Dot */}
                            <div className="absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full bg-slate-700 border border-slate-900 ring-2 ring-slate-900" />

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500 font-mono">
                                        {fmtDate(interaction.date)}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {getIcon(interaction.channel)}
                                        <span className="text-xs text-slate-400">{interaction.channel}</span>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-300 font-medium">{interaction.summary}</p>

                                <div className="flex items-center gap-2 mt-1">
                                    {interaction.sentiment && (
                                        <Badge variant="secondary" className={`text-[10px] px-1.5 h-5 
                      ${interaction.sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-400' : ''}
                      ${interaction.sentiment === 'Negative' ? 'bg-red-500/10 text-red-400' : ''}
                      ${interaction.sentiment === 'Neutral' ? 'bg-slate-700/50 text-slate-400' : ''}
                    `}>
                                            {interaction.sentiment}
                                        </Badge>
                                    )}
                                    {interaction.agent_name && (
                                        <span className="text-xs text-slate-600">by {interaction.agent_name}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
