"use client";

import { useState } from "react";
import { KNOWLEDGE_BASE, KnowledgeArticle } from "@/lib/knowledge-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Eye, Calendar, ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";

export default function KnowledgeBasePage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

    const categories = ["All", ...Array.from(new Set(KNOWLEDGE_BASE.map(a => a.category)))];

    const filteredArticles = KNOWLEDGE_BASE.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (selectedArticle) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200">
                <header className="border-b border-slate-800 bg-slate-950 p-6 shrink-0 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <BookOpen className="h-6 w-6 text-indigo-400" />
                            {selectedArticle.title}
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">{selectedArticle.category} · {selectedArticle.lastUpdated} · {selectedArticle.views} views</p>
                    </div>
                    <Button variant="outline" className="border-slate-700 text-slate-300" onClick={() => setSelectedArticle(null)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Articles
                    </Button>
                </header>
                <main className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="h-3.5 w-3.5 text-slate-500" />
                            {selectedArticle.tags.map(tag => (
                                <span key={tag} className="text-xs bg-slate-900 text-indigo-300 px-2 py-0.5 rounded border border-slate-800">{tag}</span>
                            ))}
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none bg-slate-900 border border-slate-800 rounded-xl p-6 lg:p-8">
                            <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">{selectedArticle.content}</div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200">
            <header className="border-b border-slate-800 bg-slate-950 p-6 shrink-0 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-indigo-400" />
                        Knowledge Base
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">SOPs, Guidelines, and Regulatory Protocols</p>
                </div>
                <Link href="/" className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300 transition-colors bg-slate-900 border border-slate-800 px-4 py-2 rounded-md">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Link>
            </header>

            <main className="flex-1 overflow-y-auto w-full">
                <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-6">
                    {/* Search and Filter Row */}
                    <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search articles, keywords, or tags..."
                                className="pl-10 bg-slate-900 border-slate-700 text-slate-200 w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-full md:w-[200px] bg-slate-900 border-slate-700 text-slate-200">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                                {categories.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Results Count */}
                    <div className="text-sm text-slate-500">
                        Showing {filteredArticles.length} matching articles
                    </div>

                    {/* Article Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArticles.map(article => (
                            <Card key={article.id} onClick={() => setSelectedArticle(article)} className="bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-colors cursor-pointer group flex flex-col h-full">
                                <CardHeader className="pb-3 flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700">{article.category}</Badge>
                                        <span className="text-[10px] font-mono text-slate-500">{article.id}</span>
                                    </div>
                                    <CardTitle className="text-lg text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2">
                                        {article.title}
                                    </CardTitle>
                                    <CardDescription className="text-slate-400 mt-2 line-clamp-3">
                                        {article.excerpt}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0 mt-auto border-t border-slate-800/50">
                                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {article.views} views</span>
                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {article.lastUpdated}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                                        <Tag className="h-3 w-3 text-slate-600" />
                                        {article.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[10px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
