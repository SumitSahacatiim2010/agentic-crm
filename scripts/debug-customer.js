
const { createClient } = require('@insforge/sdk');

// Initialize Client
const insforgeUrl = 'https://eig7swuu.us-east.insforge.app';
const insforgeKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0OTY0OTl9.LlcAF_7hXuI9IZXR2t-UJ6KUTgdim4pzsfjjAK4zRuI';

const insforge = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeKey
});

async function debugGetCustomer360(id) {
    console.log(`Fetching Customer: ${id}`);

    try {
        const { data: partyData, error } = await insforge.database
            .from('parties')
            .select(`
                party_id,
                party_type,
                individual_parties (
                    full_legal_name,
                    segment_tier,
                    nationality,
                    employment_status,
                    annual_income
                )
            `)
            .eq('party_id', id)
            .single();

        if (error) {
            console.error("DB Error:", error);
            return;
        }

        if (!partyData) {
            console.error("No Data Found");
            return;
        }

        console.log("Raw Party Data:", JSON.stringify(partyData, null, 2));

        // Simulate the logic in mock-data.ts
        const rawInd = partyData.individual_parties;
        const ind = Array.isArray(rawInd) ? rawInd[0] : rawInd;

        console.log("Processed Individual Parties:", ind);

        if (!ind) {
            console.log("WARNING: individual_parties is null/undefined!");
        }

        const profile = {
            customer_id: partyData.party_id,
            full_legal_name: ind?.full_legal_name || "Unknown",
        };

        console.log("Constructed Profile:", profile);

    } catch (e) {
        console.error("Exception:", e);
    }
}

debugGetCustomer360('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
