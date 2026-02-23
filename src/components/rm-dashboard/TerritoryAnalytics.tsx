import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Map, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

export interface TerritorySegment {
    segment: string;
    penetration: number;
    whitespace: number;
    customers: number;
    value?: number;
    revenue?: number;
    color?: string;
    activeOpps?: number;
}

interface TerritoryAnalyticsProps {
    segments: TerritorySegment[];
}

const TIER_COLORS: Record<string, string> = {
    Standard: '#64748b', Premium: '#6366f1', HNW: '#3b82f6', UHNW: '#10b981'
};

export function TerritoryAnalytics({ segments }: TerritoryAnalyticsProps) {
    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                    <Map className="h-5 w-5 text-blue-400" />
                    Territory Analytics
                </CardTitle>
                <CardDescription className="text-slate-400">
                    Tier penetration and whitespace — live from DB
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {segments.map((item) => {
                        const color = item.color || TIER_COLORS[item.segment] || '#64748b';
                        return (
                            <Link
                                key={item.segment}
                                href={`/customer?tier=${encodeURIComponent(item.segment)}`}
                                className="block bg-slate-950/50 p-4 rounded-lg border border-slate-800/50 hover:border-slate-600 transition-colors cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-sm font-semibold text-slate-200">{item.segment}</span>
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                        <Users className="h-3 w-3" />
                                        {item.customers}
                                    </div>
                                </div>

                                <div className="mb-1 flex justify-between text-xs">
                                    <span className="text-slate-400">Penetration</span>
                                    <span className="text-white font-bold">{item.penetration}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{ width: `${item.penetration}%`, backgroundColor: color }}
                                    />
                                </div>

                                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/50">
                                    <span className="text-slate-500">Whitespace</span>
                                    <div className="flex items-center gap-1 text-emerald-400">
                                        <TrendingUp className="h-3 w-3" />
                                        {item.whitespace}% potential
                                    </div>
                                </div>
                                {(item.activeOpps !== undefined) && (
                                    <div className="text-[10px] text-slate-600 mt-1">{item.activeOpps} active opps</div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
