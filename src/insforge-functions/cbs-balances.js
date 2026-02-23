
module.exports = async function (req) {
    // Simulate database latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const balances = {
        accounts: [
            {
                id: 'ACC-8832-US',
                type: 'Operating',
                currency: 'USD',
                ledgerBalance: 2450000.00,
                availableBalance: 2415000.00,
                status: 'Active',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'ACC-9941-EU',
                type: 'Treasury',
                currency: 'EUR',
                ledgerBalance: 1850000.00,
                availableBalance: 1850000.00,
                status: 'Active',
                lastUpdated: new Date().toISOString()
            }
        ],
        alerts: [
            {
                type: 'LARGE_CASH_TXN',
                amount: 50000,
                currency: 'USD',
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                status: 'Pending Review'
            }
        ]
    };

    return new Response(JSON.stringify(balances), {
        headers: { 'Content-Type': 'application/json' }
    });
}
