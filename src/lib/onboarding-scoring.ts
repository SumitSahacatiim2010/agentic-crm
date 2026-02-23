/**
 * Deterministic scoring utilities for Phase 4 onboarding.
 * NO Math.random() — same inputs always produce same outputs.
 */

/** Stable string → integer hash (0–99) */
export function stableHash(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = (hash * 31 + input.charCodeAt(i)) & 0x7fffffff;
    }
    return hash % 100;
}

export interface EKYCResult {
    name_match_score: number;   // 60–99
    dob_match: boolean;
    auth_score: number;         // 0–99
    tamper_flag: boolean;       // true if auth_score < 40
    kyc_outcome: 'provisionally_verified' | 'manual_review';
}

/** Deterministic eKYC scoring from applicant inputs */
export function computeEKYCScores(
    full_name: string,
    dob: string,
    doc_type: string
): EKYCResult {
    const nameHash = stableHash(full_name.toLowerCase().trim());
    const dobHash = stableHash(dob);
    const docHash = stableHash(doc_type + full_name.toLowerCase());

    // name_match always in [60, 99] range for realistic UX
    const name_match_score = 60 + (nameHash % 40);

    // auth_score can be anywhere [0, 99]
    const auth_score = (nameHash * 7 + doc_type.length * 13 + dobHash) % 100;

    // dob_match: the DOB is always a future check, but we simulate: passes if dobHash > 20
    const dob_match = dobHash > 20;

    const tamper_flag = auth_score < 40;
    const kyc_outcome = tamper_flag ? 'manual_review' : 'provisionally_verified';

    return { name_match_score, dob_match, auth_score, tamper_flag, kyc_outcome };
}

export interface SanctionsResult {
    score: number;
    outcome: 'CLEAR' | 'INCONCLUSIVE' | 'HIT';
}

/** High-risk nationalities (FATF grey/blacklist + sanctioned) */
const HIGH_RISK_NATIONALITIES = ['IR', 'KP', 'SY', 'CU', 'VE', 'MM', 'LY', 'SD', 'YE', 'BY'];

/** Deterministic sanctions scoring from applicant name + nationality */
export function computeSanctionsScore(full_name: string, nationality: string): SanctionsResult {
    const nameHash = stableHash(full_name.toLowerCase().trim());
    const nationalityWeight = HIGH_RISK_NATIONALITIES.includes((nationality || '').toUpperCase()) ? 35 : 0;
    const score = (nameHash + nationalityWeight) % 100;
    const outcome: SanctionsResult['outcome'] =
        score < 30 ? 'CLEAR' : score < 70 ? 'INCONCLUSIVE' : 'HIT';
    return { score, outcome };
}

/** Generate deterministic mock account credentials */
export function generateAccountCredentials(full_name: string, applicationId: string): {
    account_number: string;
    sort_code: string;
} {
    const nameHash = stableHash(full_name.toLowerCase().trim());
    const idSuffix = applicationId.replace(/-/g, '').slice(-6);
    const account_number = `${(10000000 + nameHash * 1000 + parseInt(idSuffix.slice(-3), 16) % 1000)}`.slice(0, 8);
    const sort_code = `20-${String(nameHash % 100).padStart(2, '0')}-${String(parseInt(idSuffix.slice(0, 2), 16) % 100).padStart(2, '0')}`;
    return { account_number, sort_code };
}
