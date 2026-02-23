// POST /api/onboarding/sanctions-screen
// Deterministic sanctions branching: CLEAR → STP, INCONCLUSIVE/HIT → block + regulatory case
import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';
import { computeSanctionsScore, generateAccountCredentials } from '@/lib/onboarding-scoring';

export async function POST(req: NextRequest) {
    try {
        const { application_id, full_name, nationality } = await req.json();
        if (!application_id || !full_name) {
            return NextResponse.json({ error: 'application_id and full_name required' }, { status: 400 });
        }

        const { score, outcome } = computeSanctionsScore(full_name, nationality || '');
        const now = new Date().toISOString();

        // Audit check log
        await insforge.database.from('onboarding_kyc_checks').insert([{
            application_id,
            check_type: 'sanctions',
            outcome: outcome === 'CLEAR' ? 'pass' : outcome === 'INCONCLUSIVE' ? 'manual_review' : 'fail',
            score,
            detail: { name: full_name, nationality, score, outcome },
        }]);

        if (outcome === 'CLEAR') {
            // STP path — provision account
            const { account_number, sort_code } = generateAccountCredentials(full_name, application_id);

            await insforge.database.from('onboarding_applications').update({
                sanctions_outcome: 'CLEAR',
                sanctions_score: score,
                sanctions_screened_at: now,
                status: 'approved',
                account_number,
                sort_code,
                provisioned_at: now,
            }).eq('application_id', application_id);

            return NextResponse.json({
                outcome: 'CLEAR', score,
                account_number, sort_code,
                status: 'approved',
                message: 'Screening complete. Account provisioned via STP.',
            });
        }

        // INCONCLUSIVE or HIT — create regulatory service case
        const priority_band = outcome === 'HIT' ? 'P1' : 'P2';
        const preventive_log = outcome === 'HIT'
            ? `[${now}] SANCTIONS HIT — Score ${score}. Name: ${full_name}. Nationality: ${nationality}. Preventive control applied. Account opening blocked.`
            : `[${now}] SANCTIONS INCONCLUSIVE — Score ${score}. Name: ${full_name}. Nationality: ${nationality}. Manual review required.`;

        // Insert compliance service case
        const { data: caseData } = await insforge.database.from('service_cases').insert([{
            subject: `[${outcome}] Onboarding sanctions screening — ${full_name}`,
            description: preventive_log,
            priority: priority_band === 'P1' ? 'critical' : 'high',
            priority_band,
            channel: 'web',
            is_regulatory: true,
            status: 'open',
            sla_deadline: new Date(Date.now() + (priority_band === 'P1' ? 4 * 3600000 : 24 * 3600000)).toISOString(),
        }]).select('case_id').limit(1);

        const caseId = (caseData as any)?.[0]?.case_id || null;

        await insforge.database.from('onboarding_applications').update({
            sanctions_outcome: outcome,
            sanctions_score: score,
            sanctions_screened_at: now,
            status: 'manual_review',
            preventive_control_log: preventive_log,
            compliance_case_id: caseId,
        }).eq('application_id', application_id);

        return NextResponse.json({
            outcome, score,
            status: 'manual_review',
            case_id: caseId,
            message: outcome === 'HIT'
                ? 'Application blocked — compliance team notified. Do not re-apply.'
                : 'Application requires manual review. A compliance officer will contact you.',
        });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
