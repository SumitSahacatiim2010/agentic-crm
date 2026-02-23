"use client";
import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface Props { applicationId: string; loanAmount: number; collateralValue: number; collateralType: string; onSaved: () => void; initialData?: any; }

const IS_FIELDS = [
    { key: 'revenue', label: 'Revenue' }, { key: 'cogs', label: 'Cost of Goods Sold' },
    { key: 'operating_expenses', label: 'Operating Expenses' }, { key: 'depreciation', label: 'Depreciation & Amortization' },
    { key: 'interest_expense', label: 'Interest Expense' }, { key: 'annual_debt_service', label: 'Annual Debt Service' },
    { key: 'monthly_income', label: 'Monthly Income' }, { key: 'monthly_debt', label: 'Monthly Debt Payments' },
];
const BS_FIELDS = [
    { key: 'total_assets', label: 'Total Assets' }, { key: 'total_liabilities', label: 'Total Liabilities' },
    { key: 'current_assets', label: 'Current Assets' }, { key: 'current_liabilities', label: 'Current Liabilities' },
];

function ratioStatus(val: number, goodAbove: number, warnAbove: number, higherIsBetter = true) {
    if (higherIsBetter) return val >= goodAbove ? 'pass' : val >= warnAbove ? 'warn' : 'fail';
    return val <= goodAbove ? 'pass' : val <= warnAbove ? 'warn' : 'fail';
}

function RatioCard({ label, value, unit, status }: { label: string; value: string; unit: string; status: 'pass' | 'warn' | 'fail' }) {
    const colors = { pass: 'border-emerald-700/30 bg-emerald-950/30', warn: 'border-amber-700/30 bg-amber-950/30', fail: 'border-red-700/30 bg-red-950/30' };
    const icons = { pass: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />, warn: <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />, fail: <XCircle className="h-3.5 w-3.5 text-red-400" /> };
    return (
        <div className={`rounded-xl border p-3 ${colors[status]}`}>
            <div className="flex items-center justify-between mb-1"><span className="text-[10px] text-slate-500 uppercase">{label}</span>{icons[status]}</div>
            <p className="text-lg font-bold text-white">{value}<span className="text-xs text-slate-500 ml-0.5">{unit}</span></p>
        </div>
    );
}

export function SpreadsheetPanel({ applicationId, loanAmount, collateralValue, collateralType, onSaved, initialData }: Props) {
    const init = initialData || {};
    const [vals, setVals] = useState<Record<string, number>>(() => {
        const d: Record<string, number> = {};
        [...IS_FIELDS, ...BS_FIELDS].forEach(f => d[f.key] = Number(init[f.key]) || 0);
        return d;
    });
    const [saving, setSaving] = useState(false);

    const set = useCallback((key: string, v: string) => setVals(p => ({ ...p, [key]: Number(v) || 0 })), []);

    const computed = useMemo(() => {
        const gp = vals.revenue - vals.cogs;
        const ebitda = gp - vals.operating_expenses;
        const ni = ebitda - vals.depreciation - vals.interest_expense;
        const eq = vals.total_assets - vals.total_liabilities;
        const wc = vals.current_assets - vals.current_liabilities;
        const denomDscr = vals.interest_expense + vals.annual_debt_service;
        const dscr = denomDscr > 0 ? +(ebitda / denomDscr).toFixed(3) : 0;
        const dti = vals.monthly_income > 0 ? +((vals.monthly_debt / vals.monthly_income) * 100).toFixed(2) : 0;
        const ltv = collateralValue > 0 ? +((loanAmount / collateralValue) * 100).toFixed(2) : 0;
        const cr = vals.current_liabilities > 0 ? +(vals.current_assets / vals.current_liabilities).toFixed(3) : 0;
        const de = eq > 0 ? +(vals.total_liabilities / eq).toFixed(3) : 0;
        return { gross_profit: gp, ebitda, net_income: ni, total_equity: eq, working_capital: wc, dscr, dti, ltv, cr, de };
    }, [vals, loanAmount, collateralValue]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/credit/save-spreading', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ application_id: applicationId, ...vals, loan_amount: loanAmount, collateral_value: collateralValue, collateral_type: collateralType }),
            });
            if (res.ok) { toast.success('Spreading saved'); onSaved(); }
            else toast.error('Save failed');
        } catch { toast.error('Network error'); }
        setSaving(false);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Income Statement */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Income Statement</h4>
                    {IS_FIELDS.map(f => (
                        <div key={f.key} className="flex items-center gap-2">
                            <Label className="text-[10px] text-slate-500 w-36 shrink-0">{f.label}</Label>
                            <Input type="number" value={vals[f.key] || ''} onChange={e => set(f.key, e.target.value)} className="bg-slate-950 border-slate-700 text-white h-7 text-xs font-mono" />
                        </div>
                    ))}
                    <div className="border-t border-slate-800 pt-2 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-400"><span>Gross Profit</span><span className="font-mono text-white">${computed.gross_profit.toLocaleString()}</span></div>
                        <div className="flex justify-between text-slate-400"><span>EBITDA</span><span className="font-mono text-white">${computed.ebitda.toLocaleString()}</span></div>
                        <div className="flex justify-between text-slate-400"><span>Net Income</span><span className={`font-mono ${computed.net_income >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${computed.net_income.toLocaleString()}</span></div>
                    </div>
                </div>
                {/* Balance Sheet */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Balance Sheet</h4>
                    {BS_FIELDS.map(f => (
                        <div key={f.key} className="flex items-center gap-2">
                            <Label className="text-[10px] text-slate-500 w-36 shrink-0">{f.label}</Label>
                            <Input type="number" value={vals[f.key] || ''} onChange={e => set(f.key, e.target.value)} className="bg-slate-950 border-slate-700 text-white h-7 text-xs font-mono" />
                        </div>
                    ))}
                    <div className="border-t border-slate-800 pt-2 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-400"><span>Total Equity</span><span className="font-mono text-white">${computed.total_equity.toLocaleString()}</span></div>
                        <div className="flex justify-between text-slate-400"><span>Working Capital</span><span className={`font-mono ${computed.working_capital >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${computed.working_capital.toLocaleString()}</span></div>
                    </div>
                </div>
            </div>
            {/* Ratio dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <RatioCard label="DSCR" value={computed.dscr.toFixed(2)} unit="x" status={ratioStatus(computed.dscr, 1.35, 1.20, true)} />
                <RatioCard label="DTI" value={computed.dti.toFixed(1)} unit="%" status={ratioStatus(computed.dti, 38, 43, false)} />
                <RatioCard label="LTV" value={computed.ltv.toFixed(1)} unit="%" status={ratioStatus(computed.ltv, collateralType === 'commercial' ? 60 : 70, collateralType === 'commercial' ? 70 : 80, false)} />
                <RatioCard label="Current" value={computed.cr.toFixed(2)} unit="x" status={ratioStatus(computed.cr, 1.5, 1.0, true)} />
                <RatioCard label="D/E" value={computed.de.toFixed(2)} unit="x" status={ratioStatus(computed.de, 3.0, 4.0, false)} />
            </div>
            <div className="flex justify-end"><Button className="bg-indigo-600 hover:bg-indigo-700" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Save Spreading'}</Button></div>
        </div>
    );
}
