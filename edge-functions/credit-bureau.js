module.exports = async function (request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const body = await request.json();
        const { ssn, dob } = body;

        if (!ssn || !dob) {
            return new Response(JSON.stringify({ error: 'Missing required fields: ssn, dob' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Deterministic mock logic based on SSN last digit
        const lastDigit = parseInt(ssn.slice(-1), 10);
        const score = isNaN(lastDigit) ? 720 : 600 + (lastDigit * 20); // Range: 600 - 780
        const history = score >= 700 ? "good" : score >= 650 ? "fair" : "poor";

        return new Response(JSON.stringify({ score, history }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid JSON request' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
};
