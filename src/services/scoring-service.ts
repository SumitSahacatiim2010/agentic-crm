import { insforge as insforgeClient } from '@/lib/insforge-client';
import { ServiceResponse } from './lead-service';

export interface ScoreResult {
    score: number;
    ratingBand: 'Hot' | 'Warm' | 'Cold';
    reasons: string[];
}

export const calculateLeadScore = async (leadId: string): Promise<ServiceResponse<ScoreResult>> => {
    try {
        const db = insforgeClient.database;
        const { data: lead, error } = await db.from('leads').select('*').eq('id', leadId).single();
        if (error || !lead) return { error: { code: 'NOT_FOUND', message: 'Lead not found' } };

        let score = 0;
        const reasons: string[] = [];

        // 1. BANT Scoring (40 points max)
        if (lead.bant_budget) { score += 10; reasons.push('Budget Verified'); }
        if (lead.bant_authority) { score += 10; reasons.push('Decision Maker'); }
        if (lead.bant_need) { score += 10; reasons.push('Clear Need'); }
        if (lead.bant_timeline) { score += 10; reasons.push('Active Timeline'); }

        // 2. Source Channel (20 points max)
        const source = (lead.source_channel || '').toLowerCase();
        if (source.includes('branch')) { score += 20; reasons.push('Branch Walk-in (+20)'); }
        else if (source.includes('web')) { score += 10; reasons.push('Web Inbound (+10)'); }
        else if (source.includes('partner')) { score += 15; reasons.push('Partner Referral (+15)'); }
        else if (source.includes('campaign')) { score += 10; reasons.push('Campaign Output (+10)'); }

        // 3. Product Interest (20 points max)
        const product = (lead.product_interest || '').toLowerCase();
        if (product.includes('mortgage') || product.includes('wealth')) { score += 20; reasons.push('High-value Product (+20)'); }
        else if (product.includes('loan')) { score += 15; reasons.push('Lending Product (+15)'); }
        else { score += 5; reasons.push('Standard Product (+5)'); }

        // 4. completeness (20 points max)
        if (lead.email && lead.phone) { score += 20; reasons.push('Complete Contact Info (+20)'); }
        else if (lead.phone) { score += 10; reasons.push('Phone Provided (+10)'); }

        // Cap at 100
        score = Math.min(score, 100);

        // Determine Band
        let ratingBand: 'Hot' | 'Warm' | 'Cold' = 'Cold';
        if (score >= 75) ratingBand = 'Hot';
        else if (score >= 40) ratingBand = 'Warm';

        // Update lead in DB
        await db.from('leads').update({
            lead_score: score,
            lead_rating: ratingBand,
            priority_flag: score >= 85,
            updated_at: new Date().toISOString()
        }).eq('id', leadId);

        return { data: { score, ratingBand, reasons } };
    } catch (e: any) {
        return { error: { code: 'INTERNAL_ERROR', message: e.message } };
    }
};
