"use client";

import { useState, useEffect } from "react";
import { PersonaId, PERSONA_CONFIG } from "@/config/personaConfig";
import { PersonaSwitcher } from "./PersonaSwitcher";
import { ArrowLeft, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WidgetRenderer } from "./WidgetRenderer";

export function PersonaLayout() {
    // Determine initial state
    const [mounted, setMounted] = useState(false);
    const [personaId, setPersonaId] = useState<PersonaId>("RETAIL_RM");

    // Hydrate from localStorage if available
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("crm_active_persona") as PersonaId;
        if (saved && PERSONA_CONFIG[saved]) {
            setPersonaId(saved);
        }
    }, []);

    const handlePersonaChange = (id: PersonaId) => {
        setPersonaId(id);
        localStorage.setItem("crm_active_persona", id);

        // Ensure viewport scroll is reset to top of content
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleBackToPersonas = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    };

    if (!mounted) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading Workspace...</div>;
    }

    const activeDef = PERSONA_CONFIG[personaId];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">

            {/* Top Switcher UI */}
            <PersonaSwitcher activePersona={personaId} onChange={handlePersonaChange} />

            {/* Main Application Area */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-6 lg:p-8 flex flex-col gap-6">

                {/* Contextual Header per Persona */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800 animate-in fade-in slide-in-from-top-4">
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-3 text-indigo-400 mb-1">
                            {activeDef.icon}
                            <span className="text-sm font-semibold uppercase tracking-wider">
                                {activeDef.label} Workspace
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight break-words">
                            Banking CRM
                        </h1>
                        <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
                            {activeDef.description}
                        </p>
                    </div>

                    {/* Desktop Context Actions */}
                    <div className="flex items-center gap-3 shrink-0 flex-wrap">
                        {(personaId === "RETAIL_RM" || personaId === "BRANCH_MANAGER" || personaId === "GLOBAL_ADMIN") && (
                            <Button
                                size="sm"
                                onClick={() => window.location.href = '/onboarding'}
                                aria-label="Onboard a new customer"
                                className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                            >
                                Onboard New Customer
                            </Button>
                        )}
                        {(personaId === "RETAIL_RM" || personaId === "CORPORATE_RM" || personaId === "GLOBAL_ADMIN") && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.location.href = '/customer'}
                                aria-label="View all customers"
                                className="text-xs bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                            >
                                View Customers
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBackToPersonas}
                            aria-label="Change active persona"
                            className="text-xs bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                        >
                            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                            Change Persona
                        </Button>
                        <button
                            aria-label="User profile"
                            title="User Profile"
                            className="hidden md:flex items-center justify-center h-10 w-10 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                        >
                            <UserCircle className="h-6 w-6" />
                        </button>
                    </div>
                </header>

                {/* Functional App Quick Links (Global Admin Only) */}
                {personaId === "GLOBAL_ADMIN" && (
                    <div className="flex flex-wrap gap-3 pb-6 border-b border-slate-800 animate-in fade-in slide-in-from-top-4">
                        <a href="/dashboard" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow flex items-center gap-2">RM Dashboard</a>
                        <a href="/leads" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm font-medium rounded-lg transition-colors">Leads</a>
                        <a href="/opportunities" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm font-medium rounded-lg transition-colors">Opportunities</a>
                        <a href="/customer" className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-sm font-medium rounded-lg transition-colors">Customer Directory</a>
                        <a href="/servicing" className="px-4 py-2 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-500/30 text-sm font-medium rounded-lg transition-colors flex items-center gap-2">🎧 Servicing</a>
                        <a href="/onboarding" className="px-4 py-2 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 text-sm font-medium rounded-lg transition-colors flex items-center gap-2">📋 Onboarding</a>
                        <a href="/credit" className="px-4 py-2 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/30 text-sm font-medium rounded-lg transition-colors flex items-center gap-2">🏦 Credit</a>
                        <a href="/compliance" className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 text-sm font-medium rounded-lg transition-colors flex items-center gap-2">🛡️ Compliance</a>
                        <a href="/campaigns" className="px-4 py-2 bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 border border-orange-500/30 text-sm font-medium rounded-lg transition-colors flex items-center gap-2">📣 Campaigns</a>
                        <a href="/wealth" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm font-medium rounded-lg transition-colors">Wealth Portfolio</a>
                    </div>
                )}

                {/* Grid Layout (Desktop: 2-3 col, Tablet: 2 col, Mobile: 1 col) */}
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min"
                    style={{
                        gridAutoFlow: 'row dense'
                    }}
                >
                    {activeDef.widgets.map((widgetConfig) => (
                        <WidgetRenderer
                            key={`${personaId}-${widgetConfig.id}`}
                            config={widgetConfig}
                            personaId={personaId}
                        />
                    ))}
                </div>

            </main>
        </div>
    );
}
