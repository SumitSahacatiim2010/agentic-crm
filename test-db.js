const { createClient } = require('@insforge/sdk');

const insforgeUrl = 'https://eig7swuu.us-east.insforge.app';
const insforgeKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0OTY0OTl9.LlcAF_7hXuI9IZXR2t-UJ6KUTgdim4pzsfjjAK4zRuI';

console.log("URL:", insforgeUrl);
console.log("Key:", insforgeKey.substring(0, 10) + '...');

const insforge = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeKey
});

async function test() {
    const { data, error } = await insforge.database
        .from('parties')
        .select('party_id, party_type')
        .limit(10);
    console.log("Data:", data);
    console.log("Error:", error);
}

test();
