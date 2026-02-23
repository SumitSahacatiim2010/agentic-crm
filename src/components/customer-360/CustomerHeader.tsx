"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomerProfile, CustomerProfileType } from "@/lib/mock-data";

interface CustomerHeaderProps {
    params?: { id: string };
    id?: string;
    profile?: CustomerProfileType;
}

export function CustomerHeader({ params, id, profile: injectedProfile }: CustomerHeaderProps) {
    // Determine the customer ID from props or params
    const customerId = id || params?.id || 'CUST-001';

    // Use injected profile OR lookup from mock data
    const profile = injectedProfile || CustomerProfile[customerId] || CustomerProfile['CUST-001'];

    if (!profile) return null;

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'Platinum': return 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200';
            case 'Gold': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/20';
            case 'Silver': return 'bg-slate-400/10 text-slate-400 border-slate-400/50 hover:bg-slate-400/20';
            case 'UHNW': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/50 hover:bg-indigo-500/20';
            default: return 'bg-slate-700 text-slate-300';
        }
    };

    const getHealthColor = (score: number) => {
        if (score >= 80) return "bg-emerald-500";
        if (score >= 60) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <Card className="bg-slate-900 border-slate-800 mb-6">
            <CardContent className="p-6 flex items-start justify-between">
                <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 border-2 border-slate-700">
                        <AvatarImage src={profile.avatar_url} alt={profile.full_legal_name} />
                        <AvatarFallback>{profile.full_legal_name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-slate-50 tracking-tight">
                                {profile.full_legal_name}
                            </h1>
                            <Badge variant="outline" className={`${getTierColor(profile.tier)} px-3 py-1 text-xs uppercase tracking-wider font-semibold border`}>
                                {profile.tier}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-500">Global ID:</span>
                                <span className="font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">{profile.global_id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-500">RM:</span>
                                <span className="text-slate-300">{profile.rm_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-500">Details:</span>
                                <span className="text-slate-300">{profile.email} • {profile.phone}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 w-48">
                    <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Financial Health</span>
                        <span className={`text-xl font-bold ${profile.financial_health_score >= 80 ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {profile.financial_health_score}/100
                        </span>
                    </div>
                    <Progress value={profile.financial_health_score} className="h-2 bg-slate-800" indicatorClassName={getHealthColor(profile.financial_health_score)} />
                    <span className="text-xs text-slate-500 mt-1">
                        Top 5% of {profile.tier} Segment
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
