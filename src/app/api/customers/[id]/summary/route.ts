import { NextResponse } from 'next/server';
import { insforge as insforgeClient } from '@/lib/insforge-client';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const db = insforgeClient.database;
        const customerId = params.id;

        // Parallel fetch for summary data
        const [
            customerRes,
            productsRes,
            kycRes,
            interactionsRes
        ] = await Promise.all([
            db.from('individual_parties').select('*').eq('id', customerId).single(),
            db.from('customer_products').select('*, product_catalog(product_name, product_category), account_balances(current_balance)').eq('customer_id', customerId),
            db.from('kyc_records').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }).limit(1),
            db.from('interactions').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }).limit(5)
        ]);

        if (customerRes.error) throw customerRes.error;

        // Aggregate holdings
        let totalDeposits = 0;
        let totalLoans = 0;
        let totalInvestments = 0;

        if (productsRes.data) {
            productsRes.data.forEach(p => {
                const balance = p.current_balance || p.account_balances?.[0]?.current_balance || 0;
                const cat = p.product_catalog?.product_category?.toLowerCase() || '';

                if (cat.includes('deposit') || cat.includes('saving')) totalDeposits += balance;
                else if (cat.includes('loan') || cat.includes('mortgage')) totalLoans += balance;
                else if (cat.includes('invest')) totalInvestments += balance;
            });
        }

        const summary = {
            customer: customerRes.data,
            holdings: {
                products: productsRes.data || [],
                totalDeposits,
                totalLoans,
                totalInvestments,
                netWorth: totalDeposits + totalInvestments - totalLoans // Simplistic calc
            },
            kyc: kycRes.data?.[0] || null,
            recentInteractions: interactionsRes.data || []
        };

        return NextResponse.json({ data: summary });
    } catch (e: any) {
        return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
    }
}
