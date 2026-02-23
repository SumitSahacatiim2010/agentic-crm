"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PRODUCT_CATALOG, computePricing, computeDOALevel } from "@/lib/credit-scoring";

interface Props { applicationId: string; riskRating: number; decision: string; }

export function OfferQuotePanel({ applicationId, riskRating, decision }: Props) {
    const [product, setProduct] = useState('term_loan');
    const [term, setTerm] = useState(60);
    const [amount, setAmount] = useState('');
    const [discount, setDiscount] = useState(0);
    const [creating, setCreating] = useState(false);
    const [offer, setOffer] = useState<any>(null);

    const hasSoft = decision === 'refer';
    const pricing = useMemo(() => computePricing(product, riskRating, hasSoft), [product, riskRating, hasSoft]);
    const finalRate = useMemo(() => +(pricing.finalRate - discount).toFixed(3), [pricing, discount]);
    const doa = useMemo(() => computeDOALevel(Number(amount) || 0), [amount]);
    const doaColors: Record<string, string> = { analyst: 'text-emerald-400', senior_analyst: 'text-amber-400', committee: 'text-orange-400', board: 'text-red-400' };

    const handleCreate = async () => {
        if (!amount) { toast.error('Enter approved amount'); return; }
        setCreating(true);
        try {
            const res = await fetch('/api/credit/create-offer', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ application_id: applicationId, product_type: product, term_months: term, approved_amount: Number(amount), discount_requested: discount }),
            });
            const json = await res.json();
            if (res.ok) { setOffer(json); toast.success(`Offer created — ${json.status}`); }
            else toast.error(json.error);
        } catch { toast.error('Network error'); }
        setCreating(false);
    };

    if (offer) {
        return (
            <div className="bg-emerald-950/30 border border-emerald-700/40 rounded-xl p-5 space-y-3">
                <p className="text-sm font-bold text-emerald-300">✅ Offer Created</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><span className="text-slate-500">Final Rate</span><p className="font-mono font-bold text-white">{finalRate}%</p></div>
                    <div><span className="text-slate-500">DOA Level</span><p className={`font-bold ${doaColors[offer.doa_level_required]}`}>{offer.doa_level_required.replace('_', ' ')}</p></div>
                    <div><span className="text-slate-500">Status</span><p className="font-bold text-white">{offer.status}</p></div>
                    <div><span className="text-slate-500">Offer ID</span><p className="font-mono text-slate-400">{offer.offer_id?.slice(0, 8)}</p></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Product cards */}
            <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Select Product</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {Object.entries(PRODUCT_CATALOG).map(([k, v]) => (
                        <button key={k} onClick={() => setProduct(k)}
                            className={`text-left p-3 rounded-xl border transition-colors ${product === k ? 'border-indigo-500 bg-indigo-950/40' : 'border-slate-800 hover:border-slate-700'}`}>
                            <p className="text-xs font-semibold text-slate-200">{v.label}</p>
                            <p className="text-lg font-bold text-white">{v.baseRate}%</p>
                            <p className="text-[9px] text-slate-600">Max ${(v.maxAmount / 1_000_000).toFixed(1)}M · {v.maxTerm}mo</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Pricing breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Base Rate</span><span className="text-white">{pricing.baseRate.toFixed(2)}%</span></div>
                <div className="flex justify-between"><span className="text-slate-500">+ Risk Spread (ORR-{riskRating})</span><span className="text-amber-400">+{pricing.riskSpread.toFixed(2)}%</span></div>
                {pricing.exceptionPremium > 0 && <div className="flex justify-between"><span className="text-slate-500">+ Exception Premium</span><span className="text-red-400">+{pricing.exceptionPremium.toFixed(2)}%</span></div>}
                {discount > 0 && <div className="flex justify-between"><span className="text-slate-500">- Discount</span><span className="text-emerald-400">-{discount.toFixed(2)}%</span></div>}
                <div className="border-t border-slate-700 pt-2 flex justify-between text-base font-bold"><span className="text-white">Final Rate</span><span className="text-indigo-300">{finalRate}%</span></div>
            </div>

            {/* Terms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                    <Label className="text-xs text-slate-400">Term (months)</Label>
                    <Input type="number" value={term} onChange={e => setTerm(Number(e.target.value))} className="bg-slate-950 border-slate-700 text-white" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-slate-400">Approved Amount ($)</Label>
                    <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="bg-slate-950 border-slate-700 text-white" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-slate-400">Discount Request (%)</Label>
                    <Input type="number" step="0.05" value={discount || ''} onChange={e => setDiscount(Number(e.target.value) || 0)} className="bg-slate-950 border-slate-700 text-white" />
                </div>
            </div>

            {/* DOA */}
            <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Required Approval:</span>
                <span className={`font-bold uppercase ${doaColors[doa]}`}>{doa.replace('_', ' ')}</span>
                {doa === 'analyst' && <span className="text-emerald-400/70">(auto-approved)</span>}
            </div>

            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 font-semibold" disabled={creating || !amount} onClick={handleCreate}>
                {creating ? 'Creating…' : '📝 Create Offer'}
            </Button>
        </div>
    );
}
