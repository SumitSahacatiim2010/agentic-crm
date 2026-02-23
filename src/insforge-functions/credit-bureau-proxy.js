module.exports = async function (req) {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const simulateError = req.headers.get('x-simulate-error') === 'true';
    if (simulateError) {
        return new Response(JSON.stringify({ error: 'Equifax Gateway Timeout' }), { status: 504, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    await new Promise((resolve) => setTimeout(resolve, 800)); // 800ms latency

    let body;
    try {
        body = await req.json();
    } catch (e) {
        body = {};
    }

    const ssn = body.ssn || body.national_id || 'DEFAULT';

    // Deterministic return scenario
    let score = Array.from(ssn).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 550 + 300; // 300 - 850
    let delinquencies = [];
    let fraudAlerts = [];

    if (ssn.endsWith('666')) {
        fraudAlerts.push('Synthetic ID Suspected - Discrepancy in address history.');
        score = 420;
    } else if (ssn.endsWith('123') || score < 600) {
        delinquencies.push({
            date: '2025-10-15',
            status: '60 Days Late',
            creditor: 'Capital Auto Finance'
        });
        delinquencies.push({
            date: '2024-03-01',
            status: 'Collection Account',
            creditor: 'Sprint Wireless'
        });
        if (score > 600) score = 580;
    }

    if (ssn === 'DEFAULT') {
        score = 750;
    }

    let responseData = {
        score: score,
        scoreRange: '300-850',
        bureau: 'Equifax',
        delinquencyTimeline: delinquencies,
        fraudAlerts: fraudAlerts,
        timestamp: '2026-01-01T00:00:00.000Z'
    };

    return new Response(JSON.stringify(responseData), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}
