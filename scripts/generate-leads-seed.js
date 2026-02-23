
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// --- CONSTANTS ---
const SEGMENTS = ['Tech', 'Healthcare', 'Mfg', 'Retail'];
const PARTY_TYPES = ['Individual', 'Corporate'];
const FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const LEAD_SOURCES = ['Website', 'Referral', 'Campaign', 'Cold Call', 'Partner'];
const LEAD_STATUSES = ['New', 'Working', 'Qualified', 'Disqualified'];
const LEAD_RATINGS = ['Hot', 'Warm', 'Cold'];
const OPP_STAGES = ['Prospecting', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed-Won', 'Closed-Lost'];
const ACTIVITY_TYPES = ['Call', 'Email', 'Meeting', 'Task'];

// --- HELPERS ---
function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// --- DATA HOLDERS ---
const parties = [];
const individuals = [];
const opportunities = [];
const leads = [];
const activities = [];

console.log("Generating CRM Mock Data...");

// 1. Generate Parties (30 Records)
for (let i = 0; i < 30; i++) {
    const partyId = uuidv4();
    const type = i < 20 ? 'individual' : 'corporate'; // 20 Individuals, 10 Corporates
    const segment = random(SEGMENTS);
    const firstName = random(FIRST_NAMES);
    const lastName = random(LAST_NAMES);

    // Party Table
    parties.push({
        party_id: partyId,
        party_type: type,
        segment: segment
    });

    // Individual Details (Only for individuals)
    if (type === 'individual') {
        individuals.push({
            customer_id: partyId,
            full_legal_name: `${firstName} ${lastName}`,
            segment_tier: random(['Standard', 'Gold', 'Platinum']),
            nationality: 'American',
            employment_status: 'Employed'
        });
    }
}

// 2. Generate Sales Opportunities (20 Records)
for (let i = 0; i < 20; i++) {
    const oppId = uuidv4();
    // Pick a random party
    const party = random(parties);
    const stage = random(OPP_STAGES);

    const isClosed = stage === 'Closed-Won' || stage === 'Closed-Lost';
    const closeDate = randomDate(new Date('2025-01-01'), new Date('2025-12-31'));

    opportunities.push({
        opportunity_id: oppId,
        customer_id: party.party_id,
        opportunity_name: `${party.segment} - ${random(['Expansion', 'New Deal', 'Upgrade', 'Consulting'])}`,
        opportunity_stage: stage,
        projected_value: randomInt(10000, 1000000),
        probability_weighting: stage === 'Closed-Won' ? 100 : (stage === 'Closed-Lost' ? 0 : randomInt(10, 90)),
        expected_close_date: closeDate.toISOString().split('T')[0],
        owner: 'Sarah Jenkins', // Hardcoded for demo
        closed_at: isClosed ? closeDate.toISOString() : null,
        loss_reason: stage === 'Closed-Lost' ? 'Price too high' : null,
        created_at: new Date().toISOString()
    });
}

// 3. Generate Leads (30 Records)
for (let i = 0; i < 30; i++) {
    const leadId = uuidv4();
    const party = random(parties); // In real life, leads might not map to parties yet, but for this schema they do.

    const status = random(LEAD_STATUSES);
    const isQualified = status === 'Qualified';

    leads.push({
        lead_id: leadId,
        party_id: party.party_id,
        contact_id: party.party_type === 'individual' ? party.party_id : null,
        lead_source: random(LEAD_SOURCES),
        status: status,
        rating: random(LEAD_RATINGS),
        owner: 'Sarah Jenkins',
        created_at: new Date().toISOString(),
        qualified_at: isQualified ? new Date().toISOString() : null,
        disqualification_reason: status === 'Disqualified' ? 'No Budget' : null
    });
}

// 4. Generate Activities (50 Records)
for (let i = 0; i < 50; i++) {
    const activityId = uuidv4();
    const isLeadActivity = Math.random() > 0.5;
    const parentId = isLeadActivity ? random(leads).lead_id : random(opportunities).opportunity_id;

    // Ensure we have IDs
    if (!parentId) continue;

    const dueDate = randomDate(new Date('2025-02-01'), new Date('2025-03-30'));
    const isCompleted = Math.random() > 0.5;

    activities.push({
        activity_id: activityId,
        related_lead_id: isLeadActivity ? parentId : null,
        related_opportunity_id: !isLeadActivity ? parentId : null,
        activity_type: random(ACTIVITY_TYPES),
        subject: `${random(['Follow up', 'Discussion', 'Negotiation'])} regarding ${isLeadActivity ? 'lead' : 'deal'}`,
        due_date: dueDate.toISOString(),
        completed: isCompleted,
        notes: 'Generated by Seed Script',
        owner: 'Sarah Jenkins',
        created_at: new Date().toISOString()
    });
}

// --- WRITE FILES ---
const outDir = path.join(__dirname, '..', 'seed');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
}

fs.writeFileSync(path.join(outDir, 'parties_crm.json'), JSON.stringify(parties, null, 2));
fs.writeFileSync(path.join(outDir, 'individual_parties_crm.json'), JSON.stringify(individuals, null, 2));
fs.writeFileSync(path.join(outDir, 'sales_opportunities_crm.json'), JSON.stringify(opportunities, null, 2));
fs.writeFileSync(path.join(outDir, 'leads.json'), JSON.stringify(leads, null, 2));
fs.writeFileSync(path.join(outDir, 'activities.json'), JSON.stringify(activities, null, 2));

console.log("CRM Data Generated in /seed folder.");
