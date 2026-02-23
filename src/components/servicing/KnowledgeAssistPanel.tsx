"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface KnowledgeArticle {
    article_id: string;
    title: string;
    category: string;
    excerpt: string;
    helpful_count: number;
    not_helpful_count: number;
}

interface KnowledgeAssistPanelProps {
    caseId: string;
    subject: string;
}

function scoreLabel(helpful: number, total: number) {
    if (total === 0) return null;
    const pct = Math.round((helpful / total) * 100);
    return `${helpful}/${total} (${pct}%) found helpful`;
}

export function KnowledgeAssistPanel({ caseId, subject }: KnowledgeAssistPanelProps) {
    const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [voted, setVoted] = useState<Record<string, 'up' | 'down'>>({});
    const [counts, setCounts] = useState<Record<string, { helpful: number; not_helpful: number }>>({});

    // Derive category from subject keywords
    const categoryGuess = (() => {
        const s = subject.toLowerCase();
        if (s.includes('regulat') || s.includes('fca') || s.includes('cfpb') || s.includes('complaint')) return 'regulatory_complaint';
        if (s.includes('fee') || s.includes('charge') || s.includes('bill') || s.includes('interest') || s.includes('fraud')) return 'billing';
        if (s.includes('portal') || s.includes('app') || s.includes('error') || s.includes('system') || s.includes('card')) return 'technical';
        return 'service_request';
    })();

    const keywords = subject.toLowerCase().split(/\s+/).filter(w => w.length > 3).join(',');

    useEffect(() => {
        setLoading(true);
        fetch(`/api/knowledge/articles?category=${categoryGuess}&keywords=${encodeURIComponent(keywords)}`)
            .then(r => r.json())
            .then(data => {
                setArticles(Array.isArray(data) ? data : []);
                const c: Record<string, { helpful: number; not_helpful: number }> = {};
                (Array.isArray(data) ? data : []).forEach((a: KnowledgeArticle) => {
                    c[a.article_id] = { helpful: a.helpful_count, not_helpful: a.not_helpful_count };
                });
                setCounts(c);
            })
            .catch(() => setArticles([]))
            .finally(() => setLoading(false));
    }, [caseId, categoryGuess, keywords]);

    const handleVote = async (articleId: string, helpful: boolean) => {
        if (voted[articleId]) { toast.info("You've already voted on this article"); return; }
        const res = await fetch('/api/knowledge/feedback', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ article_id: articleId, case_id: caseId, helpful }),
        });
        if (res.ok) {
            const data = await res.json();
            setVoted(prev => ({ ...prev, [articleId]: helpful ? 'up' : 'down' }));
            setCounts(prev => ({ ...prev, [articleId]: { helpful: data.helpful_count, not_helpful: data.not_helpful_count } }));
            toast.success(helpful ? 'Marked as helpful — thank you!' : 'Noted — we\'ll improve the match');
        } else {
            toast.error("Feedback failed");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-32 gap-2 text-slate-500 text-xs">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading knowledge articles…
        </div>
    );

    if (articles.length === 0) return (
        <div className="text-center py-8 space-y-2">
            <BookOpen className="h-8 w-8 text-slate-800 mx-auto" />
            <p className="text-slate-600 text-xs">No articles matched. Try adjusting the Category or root cause fields.</p>
        </div>
    );

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                <p className="text-xs font-bold text-slate-300">Knowledge Assist</p>
                <span className="text-[10px] text-slate-600">· {articles.length} articles matched</span>
            </div>

            {articles.map(article => {
                const c = counts[article.article_id] || { helpful: article.helpful_count, not_helpful: article.not_helpful_count };
                const total = c.helpful + c.not_helpful;
                const isExpanded = expanded === article.article_id;
                const myVote = voted[article.article_id];

                return (
                    <div key={article.article_id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                        <div className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="text-xs font-semibold text-slate-200 leading-snug">{article.title}</p>
                                <button onClick={() => setExpanded(isExpanded ? null : article.article_id)}
                                    className="text-slate-600 hover:text-slate-300 shrink-0">
                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                            </div>

                            <div className={`text-xs text-slate-400 leading-relaxed overflow-hidden transition-all ${isExpanded ? 'max-h-none' : 'max-h-8'}`}>
                                {article.excerpt}
                            </div>

                            {total > 0 && (
                                <p className="text-[10px] text-slate-600 mt-2">{scoreLabel(c.helpful, total)}</p>
                            )}
                        </div>

                        {/* Feedback row */}
                        <div className="flex items-center justify-between px-3 py-2 border-t border-slate-800 bg-slate-950/50">
                            <div className="flex gap-2">
                                <button onClick={() => handleVote(article.article_id, true)}
                                    className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded transition-colors ${myVote === 'up' ? 'bg-emerald-900/50 text-emerald-300' : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-950/30'}`}
                                    disabled={Boolean(myVote)}>
                                    <ThumbsUp className="h-3 w-3" />{c.helpful}
                                </button>
                                <button onClick={() => handleVote(article.article_id, false)}
                                    className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded transition-colors ${myVote === 'down' ? 'bg-red-900/50 text-red-300' : 'text-slate-500 hover:text-red-400 hover:bg-red-950/30'}`}
                                    disabled={Boolean(myVote)}>
                                    <ThumbsDown className="h-3 w-3" />{c.not_helpful}
                                </button>
                            </div>
                            <span className="text-[10px] text-slate-600 capitalize">{article.category.replace('_', ' ')}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
