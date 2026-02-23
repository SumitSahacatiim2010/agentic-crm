"use client";

import { Button } from "@/components/ui/button";
import { Settings2, AlertTriangle, RefreshCcw } from "lucide-react";
import { useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface ChurnSimulationControlProps {
    onTriggerChurn: () => void;
}

export function ChurnSimulationControl({ onTriggerChurn }: ChurnSimulationControlProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        size="icon"
                        className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 shadow-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                        title="Dev Simulation Panel"
                    >
                        <Settings2 className="h-5 w-5" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 bg-slate-900 border-slate-800 mr-4 mb-2 p-4">
                    <h4 className="font-medium text-slate-200 mb-2 flex items-center gap-2">
                        <Settings2 className="h-4 w-4" /> Simulation Ref
                    </h4>
                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            className="w-full justify-start text-xs border-slate-700 hover:bg-red-950/30 hover:text-red-400 hover:border-red-900"
                            onClick={() => {
                                onTriggerChurn();
                                setOpen(false);
                            }}
                        >
                            <AlertTriangle className="h-3 w-3 mr-2" /> Trigger Churn Risk
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-xs text-slate-500"
                            disabled
                        >
                            <RefreshCcw className="h-3 w-3 mr-2" /> Reset State
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
