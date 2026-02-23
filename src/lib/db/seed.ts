import seedrandom from 'seedrandom';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@insforge/sdk';
import * as fs from 'fs';
import * as path from 'path';

// Load Env
const envPath = path.resolve(process.cwd(), '.env.development');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        if (!line.trim() || line.startsWith('#')) return;
        const [key, ...values] = line.split('=');
        const value = values.join('=').trim().replace(/^"|"$/g, '');
        if (key) process.env[key.trim()] = value;
    });
}

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!;
const insforgeKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!;
const supabase = createClient({ baseUrl: insforgeUrl, anonKey: insforgeKey });

const random = seedrandom('banking-crm-42');

function rand(min: number, max: number) {
    return Math.floor(random() * (max - min + 1)) + min;
}

function randDec(min: number, max: number, decimals: number) {
    return parseFloat((random() * (max - min) + min).toFixed(decimals));
}

function pick<T>(arr: T[]): T {
    return arr[Math.floor(random() * arr.length)];
}

const FIRST_NAMES = [
    "Alexander", "Michael", "Dwight", "Pam", "Jim", "Stanley", "Oscar", "Angela", "Ryan", "John", "Jane", "Robert", "Mary", "William", "Patricia", "David", "Jennifer", "Richard", "Linda", "Joseph",
    "Elizabeth", "Thomas", "Barbara", "Charles", "Susan", "Christopher", "Jessica", "Daniel", "Sarah", "Matthew", "Karen", "Anthony", "Nancy", "Mark", "Lisa", "Donald", "Betty", "Steven", "Margaret", "Paul",
    "Sandra", "Andrew", "Ashley", "Joshua", "Kimberly", "Kenneth", "Emily", "Kevin", "Donna", "Brian", "Michelle", "George", "Dorothy", "Edward", "Carol", "Ronald", "Amanda", "Timothy", "Melissa", "Jason",
    "Deborah", "Jeffrey", "Stephanie", "Ryan", "Rebecca", "Jacob", "Sharon", "Gary", "Laura", "Nicholas", "Cynthia", "Eric", "Kathleen", "Jonathan", "Amy", "Stephen", "Shirley", "Larry", "Angela", "Justin",
    "Helen", "Scott", "Anna", "Brandon", "Brenda", "Benjamin", "Pamela", "Samuel", "Nicole", "Gregory", "Emma", "Frank", "Samantha", "Patrick", "Katherine", "Raymond", "Christine", "Jack", "Debra", "Dennis", "Rachel",
    "Jerry", "Catherine", "Tyler", "Carolyn", "Aaron", "Janet", "Jose", "Ruth", "Adam", "Maria", "Henry", "Heather", "Nathan", "Diane", "Douglas", "Virginia", "Zachary", "Julie", "Peter", "Joyce", "Kyle", "Victoria",
    "Walter", "Olivia", "Ethan", "Kelly", "Jeremy", "Christina", "Harold", "Lauren", "Keith", "Joan", "Christian", "Evelyn", "Roger", "Judith", "Noah", "Megan", "Gerald", "Andrea", "Carl", "Cheryl", "Terry", "Hannah",
    "Sean", "Jacqueline", "Austin", "Martha", "Arthur", "Gloria", "Lawrence", "Teresa", "Jesse", "Ann", "Dylan", "Sara", "Bryan", "Madison", "Joe", "Frances", "Jordan", "Kathryn", "Billy", "Janice", "Bruce", "Jean",
    "Albert", "Abigail", "Willie", "Alice", "Gabriel", "Julia", "Logan", "Judy", "Alan", "Grace", "Juan", "Denise", "Wayne", "Amber", "Roy", "Marilyn", "Ralph", "Beverly", "Randy", "Danielle", "Eugene", "Theresa",
    "Vincent", "Sophia", "Russell", "Marie", "Elijah", "Diana", "Louis", "Brittany", "Bobby", "Natalie", "Philip", "Isabella", "Johnny", "Charlotte", "Bradley", "Rose", "Luis", "Alexis", "Richard", "Kayla"
];

const LAST_NAMES = [
    "Sterling", "Thomas", "Scott", "Schrute", "Beesly", "Halpert", "Hudson", "Martinez", "Martin", "Howard", "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
    "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "Gomez",
    "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson",
    "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson", "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza", "Ruiz", "Hughes", "Price", "Alvarez",
    "Castillo", "Sanders", "Patel", "Myers", "Long", "Ross", "Foster", "Jimenez", "Powell", "Jenkins", "Perry", "Russell", "Sullivan", "Bell", "Coleman", "Butler", "Henderson", "Barnes", "Gonzales", "Fisher",
    "Vasquez", "Simmons", "Romero", "Jordan", "Patterson", "Alexander", "Hamilton", "Graham", "Reynolds", "Griffin", "Wallace", "Moreno", "West", "Cole", "Hayes", "Woods", "Pina", "Ford", "Luna", "Harrison"
];

const PRESERVED_NAMES = [
    "Alexander V. Sterling", // UHNW
    "Alexander Thomas", // UHNW
    "Michael Scott",
    "Dwight Schrute",
    "Pam Beesly",
    "Jim Halpert",
    "Stanley Hudson",
    "Oscar Martinez",
    "Angela Martin",
    "Ryan Howard"
];

function generateName(index: number) {
    if (index < PRESERVED_NAMES.length) return PRESERVED_NAMES[index];
    return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

async function runSeed() {
    console.log('Starting seed process...');

    // 1. INDIVIDUAL PARTIES
    const individualParties: any[] = [];
    const individualUUIDs: string[] = [];
    let counts = { Standard: 0, Premium: 0, HNW: 0, UHNW: 0 };

    for (let i = 0; i < 200; i++) {
        const isUHNW_preserved = i === 0 || i === 1; // First 2 preserved are UHNW

        let tier = '';
        if (isUHNW_preserved || counts.UHNW < 20) {
            tier = 'UHNW';
        } else if (counts.HNW < 40) {
            tier = 'HNW';
        } else if (counts.Premium < 60) {
            tier = 'Premium';
        } else {
            tier = 'Standard';
        }
        counts[tier as keyof typeof counts]++;

        const cid = `CUST-${tier}-${counts[tier as keyof typeof counts].toString().padStart(5, '0')}`;
        const id = uuidv4();
        individualUUIDs.push(id);

        // EDGE CASES: 2 PEP, 3 sanctions, 5 per lifecycle_stage, 3 at-risk declining
        let is_pep = i >= 10 && i < 12; // 2 PEP
        let is_sanctioned = i >= 12 && i < 15; // 3 sanctioned near-matches

        const lifecycle_stages = ['Prospect', 'Onboarding', 'Growth', 'Maturity', 'At-Risk', 'Dormant', 'Churned'];
        let lifecycle_stage = 'Growth';
        if (i < 5 * 7) {
            lifecycle_stage = lifecycle_stages[Math.floor(i / 5)]; // 5 of each initially
        }

        const nationalities = ['US', 'UK', 'CA', 'AU', 'IN', 'DE', 'FR', 'JP', 'SG'];

        individualParties.push({
            id,
            customer_id: cid,
            full_name: generateName(i),
            date_of_birth: new Date(new Date().setFullYear(1980 - rand(0, 30))).toISOString().split('T')[0],
            gender: pick(['Male', 'Female']),
            marital_status: pick(['Single', 'Married']),
            nationality: pick(nationalities),
            citizenship: pick(nationalities),
            ssn_national_id: `${rand(100, 999)}-${rand(10, 99)}-${rand(1000, 9999)}`,
            email: `customer${i}@example.com`,
            phone_mobile: `555-${rand(100, 999)}-${rand(1000, 9999)}`,
            employment_status: pick(['Employed', 'Self-Employed', 'Retired', 'Student']),
            annual_income: tieToTierIncomes(tier),
            education_level: pick(['Bachelors', 'Masters', 'PhD', 'High School']),
            language_preference: 'en',
            tier,
            lifecycle_stage: lifecycle_stage,
            financial_health_score: rand(50, 100),
            clv: randDec(1000, 50000, 2),
            nps_score: rand(-100, 100),
            churn_risk_score: randDec(0, 1, 4),
            assigned_rm: pick(['RM 1', 'RM 2']),
            is_pep,
            is_sanctioned,
            created_at: new Date('2025-01-01T00:00:00Z').toISOString()
        });
    }

    function tieToTierIncomes(tier: string) {
        if (tier === 'UHNW') return randDec(5000000, 20000000, 2);
        if (tier === 'HNW') return randDec(1000000, 5000000, 2);
        if (tier === 'Premium') return randDec(150000, 1000000, 2);
        return randDec(40000, 150000, 2);
    }

    // batch insert
    console.log(`Inserting 200 Individual Parties...`);
    await batchInsert('individual_parties', individualParties);

    // 2. CORPORATE PARTIES
    const corporateParties: any[] = [];
    const corporateUUIDs: string[] = [];
    for (let i = 1; i <= 15; i++) {
        const id = uuidv4();
        corporateUUIDs.push(id);
        corporateParties.push({
            id,
            entity_id: `CORP-${i.toString().padStart(5, '0')}`,
            legal_name: `${pick(LAST_NAMES)} Corp`,
            business_structure: pick(['LLC', 'Corp', 'Partnership', 'Sole']),
            incorporation_date: '2010-01-01',
            incorporation_country: 'US',
            annual_revenue: randDec(1000000, 50000000, 2),
            employee_count: rand(10, 1000),
            tier: pick(['Standard', 'Premium']),
            assigned_rm: 'RM Corp 1'
        });
    }
    await batchInsert('corporate_parties', corporateParties);

    // 3. HOUSEHOLDS & 4. MEMBERS
    const households: any[] = [];
    const household_members: any[] = [];
    for (let i = 1; i <= 30; i++) {
        const id = uuidv4();
        const primaryId = individualUUIDs[i * 2];
        const secondaryId = individualUUIDs[i * 2 + 1];

        households.push({
            id,
            household_name: `${individualParties[i * 2].full_name.split(' ').pop()} Household`,
            primary_member_id: primaryId,
            combined_income: individualParties[i * 2].annual_income + individualParties[i * 2 + 1].annual_income,
            combined_net_worth: randDec(500000, 5000000, 2)
        });

        household_members.push({ household_id: id, individual_id: primaryId, role: 'Head' });
        household_members.push({ household_id: id, individual_id: secondaryId, role: 'Co-Head' });
    }
    await batchInsert('households', households);
    await batchInsert('household_members', household_members);

    // 5. PRODUCT CATALOG
    const productCatalog: any[] = [];
    const prodCategories = ['Deposits', 'Loans', 'Investments', 'Cards', 'Insurance'];
    const prodUUIDs: string[] = [];
    let prodIdx = 1;
    prodCategories.forEach(cat => {
        for (let i = 0; i < 4; i++) { // 4 per category = 20 total
            const id = uuidv4();
            prodUUIDs.push(id);
            productCatalog.push({
                id,
                product_name: `${cat} Product ${i + 1}`,
                product_category: cat,
                product_type: cat,
                status: 'Active',
                interest_rate: randDec(0.01, 0.05, 4),
                min_balance: randDec(100, 1000, 2)
            });
            prodIdx++;
        }
    });
    await batchInsert('product_catalog', productCatalog);

    // 6. CUSTOMER PRODUCTS
    const customerProducts: any[] = [];
    const customerProdUUIDs: string[] = [];
    let cpCounter = 1;
    for (let i = 0; i < 200; i++) {
        const numProd = rand(2, 4); // 2-4 per customer = 400-800
        for (let p = 0; p < numProd; p++) {
            const id = uuidv4();
            customerProdUUIDs.push(id);

            // EDGE CASE: 2 dormant accounts > 6 months
            let status = 'Active';
            let closing = null;
            if (cpCounter <= 2) {
                status = 'Dormant';
            }

            customerProducts.push({
                id,
                customer_id: individualUUIDs[i],
                product_id: pick(prodUUIDs),
                account_number: `ACC-${cpCounter.toString().padStart(6, '0')}`,
                opening_date: '2023-01-15',
                status,
                current_balance: randDec(100, 50000, 2),
                available_balance: randDec(100, 50000, 2)
            });
            cpCounter++;
        }
    }
    await batchInsert('customer_products', customerProducts);

    // 6.5 ACCOUNT BALANCES & TRANSACTIONS
    const accountBalances: any[] = [];
    const transactions: any[] = [];
    for (let i = 0; i < customerProducts.length; i++) {
        const cp = customerProducts[i];
        accountBalances.push({
            id: uuidv4(),
            customer_product_id: cp.id,
            snapshot_date: new Date().toISOString().split('T')[0],
            current_balance: cp.current_balance,
            available_balance: cp.available_balance,
            average_daily_balance: cp.current_balance * 0.9
        });

        // Add 2-5 transactions per product
        const numTx = rand(2, 5);
        for (let t = 0; t < numTx; t++) {
            transactions.push({
                id: uuidv4(),
                customer_product_id: cp.id,
                transaction_date: new Date(new Date().setDate(new Date().getDate() - rand(1, 30))).toISOString(),
                amount: randDec(10, 500, 2),
                transaction_type: pick(['Debit', 'Credit']),
                description: pick(['Point of Sale', 'Online Transfer', 'ATM Withdrawal', 'Direct Deposit']),
                category: pick(['Retail', 'Food', 'Utilities', 'Income']),
                merchant: pick(['Amazon', 'Starbucks', 'Whole Foods', 'Target', null]),
                balance_after: cp.current_balance
            });
        }
    }
    await batchInsert('account_balances', accountBalances);
    await batchInsert('transactions', transactions);

    // 7. INTERACTIONS
    const interactions: any[] = [];
    for (let i = 0; i < 200; i++) {
        const numInt = rand(5, 10);
        for (let x = 0; x < numInt; x++) {
            interactions.push({
                id: uuidv4(),
                customer_id: individualUUIDs[i],
                channel: pick(['Branch', 'Phone', 'Web', 'Mobile']),
                direction: pick(['Inbound', 'Outbound']),
                interaction_type: pick(['Meeting', 'Call', 'Transaction']),
                sentiment: pick(['Positive', 'Neutral', 'Negative']),
                sentiment_score: randDec(0, 1, 2),
                agent_id: 'Agent 1',
                created_at: new Date('2025-02-10T10:00:00Z').toISOString()
            });
        }
    }
    await batchInsert('interactions', interactions);

    // 8. LEADS
    const leads: any[] = [];
    let leadsAdded = { Hot: 0, Warm: 0, Cold: 0 };
    for (let i = 1; i <= 50; i++) {
        let rating = '';
        if (leadsAdded.Hot < 12) rating = 'Hot';
        else if (leadsAdded.Warm < 18) rating = 'Warm';
        else rating = 'Cold';
        leadsAdded[rating as keyof typeof leadsAdded]++;

        leads.push({
            id: uuidv4(),
            full_name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
            email: `lead${i}@example.com`,
            phone: `555-000-${i.toString().padStart(4, '0')}`,
            source_channel: pick(['Web', 'Branch', 'Marketing', 'Partner']),
            lead_rating: rating,
            product_interest: pick(['Savings Account', 'Fixed Deposit', 'Mortgage', 'Auto Loan', 'Investment Portfolio']),
            qualification_stage: 'Suspect',
            status: 'New'
        });
    }
    await batchInsert('leads', leads);

    // 9. OPPORTUNITIES
    const opps: any[] = [];
    const stages = [
        { name: 'Prospecting', count: 12 },
        { name: 'Qualification', count: 13 },
        { name: 'Needs Analysis', count: 9 },
        { name: 'Proposal', count: 15 },
        { name: 'Negotiation', count: 14 },
        { name: 'Completed', count: 10 },
        { name: 'Closed-Lost', count: 7 }
    ];
    let oppIdx = 1;
    stages.forEach(s => {
        for (let i = 0; i < s.count; i++) {
            opps.push({
                id: uuidv4(),
                deal_name: `Deal ${oppIdx}`,
                customer_id: pick(individualUUIDs),
                product_type: pick(prodCategories),
                deal_value: randDec(5000, 100000, 2),
                probability: rand(10, 90),
                pipeline_stage: s.name,
                assigned_rm: 'RM 1'
            });
            oppIdx++;
        }
    });
    await batchInsert('opportunities', opps);

    // 10. SERVICE CASES
    const cases: any[] = [];
    const casePrios = [
        { p: 'P1-Critical', count: 3 },
        { p: 'P2-High', count: 8 },
        { p: 'P3-Medium', count: 12 },
        { p: 'P4-Low', count: 7 }
    ];
    const subjects = ['Fraud Alert', 'Lost Card', 'Loan Inquiry', 'Address Change', 'Document Verification', 'Fee Dispute', 'Technical Support', 'Mobile App Access'];
    let caseIdx = 1001;
    casePrios.forEach(cp => {
        for (let c = 0; c < cp.count; c++) {
            let slb = false;
            if (caseIdx === 1026) slb = true; // EDGE CASE: 1 sla_breached
            cases.push({
                id: uuidv4(),
                case_number: `CAS-${caseIdx}`,
                customer_id: pick(individualUUIDs),
                subject: pick(subjects),
                channel: pick(['Web', 'Mobile', 'Phone', 'Branch']),
                priority: cp.p,
                status: 'Open',
                case_type: 'Service Request',
                sla_target_hours: 24,
                sla_breached: slb,
                assigned_agent: 'Agent 1'
            });
            caseIdx++;
        }
    });
    await batchInsert('service_cases', cases);

    // 11. CREDIT APPLICATIONS
    const credits: any[] = [];
    for (let i = 1; i <= 20; i++) {
        credits.push({
            id: uuidv4(),
            application_number: `CA-${i.toString().padStart(5, '0')}`,
            applicant_name: individualParties[i].full_name,
            customer_id: individualParties[i].id,
            loan_type: pick(['Term Loan', 'Line of Credit', 'Mortgage', 'Auto', 'Personal']),
            requested_amount: randDec(10000, 500000, 2),
            fico_score: rand(600, 800),
            route_type: 'Standard',
            status: 'Pending Triage',
            spreading_data: {
                "income_statement": { "revenue": rand(100, 500) * 1000, "cogs": rand(50, 100) * 1000, "opex": 20000, "depreciation": 5000, "interest": 1000, "annual_debt_service": 12000, "monthly_income": 8000, "monthly_debt_payments": 1000 },
                "balance_sheet": { "total_assets": 500000, "liabilities": 200000, "current_assets": 100000, "current_liabilities": 50000 }
            }
        });
    }
    await batchInsert('credit_applications', credits);

    // 12. KYC & AML
    const kycs: any[] = [];
    const amls: any[] = [];
    for (let i = 0; i < 200; i++) {
        kycs.push({
            id: uuidv4(),
            customer_id: individualParties[i].id,
            kyc_level: pick(['Standard', 'Simplified', 'Enhanced']),
            completion_date: '2025-01-01',
            next_refresh_date: (i < 25) ? '2025-02-15' : '2026-01-01', // 25 due for refresh early
            status: 'Active',
            risk_rating: pick(['Low', 'Medium', 'High'])
        });
    }
    await batchInsert('kyc_records', kycs);

    for (let i = 0; i < 15; i++) {
        amls.push({
            id: uuidv4(),
            customer_id: individualParties[i].id,
            alert_type: pick(['Transaction Monitoring', 'Sanctions Hit', 'Adverse Media']),
            severity: pick(['Low', 'Medium', 'High', 'Critical']),
            status: (i < 10) ? 'Closed-False Positive' : 'Under Investigation'
        });
    }
    await batchInsert('aml_alerts', amls);

    // 13. KNOWLEDGE ARTICLES
    const articles: any[] = [];
    const artCats = ['Onboarding', 'Security', 'Mortgages', 'Wealth', 'Compliance', 'General'];
    for (let i = 1; i <= 50; i++) {
        articles.push({
            article_id: uuidv4(),
            title: `How to ${pick(['rebalance', 'secure', 'manage', 'update', 'apply for'])} your ${pick(['portfolio', 'account', 'mortgage', 'KYC', 'profile'])}`,
            content: `Standard Operating Procedure for ${pick(artCats)}. Full documentation following regulatory guidelines for Phase 4.`,
            category: pick(artCats),
            status: 'Active',
            tags: [pick(artCats), 'SOP', 'P4'],
            view_count: rand(10, 500),
            helpful_score: rand(1, 100),
            regulatory_approved: true
        });
    }
    await batchInsert('knowledge_articles', articles);

    // 14. MARKETING JOURNEYS
    const journeys: any[] = [];
    for (let i = 1; i <= 10; i++) {
        journeys.push({
            journey_id: uuidv4(),
            name: `${pick(['Wealth Max', 'Young Saver', 'Mortgage Pro', 'Digital Native'])} Campaign ${i}`,
            description: `Automated ${pick(['nurture', 'upsell', 'welcome'])} journey for ${pick(['Retail', 'Wealth', 'HNW'])} customers.`,
            status: pick(['Active', 'Draft']),
            campaign_type: pick(['Email', 'Multi-channel', 'Social']),
            created_at: new Date('2025-01-15T00:00:00Z').toISOString()
        });
    }
    await batchInsert('marketing_journeys', journeys);

    // 15. AUDIT TRAIL
    const audits: any[] = [];
    for (let i = 0; i < 200; i++) {
        audits.push({
            id: uuidv4(),
            entity_type: pick(['customer', 'lead', 'opportunity', 'case', 'credit']),
            entity_id: individualParties[i].id,
            action: pick(['CREATE', 'UPDATE', 'READ']),
            performed_by: 'system',
            created_at: new Date('2025-01-01T00:00:00Z').toISOString()
        });
    }
    await batchInsert('audit_trail', audits);

    console.log('Validating tables count...');
    const res = await supabase.database.from('individual_parties').select('*', { count: 'exact', head: true });
    console.log('Individual Parties:', res.count);

    console.log('Seed completed perfectly.');
}

async function batchInsert(table: string, data: any[]) {
    const BATCH_SIZE = 100;
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const chunk = data.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.database.from(table).insert(chunk);
        if (error) {
            console.error(`Error inserting into ${table}:`, error);
            throw error;
        }
    }
    console.log(`✓ Seeded ${data.length} records into ${table}`);
}

runSeed().catch(err => {
    console.error(err);
    process.exit(1);
});
