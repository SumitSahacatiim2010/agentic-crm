module.exports = async function (req) {
    // Enable CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
    }

    if (req.method !== 'POST' && req.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    // Simulate X-Simulate-Error header or query param
    const simulateError = req.headers.get('x-simulate-error') === 'true' || new URL(req.url).searchParams.get('simulateError') === 'true';
    if (simulateError) {
        return new Response(JSON.stringify({ error: 'Core Banking API Unavailable' }), { status: 503, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    await new Promise(resolve => setTimeout(resolve, 600)); // 400-800ms latency

    let body = {};
    if (req.method === 'POST') {
        try {
            body = await req.json();
        } catch (e) {
            body = {};
        }
    }

    const accountId = body.account_id || new URL(req.url).searchParams.get('account_id') || 'ACT-DEFAULT';

    // Deterministic balance calculation
    let avBal = 24500.50;
    let lgBal = 25000.00;
    let currency = 'USD';

    if (accountId.endsWith('OD')) {
        avBal = -1200.00;
        lgBal = -800.00;
    } else if (accountId.endsWith('HNW')) {
        avBal = 1450000.00;
        lgBal = 1450000.00;
    }

    const transactions = [
        { id: 'txn1', date: '2026-02-19T00:00:00.000Z', amount: -45.00, description: 'Amazon POS', type: 'debit' },
        { id: 'txn2', date: '2026-02-18T00:00:00.000Z', amount: 2500.00, description: 'Payroll ACH', type: 'credit' }
    ];

    return new Response(JSON.stringify({
        account_id: accountId,
        currency,
        available_balance: avBal,
        ledger_balance: lgBal,
        recent_transactions: transactions
    }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}
