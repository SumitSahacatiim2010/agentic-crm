const { createClient } = require('@insforge/sdk');

// Must provide URL and ANON KEY explicitly for CLI usage
const url = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eig7swuu.us-east.insforge.app';
const key = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0OTY0OTl9.LlcAF_7hXuI9IZXR2t-UJ6KUTgdim4pzsfjjAK4zRuI';

if (!url || !key) {
    console.error("Missing DB credentials in .env.local");
    process.exit(1);
}

const insforge = createClient({ baseUrl: url, anonKey: key });

// Deterministic PRNG
let seedValue = 123456789;
function seedRandom() {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
}

function randInt(min, max) {
    return Math.floor(seedRandom() * (max - min + 1)) + min;
}

function randItem(arr) {
    return arr[randInt(0, arr.length - 1)];
}

// Deterministic UUID generator starting from a stable prefix
let uuidCounter = 1;
function genUUID(prefix = '00000000-0000-4000-8000') {
    const hex = (uuidCounter++).toString(16).padStart(12, '0');
    return `${prefix}-${hex}`;
}

const FIRST_NAMES = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Margaret", "Matthew", "Lisa", "Anthony", "Betty", "Donald", "Dorothy", "Alexander", "Elena", "Marcus", "Sophia", "Oliver", "Emma"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Sterling", "Rossi", "Chen", "Patel"];
const CORPORATE_NAMES = ["TechFlow Systems", "Omega Corp", "Apex Industries", "Nexus Global", "Quantum Logistics", "Vertex Solutions", "Zenith Capital", "Silverline Properties", "Pinnacle Health", "Meridian Ventures"];

const TIERS = ["Standard", "Premium", "HNW", "UHNW"];

const baseDate = new Date('2026-01-01T00:00:00Z').getTime();

async function runSeed() {
    console.log("Starting Deterministic Seeder...");

    // 1. Generate 200 Parties
    const parties = [];
    const individualParties = [];
    const corporateParties = [];
    const complianceProfiles = [];

    // Ensure Bug-04 fix/demo specific users (Alexander Sterling, TechFlow)
    for (let i = 0; i < 200; i++) {
        const pId = genUUID('a0000000-0000-4000-8000');
        const isCorp = i % 10 === 0;

        parties.push({
            party_id: pId,
            party_type: isCorp ? 'corporate' : 'individual',
            status: 'active'
        });

        if (isCorp) {
            const companyBase = i === 0 ? "TechFlow Systems" : randItem(CORPORATE_NAMES);
            corporateParties.push({
                party_id: pId,
                company_name: i === 0 ? "TechFlow Systems" : `${companyBase} ${i}`,
                registration_number: `REG-${10000 + i}`,
                industry: randItem(["Technology", "Healthcare", "Real Estate", "Manufacturing", "Retail / SME"]),
                annual_revenue: randInt(1, 50) * 1000000,
                company_type: randItem(["LLC", "Public", "Private"])
            });
        } else {
            const fName = i === 1 ? "Alexander" : randItem(FIRST_NAMES);
            const lName = i === 1 ? "Sterling" : randItem(LAST_NAMES);
            let tier = randItem(TIERS);
            if (i === 1) tier = "UHNW";

            individualParties.push({
                party_id: pId,
                first_name: fName,
                last_name: lName,
                full_legal_name: i === 1 ? "Alexander V. Sterling" : `${fName} ${lName}`,
                date_of_birth: `19${randInt(50, 99)}-0${randInt(1, 9)}-1${randInt(0, 9)}`,
                nationality: randItem(["US", "UK", "CA", "AU"]),
                employment_status: randItem(["Employed", "Self-Employed", "Retired"]),
                segment_tier: tier
            });
        }

        complianceProfiles.push({
            compliance_id: genUUID('b0000000-0000-4000-8000'),
            party_id: pId,
            kyc_status: randItem(['approved', 'approved', 'approved', 'pending', 'rejected']),
            aml_risk_rating: isCorp || i === 1 ? 'High' : randItem(['Low', 'Low', 'Medium', 'High']),
            fatca_crs_status: randItem(['W9', 'W8BEN']),
            pep_status: i % 25 === 0
        });
    }

    console.log("Inserting Parties...");
    const { error: pErr } = await insforge.database.from('parties').upsert(parties);
    if (pErr) { console.error("Error inserting parties:", pErr); return; }

    console.log("Inserting Individuals...");
    await insforge.database.from('individual_parties').upsert(individualParties);
    console.log("Inserting Corporates...");
    await insforge.database.from('corporate_parties').upsert(corporateParties);
    console.log("Inserting Compliance...");
    await insforge.database.from('compliance_profiles').upsert(complianceProfiles);

    // 3. Generate 80 Opportunities
    const opps = [];
    const STAGES = ["Prospecting", "Qualification", "Needs Analysis", "Proposal", "Negotiation", "Closed-Won", "Closed-Lost"];
    for (let i = 0; i < 80; i++) {
        const pId = randItem(parties).party_id;
        const stage = randItem(STAGES);
        opps.push({
            opportunity_id: genUUID('c0000000-0000-4000-8000'),
            customer_id: pId,
            title: `Q${randInt(1, 4)} Expansion - ${randItem(["Treasury", "Lending", "Wealth Management"])}`,
            stage: stage,
            projected_value: randInt(10, 500) * 10000,
            probability: stage === "Closed-Won" ? 100 : (stage === "Closed-Lost" ? 0 : randInt(10, 90)),
            expected_close_date: new Date(baseDate + randInt(0, 90) * 86400000).toISOString(),
            win_loss_reason: stage === "Closed-Won" ? "Superior relationship" : (stage === "Closed-Lost" ? "Pricing constraints" : null)
        });
    }
    console.log("Inserting Opportunities...");
    await insforge.database.from('sales_opportunities').upsert(opps);

    // 4. Generate 500 Interactions
    const interactions = [];
    for (let i = 0; i < 500; i++) {
        const pId = randItem(parties).party_id;
        interactions.push({
            interaction_id: genUUID('d0000000-0000-4000-8000'),
            party_id: pId,
            type: randItem(["Call", "Email", "Meeting", "Portal"]),
            channel: randItem(["Inbound", "Outbound", "Branch"]),
            summary: `Discussed ${randItem(['portfolio rebalancing', 'loan application', 'onboarding requirements', 'card dispute', 'market volatility'])}. Client requested follow-up.`,
            interaction_date: new Date(baseDate - randInt(1, 100) * 86400000).toISOString()
        });
    }
    console.log(`Inserting ${interactions.length} Interactions... (batching)`);
    for (let i = 0; i < interactions.length; i += 100) {
        await insforge.database.from('interactions').upsert(interactions.slice(i, i + 100));
    }

    // 5. Generate 50 Service Cases
    const cases = [];
    for (let i = 0; i < 50; i++) {
        const pId = randItem(parties).party_id;
        const isBreaching = i % 10 === 0;
        const slaTime = isBreaching ? baseDate + randInt(-3600000, 3600000) : baseDate + randInt(86400000, 259200000);

        cases.push({
            case_id: genUUID('e0000000-0000-4000-8000'),
            customer_id: pId,
            subject: `Issue regarding ${randItem(['Wire Transfer', 'Account Access', 'Fee Dispute', 'Card Replacement'])}`,
            description: "Client reported an unexpected problem requiring immediate service resolution.",
            status: randItem(['open', 'open', 'in_progress', 'escalated', 'closed']),
            priority: isBreaching ? 'High' : randItem(['Low', 'Medium', 'High']),
            sla_deadline: new Date(slaTime).toISOString()
        });
    }
    console.log("Inserting Service Cases...");
    await insforge.database.from('service_cases').upsert(cases);

    console.log("All Seeding Complete!");
}

runSeed().catch(console.error);
