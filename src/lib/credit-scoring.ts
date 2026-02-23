/**
 * Phase 5 — Deterministic credit scoring, triage, policy engine, pricing.
 * NO Math.random() — same inputs always produce same outputs.
 */
import { stableHash } from './onboarding-scoring';

/* ── Triage Routing ─────────────────────────────────────────── */
export type RoutingPath = 'STP' | 'Standard' | 'Specialist';

export function computeTriageRouting(
    creditScore: number, loanAmount: number, riskRating: number,
    fraudFlag: boolean, productType: string
): RoutingPath {
    if (loanAmount > 1_000_000 || ['commercial_real_estate', 'sba_7a'].includes(productType))
        return 'Specialist';
    if (creditScore >= 720 && loanAmount <= 100_000 && riskRating <= 3 && !fraudFlag)
        return 'STP';
    return 'Standard';
}

export function computeCreditScore(applicantName: string): number {
    return (stableHash(applicantName.toLowerCase().trim()) % 300) + 550;
}

export function computeRiskRating(applicantName: string, loanAmount: number): number {
    return 1 + (stableHash(applicantName.toLowerCase().trim() + String(loanAmount)) % 9);
}

export function computeFraudFlag(applicantName: string): boolean {
    return stableHash(applicantName.toLowerCase().trim()) % 20 === 0;
}

/* ── Bureau Mock ────────────────────────────────────────────── */
export interface BureauReport {
    fico_score: number; delinquency_30: number; delinquency_60: number;
    delinquency_90: number; public_records: number; bankruptcies: number;
    trade_lines_open: number; on_time_pct: number;
}

export function computeBureauReport(applicantName: string, businessName?: string): BureauReport {
    const h = stableHash(applicantName.toLowerCase().trim());
    const bh = stableHash((businessName || applicantName).toLowerCase().trim());
    return {
        fico_score: (h % 300) + 550,
        delinquency_30: h % 5, delinquency_60: h % 3, delinquency_90: h % 2,
        public_records: bh % 2, bankruptcies: bh % 3 === 0 ? 1 : 0,
        trade_lines_open: 10 + (h % 15),
        on_time_pct: Math.max(80, 100 - (h % 20)),
    };
}

/* ── Ratio Computation ──────────────────────────────────────── */
export interface SpreadRatios {
    dscr: number; dti_pct: number; ltv_pct: number;
    current_ratio: number; debt_to_equity: number;
}

export function computeRatios(
    ebitda: number, interestExpense: number, annualDebtService: number,
    monthlyDebt: number, monthlyIncome: number,
    loanAmount: number, collateralValue: number,
    currentAssets: number, currentLiabilities: number,
    totalLiabilities: number, totalEquity: number
): SpreadRatios {
    const denomDscr = interestExpense + annualDebtService;
    return {
        dscr: denomDscr > 0 ? +(ebitda / denomDscr).toFixed(3) : 0,
        dti_pct: monthlyIncome > 0 ? +((monthlyDebt / monthlyIncome) * 100).toFixed(2) : 0,
        ltv_pct: collateralValue > 0 ? +((loanAmount / collateralValue) * 100).toFixed(2) : 0,
        current_ratio: currentLiabilities > 0 ? +(currentAssets / currentLiabilities).toFixed(3) : 0,
        debt_to_equity: totalEquity > 0 ? +(totalLiabilities / totalEquity).toFixed(3) : 0,
    };
}

/* ── Policy Engine Constants ────────────────────────────────── */
export interface PolicyRule {
    id: string; type: 'hard_stop' | 'soft_exception'; label: string;
    declineCode?: string; requiredAction?: string;
    check: (ctx: PolicyContext) => boolean;
}

export interface PolicyContext {
    ltv_pct: number; dscr: number; dti_pct: number; credit_score: number;
    risk_rating: number; fraud_flag: boolean; bankruptcies: number;
    collateral_type: string; loan_amount: number;
    has_soft_exception?: boolean;
}

export const HARD_STOP_RULES: PolicyRule[] = [
    {
        id: 'HS-001', type: 'hard_stop', label: 'LTV exceeds threshold',
        declineCode: 'EXCESSIVE_LTV',
        check: (c) => c.collateral_type === 'commercial' ? c.ltv_pct > 70 : c.ltv_pct > 80
    },
    {
        id: 'HS-002', type: 'hard_stop', label: 'Insufficient debt service coverage',
        declineCode: 'INSUFFICIENT_COVERAGE', check: (c) => c.dscr > 0 && c.dscr < 1.20
    },
    {
        id: 'HS-003', type: 'hard_stop', label: 'Excessive debt burden',
        declineCode: 'EXCESSIVE_DEBT_BURDEN', check: (c) => c.dti_pct > 43
    },
    {
        id: 'HS-004', type: 'hard_stop', label: 'Subprime credit score',
        declineCode: 'SUBPRIME_SCORE', check: (c) => c.credit_score < 580
    },
    {
        id: 'HS-005', type: 'hard_stop', label: 'High risk obligor',
        declineCode: 'HIGH_RISK_OBLIGOR', check: (c) => c.risk_rating >= 8
    },
    {
        id: 'HS-006', type: 'hard_stop', label: 'Fraud indicator detected',
        declineCode: 'FRAUD_INDICATOR', check: (c) => c.fraud_flag
    },
    {
        id: 'HS-007', type: 'hard_stop', label: 'Active bankruptcy record',
        declineCode: 'BANKRUPTCY_RECORD', check: (c) => c.bankruptcies > 0
    },
];

export const SOFT_EXCEPTION_RULES: PolicyRule[] = [
    {
        id: 'SE-001', type: 'soft_exception', label: 'LTV in caution range (commercial)',
        requiredAction: 'Collateral valuation report required',
        check: (c) => c.collateral_type === 'commercial' && c.ltv_pct > 60 && c.ltv_pct <= 70
    },
    {
        id: 'SE-002', type: 'soft_exception', label: 'DSCR in caution range',
        requiredAction: 'Cash flow projection memo required',
        check: (c) => c.dscr >= 1.20 && c.dscr < 1.35
    },
    {
        id: 'SE-003', type: 'soft_exception', label: 'DTI in caution range',
        requiredAction: 'Income verification letter required',
        check: (c) => c.dti_pct >= 38 && c.dti_pct <= 43
    },
    {
        id: 'SE-004', type: 'soft_exception', label: 'Credit score in caution range',
        requiredAction: 'Manual underwriting memo required',
        check: (c) => c.credit_score >= 580 && c.credit_score < 640
    },
    {
        id: 'SE-005', type: 'soft_exception', label: 'Loan exceeds DOA authority',
        requiredAction: 'Committee approval required',
        check: (c) => c.loan_amount > 250_000
    },
];

export interface PolicyResult {
    hardStops: { id: string; label: string; declineCode: string }[];
    softExceptions: { id: string; label: string; requiredAction: string }[];
    decision: 'approve' | 'decline' | 'refer';
}

export function evaluatePolicy(ctx: PolicyContext): PolicyResult {
    const hardStops = HARD_STOP_RULES
        .filter(r => r.check(ctx))
        .map(r => ({ id: r.id, label: r.label, declineCode: r.declineCode! }));
    const softExceptions = SOFT_EXCEPTION_RULES
        .filter(r => r.check(ctx))
        .map(r => ({ id: r.id, label: r.label, requiredAction: r.requiredAction! }));

    let decision: 'approve' | 'decline' | 'refer' = 'approve';

    if (hardStops.length > 0) {
        decision = 'decline';
    } else {
        // T4.3.2 Auto-Decision Logic
        const isAutoApprove = ctx.credit_score > 750 && ctx.dti_pct < 36;
        if (!isAutoApprove || softExceptions.length > 0) {
            decision = 'refer';
            // Add a soft exception to explain referral if none exist
            if (softExceptions.length === 0) {
                softExceptions.push({
                    id: 'SE-AUTO',
                    label: 'Did not meet Auto-Approve thresholds',
                    requiredAction: 'Manual Underwriter Review required'
                });
            }
        }
    }

    return { hardStops, softExceptions, decision };
}

/* ── Adverse Action ─────────────────────────────────────────── */
const DECLINE_CODE_TEXT: Record<string, string> = {
    EXCESSIVE_LTV: 'The loan-to-value ratio exceeds our lending guidelines.',
    INSUFFICIENT_COVERAGE: 'The debt service coverage ratio is insufficient to support the requested obligation.',
    EXCESSIVE_DEBT_BURDEN: 'Your total debt-to-income ratio exceeds acceptable thresholds.',
    SUBPRIME_SCORE: 'Your credit score does not meet our minimum lending criteria.',
    HIGH_RISK_OBLIGOR: 'The internal risk assessment exceeds our risk appetite for this product.',
    FRAUD_INDICATOR: 'Application flagged for potential irregularities requiring further review.',
    BANKRUPTCY_RECORD: 'An active or recent bankruptcy record was identified.',
};

export function generateAdverseActionText(declineCodes: string[]): { reason: string; bureau: string; ecoa: string } {
    const reasons = declineCodes.map(c => `• ${DECLINE_CODE_TEXT[c] || c}`).join('\n');
    return {
        reason: `Your application has been declined for the following reason(s):\n\n${reasons}`,
        bureau: 'This decision was based in whole or in part on information obtained from Experian Commercial. You have the right to obtain a free copy of your credit report within 60 days.',
        ecoa: 'NOTICE: The Federal Equal Credit Opportunity Act prohibits creditors from discriminating against credit applicants on the basis of race, color, religion, national origin, sex, marital status, or age.',
    };
}

/* ── Risk-Based Pricing ─────────────────────────────────────── */
export const PRODUCT_CATALOG: Record<string, { label: string; baseRate: number; maxTerm: number; maxAmount: number }> = {
    working_capital: { label: 'Working Capital Line', baseRate: 6.5, maxTerm: 60, maxAmount: 500_000 },
    term_loan: { label: 'Term Loan', baseRate: 7.0, maxTerm: 120, maxAmount: 5_000_000 },
    equipment_finance: { label: 'Equipment Finance', baseRate: 5.5, maxTerm: 84, maxAmount: 2_000_000 },
    commercial_real_estate: { label: 'Commercial Real Estate', baseRate: 4.5, maxTerm: 360, maxAmount: 25_000_000 },
    sba_7a: { label: 'SBA 7(a)', baseRate: 5.0, maxTerm: 300, maxAmount: 5_000_000 },
};

export function computePricing(productType: string, riskRating: number, hasSoftException: boolean): {
    baseRate: number; riskSpread: number; exceptionPremium: number; finalRate: number;
} {
    const product = PRODUCT_CATALOG[productType];
    if (!product) return { baseRate: 0, riskSpread: 0, exceptionPremium: 0, finalRate: 0 };
    const baseRate = product.baseRate;
    const riskSpread = +((riskRating - 1) * 0.25).toFixed(3);
    const exceptionPremium = hasSoftException ? 0.15 : 0;
    const finalRate = +(baseRate + riskSpread + exceptionPremium).toFixed(3);
    return { baseRate, riskSpread, exceptionPremium, finalRate };
}

/* ── DOA ────────────────────────────────────────────────────── */
export type DOALevel = 'analyst' | 'senior_analyst' | 'committee' | 'board';

export function computeDOALevel(amount: number): DOALevel {
    if (amount <= 250_000) return 'analyst';
    if (amount <= 1_000_000) return 'senior_analyst';
    if (amount <= 5_000_000) return 'committee';
    return 'board';
}
