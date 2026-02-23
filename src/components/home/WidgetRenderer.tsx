"use client";

import { WidgetDefinition, PersonaId } from "@/config/personaConfig";
import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

// For speed, we will export a central registry of all widgets required by the layout.
// In a real app, these would be separate files using dynamic imports.
import * as Registry from "./WidgetRegistry";

interface WidgetRendererProps {
    config: WidgetDefinition;
    personaId: PersonaId;
}

export function WidgetRenderer({ config, personaId }: WidgetRendererProps) {
    // Map component string to an actual React component from the Registry
    const Component = (Registry as any)[config.componentName];

    const colSpanClass = config.layout?.colSpan === 2
        ? "md:col-span-2 lg:col-span-2"
        : config.layout?.colSpan === 3
            ? "md:col-span-2 lg:col-span-3"
            : "col-span-1";

    const rowSpanClass = config.layout?.rowSpan === 2 ? "row-span-2" : "row-span-1";

    if (!Component) {
        // Fallback for missing/unimplemented widgets
        return (
            <div className={`${colSpanClass} ${rowSpanClass} h-full`}>
                <Card className="bg-slate-900 border-dashed border-slate-700/50 h-full flex flex-col justify-center items-center py-12">
                    <AlertCircle className="h-8 w-8 text-slate-600 mb-2" />
                    <p className="text-slate-400 font-medium text-sm">Widget Not Implemented</p>
                    <code className="text-xs text-slate-500 mt-1">{config.componentName}</code>
                </Card>
            </div>
        );
    }

    return (
        <div className={`
            ${colSpanClass} 
            ${rowSpanClass} 
            h-full flex flex-col animate-in fade-in slide-in-from-bottom-4
        `}>
            <Component title={config.title} description={config.description} personaId={personaId} />
        </div>
    );
}
