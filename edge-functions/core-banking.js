module.exports = async function (request) {
    if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const url = new URL(request.url);
        const accountId = url.searchParams.get('account_id');

        if (!accountId) {
            return new Response(JSON.stringify({ error: 'Missing required field: account_id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Deterministic balance based on account_id length/chars
        const balance = accountId.length * 1000 + 5420.50; // Random looking but deterministic

        return new Response(JSON.stringify({ balance, status: "active" }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid URL parameters' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
};
