
module.exports = async function (req) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let body;
    try {
        body = await req.json();
    } catch (e) {
        body = {};
    }

    const name = body.name || 'Unknown Entity';

    // Deterministic hit logic for testing
    const isHit = name.toLowerCase() === 'test hit';

    let responseData;
    if (isHit) {
        responseData = {
            status: 'HIT',
            riskScore: 'High',
            flags: [
                { source: 'OFAC', type: 'Sanctions List', match: '88%' },
                { source: 'Dow Jones', type: 'Adverse Media', match: '92%' }
            ],
            timestamp: '2025-01-01T00:00:00.000Z' // Deterministic timestamp
        };
    } else {
        responseData = {
            status: 'CLEAR',
            riskScore: 'Low',
            flags: [],
            timestamp: '2025-01-01T00:00:00.000Z' // Deterministic timestamp
        };
    }

    return new Response(JSON.stringify(responseData), {
        headers: { 'Content-Type': 'application/json' }
    });
}
