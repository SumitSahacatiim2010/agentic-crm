"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Send, X, Sparkles, Loader2, ChevronDown, ChevronUp, Wrench } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    toolCalls?: { name: string; args: any; result: any }[];
}

export function AIAssistantPanel() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        if (typeof window !== 'undefined') {
            try { return JSON.parse(sessionStorage.getItem('ai_chat_history') || '[]'); } catch { return []; }
        }
        return [];
    });
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        if (typeof window !== 'undefined' && messages.length > 0) {
            sessionStorage.setItem('ai_chat_history', JSON.stringify(messages.slice(-50)));
        }
    }, [messages]);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch("/api/agents/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg,
                    history: messages.map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });
            const data = await res.json();

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: data.reply || data.error || "No response",
                    toolCalls: data.toolCalls,
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Network error. Please try again." },
            ]);
        }
        setLoading(false);
    };

    const quickActions = [
        { label: "List New Leads", prompt: "Show me the latest new leads" },
        { label: "Create Lead", prompt: "I'd like to create a new lead" },
        { label: "Pipeline Overview", prompt: "Show me the current opportunity pipeline" },
    ];

    if (!open) {
        return (
            <Button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-2xl shadow-indigo-500/25 border-0 p-0"
            >
                <Sparkles className="h-6 w-6 text-white" />
            </Button>
        );
    }

    return (
        <Card className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] bg-slate-950 border border-slate-800 shadow-2xl shadow-black/50 flex flex-col overflow-hidden rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-gradient-to-r from-indigo-950/80 to-violet-950/80">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-100">AI Assistant</h3>
                        <p className="text-[10px] text-slate-500">Powered by Gemini</p>
                    </div>
                </div>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                    className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-800"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center pt-8">
                        <Sparkles className="h-10 w-10 mx-auto text-indigo-500/50 mb-3" />
                        <p className="text-sm text-slate-400 mb-1">How can I help you today?</p>
                        <p className="text-xs text-slate-600 mb-6">
                            I can manage leads, opportunities, credit apps, and more.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {quickActions.map((qa) => (
                                <button
                                    key={qa.label}
                                    onClick={() => {
                                        setInput(qa.prompt);
                                        // BUG-018: Auto-submit quick actions
                                        setTimeout(() => {
                                            const form = document.querySelector<HTMLFormElement>('[data-ai-form]');
                                            if (form) form.requestSubmit();
                                        }, 100);
                                    }}
                                    className="px-3 py-1.5 text-xs rounded-full border border-slate-700 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/50 transition-colors"
                                >
                                    {qa.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user"
                                ? "bg-indigo-600 text-white rounded-br-md"
                                : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-md"
                                }`}
                        >
                            <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:my-1.5">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>

                            {/* Tool call badges */}
                            {msg.toolCalls && msg.toolCalls.length > 0 && (
                                <ToolCallsSummary toolCalls={msg.toolCalls} />
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-md px-4 py-3">
                            <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className="p-3 border-t border-slate-800 bg-slate-950">
                <form
                    data-ai-form
                    onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                    }}
                    className="flex gap-2"
                >
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything about your CRM..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 border-0 p-0 shrink-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </Card>
    );
}

/** Collapsible tool call summary shown under agent messages */
function ToolCallsSummary({ toolCalls }: { toolCalls: ChatMessage["toolCalls"] }) {
    const [expanded, setExpanded] = useState(false);
    if (!toolCalls || toolCalls.length === 0) return null;

    return (
        <div className="mt-2 pt-2 border-t border-slate-700/50">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-indigo-400/70 hover:text-indigo-300 transition-colors"
            >
                <Wrench className="h-3 w-3" />
                {toolCalls.length} tool{toolCalls.length > 1 ? "s" : ""} used
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {expanded && (
                <div className="mt-1.5 space-y-1">
                    {toolCalls.map((tc, i) => (
                        <div
                            key={i}
                            className="bg-slate-800/50 rounded px-2 py-1 text-[11px] font-mono text-slate-400"
                        >
                            <span className="text-indigo-400">{tc.name}</span>
                            <span className="text-slate-600 ml-1">
                                ({Object.keys(tc.args || {}).join(", ")})
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
