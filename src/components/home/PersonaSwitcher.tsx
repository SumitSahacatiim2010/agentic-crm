"use client";

import { useEffect, useRef } from "react";
import { PersonaId, PERSONA_CONFIG } from "@/config/personaConfig";

interface PersonaSwitcherProps {
    activePersona: PersonaId;
    onChange: (personaId: PersonaId) => void;
}

export function PersonaSwitcher({ activePersona, onChange }: PersonaSwitcherProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Create array from config values
    const personas = Object.values(PERSONA_CONFIG);

    // Auto-scroll the active persona into view on mount or change
    useEffect(() => {
        if (!scrollContainerRef.current) return;

        const activeBtn = scrollContainerRef.current.querySelector('[data-active="true"]');
        if (activeBtn) {
            activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [activePersona]);

    return (
        <div className="w-full bg-slate-900 border-b border-slate-800 p-3 pt-6 lg:pt-3 shadow-md sticky top-0 z-50 overflow-hidden" id="persona-switcher-top">
            <div className="max-w-7xl mx-auto flex items-center gap-4 min-w-0">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:block shrink-0">
                    View As:
                </span>

                {/* Horizontal scrollable area */}
                <div
                    ref={scrollContainerRef}
                    className="flex flex-1 overflow-x-auto gap-2 pb-2 -mb-2 scrollbar-hide no-scrollbar snap-x"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {personas.map((persona) => {
                        const isActive = activePersona === persona.id;

                        return (
                            <button
                                key={persona.id}
                                data-active={isActive}
                                onClick={() => onChange(persona.id)}
                                title={persona.label}
                                aria-label={`Switch to ${persona.label} persona`}
                                aria-pressed={isActive}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all snap-start whitespace-nowrap shrink-0
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
                                    ${isActive
                                        ? 'bg-indigo-600 text-white shadow hover:bg-indigo-700'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}
                                `}
                            >
                                <span className={isActive ? 'text-indigo-100' : 'text-slate-400'}>
                                    {persona.icon}
                                </span>
                                {persona.shortLabel}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
