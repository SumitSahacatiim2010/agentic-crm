"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KNOWLEDGE_BASE, ServiceCase } from "@/lib/service-mock-data";
import { BookOpen, ChevronRight, Lightbulb } from "lucide-react";

interface KnowledgeAssistProps {
    activeCase: ServiceCase | null;
}

export function KnowledgeAssist({ activeCase }: KnowledgeAssistProps) {
    if (!activeCase) return null;

    const relevantArticles = KNOWLEDGE_BASE.filter(
        article => article.category === activeCase.category
    );

    return (
        <Card className="bg-slate-900 border-slate-800 h-full flex flex-col">
            <CardHeader className="pb-2 bg-indigo-950/20 border-b border-indigo-900/30">
                <CardTitle className="text-sm font-medium text-indigo-300 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Agent Assist
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-4">

                    <div className="mb-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Recommended Actions</h4>
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded text-sm text-slate-300">
                            Based on "<strong>{activeCase.category}</strong>", you should first verify the customer's identity.
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase">Related Articles</h4>
                        {relevantArticles.length > 0 ? (
                            relevantArticles.map(article => (
                                <div key={article.id} className="group p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded cursor-pointer transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-indigo-400 font-medium text-sm">{article.title}</span>
                                        <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-indigo-400" />
                                    </div>
                                    <p className="text-xs text-slate-400 line-clamp-3">{article.snippet}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-slate-500 italic">No specific articles found for this category.</div>
                        )}
                    </div>

                </ScrollArea>
            </CardContent>
        </Card>
    );
}
