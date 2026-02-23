'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Search, Filter, User, Building2, ChevronRight,
    MoreHorizontal, BadgeCheck, ShieldAlert
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export type CustomerSummary = {
    party_id: string;
    full_legal_name: string;
    segment_tier: string;
    nationality: string;
    employment_status: string;
    party_type: 'individual' | 'corporate';
    kyc_status?: string; // Optional if we fetch it
};

export function CustomerList({ customers }: { customers: CustomerSummary[] }) {
    const [search, setSearch] = useState('');
    const [tierFilter, setTierFilter] = useState('All');

    const filtered = customers.filter(c => {
        const matchesSearch = c.full_legal_name.toLowerCase().includes(search.toLowerCase()) ||
            c.party_id.includes(search);
        const matchesTier = tierFilter === 'All' || c.segment_tier === tierFilter;
        return matchesSearch && matchesTier;
    });

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by name or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-slate-900 border-slate-700 focus:border-indigo-500"
                    />
                </div>
                <Select value={tierFilter} onValueChange={setTierFilter}>
                    <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700">
                        <SelectValue placeholder="Filter by Tier" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Tiers</SelectItem>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Silver">Silver</SelectItem>
                        <SelectItem value="Gold">Gold</SelectItem>
                        <SelectItem value="Platinum">Platinum</SelectItem>
                        <SelectItem value="UHNW">UHNW</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((customer) => (
                    <Link href={`/customer/${customer.party_id}`} key={customer.party_id} className="group">
                        <Card className="bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-500/10">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center
                                            ${customer.party_type === 'individual' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}
                                        `}>
                                            {customer.party_type === 'individual' ? <User size={20} /> : <Building2 size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                                                {customer.full_legal_name}
                                            </h3>
                                            <p className="text-xs text-slate-500 font-mono">{customer.party_id.substring(0, 8)}...</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={`
                                        ${customer.segment_tier === 'Platinum' || customer.segment_tier === 'UHNW' ? 'border-amber-500/50 text-amber-500' : 'border-slate-700 text-slate-400'}
                                    `}>
                                        {customer.segment_tier}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
                                    <div>
                                        <span className="block text-xs text-slate-500 mb-1">Nationality</span>
                                        {customer.nationality}
                                    </div>
                                    <div>
                                        <span className="block text-xs text-slate-500 mb-1">Status</span>
                                        {customer.employment_status}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                    No customers found matching your search.
                </div>
            )}
        </div>
    );
}
