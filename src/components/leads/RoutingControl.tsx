"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Network, Loader2 } from "lucide-react";
import { simulateRouting } from "@/lib/lead-mock-data";

export function RoutingControl() {
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string, detail: string } | null>(null);

    const handleSimulate = async () => {
        setLoading(true);
        setNotification(null);
        try {
            const result = await simulateRouting("demo-id");
            setNotification({
                message: `Lead Assigned to ${result.assignedTo}`,
                detail: `Reason: ${result.reason}`
            });

            // Auto dismiss
            setTimeout(() => setNotification(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <Button
                onClick={handleSimulate}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Network className="h-4 w-4 mr-2" />}
                Simulate Territory Routing
            </Button>

            {notification && (
                <div className="absolute top-12 right-0 z-50 w-80 bg-slate-900 border border-emerald-500/50 shadow-lg shadow-emerald-900/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-sm font-bold text-emerald-400 mb-1">{notification.message}</h4>
                    <p className="text-xs text-slate-300">{notification.detail}</p>
                </div>
            )}
        </div>
    );
}
