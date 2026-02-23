"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CLVProjection } from "@/lib/models/clv";
import { CLVExplainCard } from "@/components/ai-explainability/CLVExplainCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Cpu } from "lucide-react";

export function CLVWidget({ customerId }: { customerId: string }) {
    const [data, setData] = useState<CLVProjection | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCLV = async () => {
            try {
                const res = await fetch(`/api/models/clv/${customerId}`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json.data);
                }
            } catch (err) {
                console.error("Failed to load CLV", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCLV();
    }, [customerId]);

    if (loading) {
        return (
            <Card className="bg-slate-900 border-slate-800 h-full">
                <CardHeader>
                    <CardTitle className="text-slate-100 flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-indigo-400" /> Calculating Lifetime Value...
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[250px] w-full bg-slate-950 rounded-xl" />
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    return (
        <Card className="bg-slate-900 border-slate-800 h-full">
            <CardHeader className="pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-slate-100 flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-indigo-400" /> AI Valuation Model
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-1">Stochastic 5-Year Cash Flow Projection</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <CLVExplainCard clvData={data} />
            </CardContent>
        </Card>
    );
}
