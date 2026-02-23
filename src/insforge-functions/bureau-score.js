
module.exports = async function (req) {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const data = {
        agency: 'Equifax',
        score: 84, // Business Credit Score (0-100)
        rating: 'A',
        factors: [
            { name: 'Payment History', value: 'Excellent' },
            { name: 'Credit Utilization', value: 'Low' },
            { name: 'Derogatory Marks', value: '0' }
        ],
        debtSummary: {
            totalOutstanding: 4200000,
            utilization: 12 // %
        },
        lastUpdated: new Date().toISOString()
    };

    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
    });
}
