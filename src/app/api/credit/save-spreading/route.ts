import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';
import { computeRatios } from '@/lib/credit-scoring';

export async function POST(req: NextRequest) {
    try {
        const b = await req.json();
        if (!b.application_id) return NextResponse.json({ error: 'application_id required' }, { status: 400 });

        const gross_profit = (b.revenue || 0) - (b.cogs || 0);
        const ebitda = gross_profit - (b.operating_expenses || 0);
        const net_income = ebitda - (b.depreciation || 0) - (b.interest_expense || 0);
        const total_equity = (b.total_assets || 0) - (b.total_liabilities || 0);
        const working_cap = (b.current_assets || 0) - (b.current_liabilities || 0);

        const ratios = computeRatios(
            ebitda, b.interest_expense || 0, b.annual_debt_service || 0,
            b.monthly_debt || 0, b.monthly_income || 0,
            b.loan_amount || 0, b.collateral_value || 0,
            b.current_assets || 0, b.current_liabilities || 0,
            b.total_liabilities || 0, total_equity
        );

        const payload = {
            application_id: b.application_id,
            revenue: b.revenue || 0, cogs: b.cogs || 0, gross_profit, operating_expenses: b.operating_expenses || 0,
            ebitda, depreciation: b.depreciation || 0, interest_expense: b.interest_expense || 0, net_income,
            total_assets: b.total_assets || 0, total_liabilities: b.total_liabilities || 0, total_equity,
            current_assets: b.current_assets || 0, current_liabilities: b.current_liabilities || 0, working_capital: working_cap,
            dscr: ratios.dscr, dti_pct: ratios.dti_pct, ltv_pct: ratios.ltv_pct,
            current_ratio: ratios.current_ratio, debt_to_equity: ratios.debt_to_equity,
            annual_debt_service: b.annual_debt_service || 0, monthly_income: b.monthly_income || 0, monthly_debt: b.monthly_debt || 0,
            analyst_notes: b.analyst_notes || '', updated_at: new Date().toISOString(),
        };

        // Upsert by application_id
        const { data: existing } = await insforge.database.from('credit_financial_spreads').select('spread_id').eq('application_id', b.application_id).limit(1);
        if (existing && (existing as any[]).length > 0) {
            await insforge.database.from('credit_financial_spreads').update(payload).eq('application_id', b.application_id);
        } else {
            await insforge.database.from('credit_financial_spreads').insert([payload]);
        }
        return NextResponse.json({ ...payload, ...ratios });
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
