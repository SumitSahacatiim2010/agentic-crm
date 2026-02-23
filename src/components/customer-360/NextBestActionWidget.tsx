"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { NBARecommendation } from "@/lib/nba/engine";
import { NBAExplainCard } from "@/components/ai-explainability/NBAExplainCard";
import { toast } from "sonner";

export function NextBestActionWidget({ customerId }: { customerId: string }) {
    const [offers, setOffers] = useState<NBARecommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [hiddenOffers, setHiddenOffers] = useState<string[]>([]);

    useEffect(() => {
        const loadOffers = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/nba/recommendations/${customerId}`);
                if (res.ok) {
                    const data = await res.json();
                    setOffers(data.data || []);
                }
            } catch (err) {
                console.error("Failed to load NBAs", err);
            } finally {
                setLoading(false);
            }
        };
        loadOffers();
    }, [customerId]);

    const handleAccept = async (offer: NBARecommendation) => {
        setHiddenOffers(prev => [...prev, offer.product?.id]);

        try {
            await fetch('/api/opportunities/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: customerId,
                    title: `NBA Auto-Gen: ${offer.product?.product_name}`,
                    stage: 'Prospecting',
                    projected_value: 50000,
                    probability: 20,
                    expected_close_date: new Date(Date.now() + 30 * 86400 * 1000).toISOString().split('T')[0]
                })
            });
            toast.success("Opportunity Created", { description: `${offer.product?.product_name} added to pipeline.` });
        } catch (e) {
            toast.error("Failed to create opportunity");
        }
    };

    const handleDefer = (offer: NBARecommendation) => {
        setHiddenOffers(prev => [...prev, offer.product?.id]);
        toast.info("Follow-up deferred", { description: "Snoozed for 14 days." });
    };

    const handleDismiss = (offer: NBARecommendation) => {
        setHiddenOffers(prev => [...prev, offer.product?.id]);
        toast("Offer dismissed from feed.");
    };

    if (loading) {
        return (
            <Card className="bg-slate-950 border-slate-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-400" /> AI Insights Loading...
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-[250px] w-full bg-slate-900 rounded-xl" />
                    <Skeleton className="h-[250px] w-full bg-slate-900 rounded-xl" />
                </CardContent>
            </Card>
        );
    }

    const visibleOffers = offers.filter(o => !hiddenOffers.includes(o.product?.id));

    if (visibleOffers.length === 0) {
        return (
            <Card className="bg-slate-950 border-slate-800">
                <CardContent className="p-6 text-center text-slate-500">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-slate-700" />
                    <p>No actionable insights at this time.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-950 border border-slate-800 shadow-xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-800/50 bg-slate-900/20">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-400 fill-purple-400/20 animate-pulse" />
                        Next Best Actions
                    </CardTitle>
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                        Rule-Based V1
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4 bg-slate-950">
                {visibleOffers.map((offer) => (
                    <NBAExplainCard
                        key={offer.product?.id}
                        recommendation={offer}
                        onAccept={() => handleAccept(offer)}
                        onDefer={() => handleDefer(offer)}
                        onDismiss={() => handleDismiss(offer)}
                    />
                ))}
            </CardContent>
        </Card>
    );
}
