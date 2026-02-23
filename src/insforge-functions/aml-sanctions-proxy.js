module.exports = async function (req) {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const simulateError = req.headers.get('x-simulate-error') === 'true';
    if (simulateError) {
        return new Response(JSON.stringify({ error: 'Sanctions DB Offline' }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    // Simulate 1500ms processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let body;
    try {
        body = await req.json();
    } catch (e) {
        body = {};
    }

    const fullName = (body.full_name || body.name || 'Unknown Entity').toLowerCase();

    // Deterministic hit logic
    const isHit = fullName.includes('test hit') || fullName.includes('osama') || fullName.includes('guzman');
    const inConclusive = fullName.includes('inconclusive');

    let responseData;
    if (isHit) {
        responseData = {
            status: 'HIT',
            riskScore: 'High',
            flags: [
                { source: 'OFAC', type: 'Sanctions List', match: '95%' },
                { source: 'Dow Jones', type: 'Adverse Media', match: '92%' }
            ],
            timestamp: '2026-01-01T00:00:00.000Z'
        };
    } else if (inConclusive) {
        responseData = {
            status: 'INCONCLUSIVE',
            riskScore: 'Medium',
            flags: [
                { source: 'Internal', type: 'Partial Name Match', match: '60%' }
            ],
            timestamp: '2026-01-01T00:00:00.000Z'
        };
    } else {
        responseData = {
            status: 'CLEAR',
            riskScore: 'Low',
            flags: [],
            timestamp: '2026-01-01T00:00:00.000Z'
        };
    }

    return new Response(JSON.stringify(responseData), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}
