
const { createClient } = require('@insforge/sdk');

// Initialize Client (Mocking the Env Vars for script)
const insforgeUrl = 'https://eig7swuu.us-east.insforge.app';
const insforgeKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0OTY0OTl9.LlcAF_7hXuI9IZXR2t-UJ6KUTgdim4pzsfjjAK4zRuI';

const insforge = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeKey
});

async function testQuery() {
    console.log("Testing Party Query...");

    // Exact query from src/app/customer/page.tsx
    const { data, error } = await insforge.database
        .from('parties')
        .select(`
            party_id,
            party_type,
            individual_parties (
                full_legal_name,
                segment_tier,
                nationality,
                employment_status
            )
        `)
        .limit(3);

    if (error) {
        console.error("Query Error:", error);
    } else {
        console.log("Query Success. Row 0 structure:");
        console.log(JSON.stringify(data[0], null, 2));

        console.log("\nRow 0 individual_parties type:", typeof data[0].individual_parties);
        console.log("Is Array?", Array.isArray(data[0].individual_parties));
    }
}

testQuery();
