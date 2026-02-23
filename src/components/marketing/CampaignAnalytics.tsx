"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CAMPAIGN_METRICS, AB_TEST_RESULTS } from "@/lib/marketing-mock-data";
import { TrendingUp, Target } from "lucide-react";

interface DailyMetric { day: string; channel: string; sent: number; suppressed: number; }

// Pure SVG sparkline — no charting library
function FatigueChart({ data }: { data: DailyMetric[] }) {
    // Aggregate by day (sum across channels)
    const byDay: Record<string, { sent: number; sup: number }> = {};
    for (const d of data) {
        const key = d.day;
        if (!byDay[key]) byDay[key] = { sent: 0, sup: 0 };
        byDay[key].sent += Number(d.sent);
        byDay[key].sup += Number(d.suppressed);
    }
    const days = Object.keys(byDay).sort();
    if (days.length < 2) return <p className="text-xs text-slate-600 text-center py-4">Insufficient data for chart</p>;

    const maxVal = Math.max(...days.map(d => byDay[d].sent + byDay[d].sup), 1);
    const W = 700, H = 160, P = 36;
    const xStep = (W - P * 2) / (days.length - 1);

    const toY = (v: number) => H - P - ((v / maxVal) * (H - P * 2));
    const sentPts = days.map((d, i) => `${P + i * xStep},${toY(byDay[d].sent)}`).join(' ');
    const supPts = days.map((d, i) => `${P + i * xStep},${toY(byDay[d].sup)}`).join(' ');

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-h-[180px]">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(pct => {
                    const y = H - P - pct * (H - P * 2);
                    return <line key={pct} x1={P} y1={y} x2={W - P} y2={y} stroke="#1e293b" strokeWidth="1" />;
                })}
                {/* Y-axis labels */}
                {[0, 0.5, 1].map(pct => {
                    const y = H - P - pct * (H - P * 2);
                    return <text key={`yl-${pct}`} x={P - 6} y={y + 3} textAnchor="end" className="fill-slate-600" fontSize="9">{Math.round(maxVal * pct)}</text>;
                })}
                {/* Sent line */}
                <polyline points={sentPts} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
                {/* Suppressed line */}
                <polyline points={supPts} fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4,3" strokeLinejoin="round" />
                {/* X-axis labels */}
                {days.filter((_, i) => i % Math.max(1, Math.floor(days.length / 6)) === 0).map((d, i, arr) => {
                    const idx = days.indexOf(d);
                    const x = P + idx * xStep;
                    return <text key={d} x={x} y={H - 8} textAnchor="middle" className="fill-slate-600" fontSize="8">{d.slice(5)}</text>;
                })}
                {/* Legend */}
                <line x1={P} y1={12} x2={P + 20} y2={12} stroke="#6366f1" strokeWidth="2" />
                <text x={P + 24} y={15} className="fill-slate-400" fontSize="9">Sent</text>
                <line x1={P + 70} y1={12} x2={P + 90} y2={12} stroke="#f43f5e" strokeWidth="2" strokeDasharray="4,3" />
                <text x={P + 94} y={15} className="fill-slate-400" fontSize="9">Suppressed</text>
            </svg>
        </div>
    );
}

export function CampaignAnalytics() {
    const [chartData, setChartData] = useState<DailyMetric[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/marketing/analytics-timeseries')
            .then(r => r.json())
            .then(d => { setChartData(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-slate-400 uppercase">Return on Ad Spend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-2xl font-bold text-emerald-400">{CAMPAIGN_METRICS.roas}x</div>
                            <div className="text-xs text-emerald-500 flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" /> +12%
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-slate-400 uppercase">CPA</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-200">${CAMPAIGN_METRICS.costPerAcquisition}</div>
                        <div className="text-xs text-slate-500">Target: $50.00</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-slate-400 uppercase">Delivery Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-200">{CAMPAIGN_METRICS.deliveryRate}%</div>
                        <Progress value={98.5} className="h-1 mt-2 bg-slate-800" />
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-slate-400 uppercase">Click-Through</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-200">{CAMPAIGN_METRICS.clickThroughRate}%</div>
                        <div className="text-xs text-slate-500">Avg: 2.1%</div>
                    </CardContent>
                </Card>
            </div>

            {/* P7: Fatigue/Suppression Time-Series Chart */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-slate-100 text-lg">Fatigue & Suppression Trends</CardTitle>
                    <CardDescription>30-day daily view — messages sent vs suppressed across all channels</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="h-40 flex items-center justify-center text-slate-600 text-sm">Loading chart data…</div>
                    ) : (
                        <FatigueChart data={chartData} />
                    )}
                </CardContent>
            </Card>

            {/* Deep Dive & A/B Testing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-100 text-lg">A/B Test Results</CardTitle>
                        <CardDescription>Subject Line Optimization Experiment</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Variant A: &quot;{AB_TEST_RESULTS.variantA.label}&quot;</span>
                                <span className="text-slate-200 font-bold">{AB_TEST_RESULTS.variantA.conversion}% Conv.</span>
                            </div>
                            <Progress value={35} className="h-2 bg-slate-800" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-indigo-400 font-medium">Variant B: &quot;{AB_TEST_RESULTS.variantB.label}&quot;</span>
                                <span className="text-emerald-400 font-bold">{AB_TEST_RESULTS.variantB.conversion}% Conv.</span>
                            </div>
                            <Progress value={85} className="h-2 bg-slate-800" />
                        </div>
                        <div className="bg-emerald-900/20 border border-emerald-900/50 p-3 rounded text-sm text-emerald-300 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            <strong>Statistical Significance Reached:</strong> Variant B is the winner with {AB_TEST_RESULTS.confidence}% confidence.
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-100 text-lg">Actionable Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4 text-sm text-slate-300">
                            <li className="flex gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
                                <span>Move budget to <strong>Mobile Push</strong> channel (CPA $12 vs $45 avg).</span>
                            </li>
                            <li className="flex gap-3">
                                <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5" />
                                <span>Re-engage &quot;Dead Leads&quot; segment; 15% visited pricing page last week.</span>
                            </li>
                            <li className="flex gap-3">
                                <div className="h-2 w-2 rounded-full bg-rose-500 mt-1.5" />
                                <span>High unsubscribe rate on &quot;Tuesday Newsletter&quot;. Consider reducing frequency.</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Added Segment Drill Down Block (BUG-028M) */}
                <Card className="bg-slate-900 border-slate-800 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-slate-100 text-lg">Segment Drill-Down</CardTitle>
                        <CardDescription>Breakdown by Audience Persona</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-sm text-left text-slate-300">
                                <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                                    <tr>
                                        <th className="px-4 py-3">Persona Segment</th>
                                        <th className="px-4 py-3">Reached</th>
                                        <th className="px-4 py-3">Clicks</th>
                                        <th className="px-4 py-3">Conversion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-800 hover:bg-slate-800/50">
                                        <td className="px-4 py-3 font-medium">Retail Deposits</td>
                                        <td className="px-4 py-3">45,200</td>
                                        <td className="px-4 py-3">3,204 (7.1%)</td>
                                        <td className="px-4 py-3 text-emerald-400">12.5%</td>
                                    </tr>
                                    <tr className="border-b border-slate-800 hover:bg-slate-800/50">
                                        <td className="px-4 py-3 font-medium">SMB Lending</td>
                                        <td className="px-4 py-3">12,500</td>
                                        <td className="px-4 py-3">1,400 (11.2%)</td>
                                        <td className="px-4 py-3 text-emerald-400">18.2%</td>
                                    </tr>
                                    <tr className="hover:bg-slate-800/50">
                                        <td className="px-4 py-3 font-medium">Wealth Clients</td>
                                        <td className="px-4 py-3">5,800</td>
                                        <td className="px-4 py-3">1,120 (19.3%)</td>
                                        <td className="px-4 py-3 text-emerald-400">24.5%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* Added Funnel Visualization (BUG-029) */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-slate-100 text-lg">Conversion Funnel</CardTitle>
                    <CardDescription>End-to-end journey tracking</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center text-center">
                        <div className="flex-1 bg-slate-950 border border-slate-800 w-full p-4 rounded-xl">
                            <p className="text-xs text-slate-400 mb-2 uppercase">1. Segment Sent</p>
                            <p className="text-3xl font-bold text-slate-200">125,000</p>
                        </div>
                        <div className="h-8 w-[2px] md:h-[2px] md:w-8 bg-slate-700 my-auto" />
                        <div className="flex-1 bg-slate-950 border border-slate-800 w-full p-4 rounded-xl">
                            <p className="text-xs text-slate-400 mb-2 uppercase">2. Delivered</p>
                            <p className="text-3xl font-bold text-slate-200">123,125</p>
                            <p className="text-[10px] text-emerald-500 mt-1">98.5% Delivery Rate</p>
                        </div>
                        <div className="h-8 w-[2px] md:h-[2px] md:w-8 bg-slate-700 my-auto" />
                        <div className="flex-1 bg-slate-950 border border-slate-800 w-full p-4 rounded-xl">
                            <p className="text-xs text-slate-400 mb-2 uppercase">3. Engaged</p>
                            <p className="text-3xl font-bold text-indigo-400">8,618</p>
                            <p className="text-[10px] text-emerald-500 mt-1">7.0% Click Rate</p>
                        </div>
                        <div className="h-8 w-[2px] md:h-[2px] md:w-8 bg-slate-700 my-auto" />
                        <div className="flex-1 bg-emerald-950/20 border border-emerald-900/50 w-full p-4 rounded-xl">
                            <p className="text-xs text-emerald-400 mb-2 uppercase">4. Converted</p>
                            <p className="text-3xl font-bold text-emerald-300">1,240</p>
                            <p className="text-[10px] text-emerald-500 mt-1">14.4% Conversion Rate</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
