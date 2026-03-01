import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, ShieldAlert, FileText, Smartphone } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function BranchCustomer360Panel({ customerId }: { customerId: string }) {
    const { data: response, error } = useSWR(`/api/customers/${customerId}/summary`, fetcher);

    if (error) return <div className="p-4 text-red-400">Error loading Customer 360 context.</div>;
    if (!response) return <div className="p-4 text-slate-400">Loading Customer Context...</div>;

    const { customer, holdings, kyc, recentInteractions } = response.data || {};

    if (!customer) return <div className="p-4 text-slate-500">No profile link found for this item.</div>;

    const formatCurr = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <ScrollArea className="h-full">
            <div className="p-4 flex flex-col gap-6">
                <div>
                    <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase mb-3">Customer Context</h3>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                            <h2 className="text-lg font-bold text-white leading-tight">{customer.full_name}</h2>
                            <Badge className="ml-2 uppercase text-[10px]" variant={customer.tier === 'UHNW' || customer.tier === 'HNW' ? 'default' : 'secondary'}>
                                {customer.tier}
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-400 font-mono mt-1">{customer.customer_id}</p>
                    </div>
                </div>

                {/* KYC & Risk */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <ShieldAlert className="h-4 w-4 text-indigo-400" />
                            KYC Status
                        </div>
                        <span className={`text-xs font-semibold ${kyc?.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {kyc?.status || 'Missing'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Risk Rating:</span>
                        <span className="uppercase">{kyc?.risk_rating || customer.financial_health_score}</span>
                    </div>
                </div>

                {/* Holdings Summary */}
                <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4" /> Holdings Snapshot
                    </h4>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Deposits</span>
                            <span className="text-emerald-400 font-medium">{formatCurr(holdings?.totalDeposits || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Loans</span>
                            <span className="text-amber-400 font-medium">{formatCurr(holdings?.totalLoans || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Investments</span>
                            <span className="text-indigo-400 font-medium">{formatCurr(holdings?.totalInvestments || 0)}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-800 flex justify-between font-semibold mt-1">
                            <span className="text-slate-300">Net Exposure</span>
                            <span className="text-white">{formatCurr(holdings?.netWorth || 0)}</span>
                        </div>
                    </div>
                </div>

                {/* Recent Products List */}
                {holdings?.products?.length > 0 && (
                    <div>
                        <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Active Products</h4>
                        <div className="flex flex-col gap-2">
                            {holdings.products.map((p: any) => (
                                <div key={p.id} className="text-xs flex justify-between bg-slate-900/50 p-2 rounded">
                                    <span className="text-slate-300 truncate pr-2" title={p.product_catalog?.product_name}>{p.product_catalog?.product_name || 'Account'}</span>
                                    <span className="text-slate-500 font-mono">{p.account_number.slice(-4)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Interactions Activity */}
                {recentInteractions?.length > 0 && (
                    <div>
                        <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Recent Interactions</h4>
                        <div className="relative border-l border-slate-700 ml-2 pl-4 py-1 flex flex-col gap-4">
                            {recentInteractions.map((act: any) => (
                                <div key={act.id} className="relative">
                                    <div className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-slate-600 ring-4 ring-slate-900"></div>
                                    <p className="text-xs font-medium text-slate-300">{act.interaction_type || act.channel}</p>
                                    <p className="text-[10px] text-slate-500">{new Date(act.created_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}
