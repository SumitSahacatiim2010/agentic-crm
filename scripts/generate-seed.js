
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// --- CONSTANTS ---
const COUNT = 50;
const TIERS = ['Standard', 'Silver', 'Gold', 'Platinum', 'UHNW'];
const FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const EMPLOYMENT = ['Executive', 'Engineer', 'Teacher', 'Doctor', 'Lawyer', 'Artist', 'Consultant', 'Manager', 'Analyst', 'Director', 'Retired', 'Student'];
const NATIONALITIES = ['American', 'Canadian', 'British', 'French', 'German', 'Australian', 'Japanese', 'Singaporean'];

// --- HELPERS ---
function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

// --- GENERATION ---

const parties = [];
const individuals = [];
const financials = [];
const compliance = [];

console.log(`Generating ${COUNT} customers...`);

for (let i = 0; i < COUNT; i++) {
    const partyId = uuidv4();
    const firstName = random(FIRST_NAMES);
    const lastName = random(LAST_NAMES);
    const tier = random(TIERS);

    // 1. Party
    parties.push({
        party_id: partyId,
        party_type: 'individual'
    });

    // 2. Individual Details
    individuals.push({
        customer_id: partyId,
        full_legal_name: `${firstName} ${lastName}`,
        segment_tier: tier,
        nationality: random(NATIONALITIES),
        employment_status: random(EMPLOYMENT),
        annual_income: randomInt(50000, 5000000)
    });

    // 3. Financial Products (1-5 per customer)
    const numProducts = randomInt(1, 5);
    for (let j = 0; j < numProducts; j++) {
        const type = random(['Checking', 'Savings', 'Mortgage', 'Credit Card', 'Investment']);
        let name = `${tier} ${type}`;
        let balance = 0;

        if (type === 'Mortgage') {
            balance = -randomInt(200000, 2000000);
            name = `${random(['Hamptons', 'City', 'Lake', 'Estate'])} Mortgage`;
        } else if (type === 'Credit Card') {
            balance = -randomInt(0, 50000);
            name = `${tier} Rewards Card`;
        } else {
            balance = randomFloat(1000, 1000000);
        }

        financials.push({
            account_id: uuidv4(),
            customer_id: partyId,
            product_type: type,
            product_name: name,
            current_balance: balance,
            currency_code: 'USD',
            account_status: random(['active', 'active', 'active', 'dormant'])
        });
    }

    // 4. Compliance
    compliance.push({
        compliance_id: uuidv4(),
        customer_id: partyId,
        kyc_refresh_due_date: '2026-01-01',
        aml_risk_rating: random(['Low', 'Low', 'Low', 'Medium', 'High']),
        pep_status_flag: Math.random() > 0.95,
        fatca_classification: 'Compliant',
        crs_tax_residency: 'Reportable'
    });
}

// --- WRITE FILES ---
const outDir = path.join(__dirname, '..', 'seed');

fs.writeFileSync(path.join(outDir, 'parties.json'), JSON.stringify(parties, null, 2));
fs.writeFileSync(path.join(outDir, 'individual_parties.json'), JSON.stringify(individuals, null, 2));
fs.writeFileSync(path.join(outDir, 'financial_products.json'), JSON.stringify(financials, null, 2));
fs.writeFileSync(path.join(outDir, 'compliance_registry.json'), JSON.stringify(compliance, null, 2));

console.log(`Generated:`);
console.log(`- ${parties.length} Parties`);
console.log(`- ${individuals.length} Individuals`);
console.log(`- ${financials.length} Financial Products`);
console.log(`- ${compliance.length} Compliance Records`);
console.log(`Saved to ${outDir}`);
