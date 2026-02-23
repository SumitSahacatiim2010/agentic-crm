import { createClient } from '@insforge/sdk';

const sourceUrl = 'https://eig7swuu.us-east.insforge.app';
const sourceKey = 'ik_710f44132edc2eae8d24949b34adb7fa';
const destUrl = 'https://i6dp7f9m.us-east.insforge.app';
const destKey = 'ik_f05acd0ab8b3750598d4e848e6392aa7';

const sourceClient = createClient({ baseUrl: sourceUrl, anonKey: sourceKey });
const destClient = createClient({ baseUrl: destUrl, anonKey: destKey });

const tables = [
    'parties',
    'individual_parties',
    'corporate_parties',
    'sales_opportunities',
    'leads',
    'service_cases',
    'onboarding_applications',
    'onboarding_documents',
    'onboarding_kyc_checks',
    'credit_applications',
    'credit_bureau_reports',
    'credit_financial_spreads',
    'credit_offers',
    'credit_policy_results',
    'credit_adverse_actions',
    'case_complaint_details',
    'case_sla_events',
    'compliance_profiles',
    'compliance_resolutions',
    'knowledge_articles',
    'marketing_journeys',
    'journey_nodes',
    'journey_executions',
    'marketing_consent',
    'marketing_fatigue_log',
    'interactions',
    'audit_logs'
];

async function migrate() {
    for (const table of tables) {
        console.log(`\nMigrating table ${table}...`);
        try {
            let allData = [];
            let page = 0;
            let pageSize = 1000;
            let hasMore = true;

            while (hasMore) {
                const { data, error: fetchErr } = await sourceClient.database.from(table).select('*').range(page * pageSize, (page + 1) * pageSize - 1);
                if (fetchErr) throw fetchErr;

                if (data && data.length > 0) {
                    allData = allData.concat(data);
                    if (data.length < pageSize) {
                        hasMore = false;
                    } else {
                        page++;
                    }
                } else {
                    hasMore = false;
                }
            }

            if (allData.length === 0) {
                console.log(`  Table ${table} is empty, skipping.`);
                continue;
            }

            console.log(`  Fetched ${allData.length} records. Inserting...`);

            // insert in batches of 500
            let chunk = 500;
            for (let i = 0; i < allData.length; i += chunk) {
                const slice = allData.slice(i, i + chunk);
                const { error: insertErr } = await destClient.database.from(table).insert(slice);
                if (insertErr) throw insertErr;
                console.log(`  Inserted batch ${Math.floor(i / chunk) + 1}...`);
            }
            console.log(`  Successfully finished inserting into ${table}.`);
        } catch (e) {
            console.error(`  Failed on table ${table}:`, e.message || e);
        }
    }
}

migrate().then(() => console.log('Migration Complete!')).catch(console.error);
