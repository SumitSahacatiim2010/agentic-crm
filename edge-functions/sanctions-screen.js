module.exports = async function (request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const body = await request.json();
        const { name, dob, nationality } = body;

        if (!name || !dob || !nationality) {
            return new Response(JSON.stringify({ error: 'Missing required fields: name, dob, nationality' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Simulate match if name contains 'DANGER' or nationality is 'XX'
        const isMatch = name.toUpperCase().includes('DANGER') || nationality.toUpperCase() === 'XX';
        const riskLevel = isMatch ? 'high' : 'low';

        return new Response(JSON.stringify({ match: isMatch, risk_level: riskLevel }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid JSON request' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
};
