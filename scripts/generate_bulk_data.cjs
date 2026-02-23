const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');
const { v4: uuidv4 } = require('uuid');

const NUM_CUSTOMERS = 5000;
const OUTPUT_DIR = path.join(__dirname, '..', 'seed', 'bulk');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helpers
const escapeCsv = (str) => {
    if (str === null || str === undefined) return '';
    const s = String(str);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
};

const writeCsv = (filename, headers, rows) => {
    const file = path.join(OUTPUT_DIR, filename);
    const headerLine = headers.join(',') + '\n';
    const dataLines = rows.map(r => headers.map(h => escapeCsv(r[h])).join(',')).join('\n');
    fs.writeFileSync(file, headerLine + dataLines);
    console.log(`Generated ${filename} with ${rows.length} rows`);
};

// Data arrays
const parties = [];
const individualParties = [];
const financialProducts = [];
const complianceRecords = [];

console.log(`Generating data for ${NUM_CUSTOMERS} customers...`);

// Generate Data
for (let i = 0; i < NUM_CUSTOMERS; i++) {
    const customerId = uuidv4();

    // Party
    parties.push({
        party_id: customerId,
        party_type: 'individual'
    });

    // Individual Party
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const isHighNetWorth = Math.random() > 0.8;

    individualParties.push({
        customer_id: customerId,
        full_legal_name: `${firstName} ${lastName}`,
        dob: faker.date.birthdate({ min: 25, max: 75, mode: 'age' }).toISOString().split('T')[0],
        nationality: faker.location.countryCode(),
        employment_status: faker.helpers.arrayElement(['Employed', 'Self-Employed', 'Retired', 'Business Owner']),
        annual_income: isHighNetWorth ? faker.number.int({ min: 200000, max: 2000000 }) : faker.number.int({ min: 50000, max: 150000 }),
        segment_tier: isHighNetWorth ? faker.helpers.arrayElement(['Platinum', 'Gold', 'UHNW']) : faker.helpers.arrayElement(['Standard', 'Silver']),
        created_at: faker.date.past({ years: 5 }).toISOString()
    });

    // Financial Products (1-4 per customer)
    const numProducts = faker.number.int({ min: 1, max: 4 });
    const productTypes = ['Checking', 'Savings', 'Mortgage', 'Credit Card', 'Investment'];

    for (let j = 0; j < numProducts; j++) {
        const pType = faker.helpers.arrayElement(productTypes);
        let balance = 0;

        if (pType === 'Mortgage' || pType === 'Credit Card') {
            balance = -1 * faker.number.int({ min: 1000, max: 500000 });
        } else {
            balance = faker.number.int({ min: 500, max: isHighNetWorth ? 5000000 : 50000 });
        }

        financialProducts.push({
            account_id: uuidv4(),
            customer_id: customerId,
            product_type: pType,
            product_name: `${pType} Account`,
            currency_code: 'USD',
            current_balance: balance,
            account_status: faker.helpers.arrayElement(['active', 'dormant']),
            created_at: new Date().toISOString()
        });
    }

    // Compliance Registry
    complianceRecords.push({
        customer_id: customerId,
        kyc_refresh_due_date: faker.date.future({ years: 2 }).toISOString().split('T')[0],
        aml_risk_rating: faker.helpers.arrayElement(['Low', 'Medium', 'High']),
        pep_status_flag: Math.random() > 0.95, // 5% chance
        crs_tax_residency: faker.location.countryCode(),
        fatca_classification: 'Compliant',
        updated_at: new Date().toISOString()
    });
}

// Write to CSV
writeCsv('bulk_parties.csv', ['party_id', 'party_type'], parties);
writeCsv('bulk_individual_parties.csv', [
    'customer_id', 'full_legal_name', 'dob', 'nationality',
    'employment_status', 'annual_income', 'segment_tier', 'created_at'
], individualParties);
writeCsv('bulk_financial_products.csv', [
    'account_id', 'customer_id', 'product_type', 'product_name',
    'currency_code', 'current_balance', 'account_status', 'created_at'
], financialProducts);
writeCsv('bulk_compliance_registry.csv', [
    'customer_id', 'kyc_refresh_due_date', 'aml_risk_rating',
    'pep_status_flag', 'crs_tax_residency', 'fatca_classification', 'updated_at'
], complianceRecords);

console.log("Bulk data generation complete!");
