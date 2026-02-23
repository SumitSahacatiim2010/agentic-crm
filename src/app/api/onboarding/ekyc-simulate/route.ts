// POST /api/onboarding/ekyc-simulate
// Deterministic OCR simulation — same inputs always produce same scores
import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';
import { computeEKYCScores } from '@/lib/onboarding-scoring';

export async function POST(req: NextRequest) {
    try {
        const { full_name, dob, doc_type, application_id } = await req.json();
        if (!full_name || !dob || !doc_type) {
            return NextResponse.json({ error: 'full_name, dob, doc_type required' }, { status: 400 });
        }

        const result = computeEKYCScores(full_name, dob, doc_type);

        // Persist document record
        if (application_id) {
            await insforge.database.from('onboarding_documents').insert([{
                application_id,
                doc_type,
                simulated: true,
                name_match_score: result.name_match_score,
                auth_score: result.auth_score,
                tamper_flag: result.tamper_flag,
                ocr_outcome: result.tamper_flag ? 'manual_review' : 'pass',
            }]);

            // Audit check log
            await insforge.database.from('onboarding_kyc_checks').insert([{
                application_id,
                check_type: 'ekyc',
                outcome: result.tamper_flag ? 'manual_review' : 'pass',
                score: result.auth_score,
                detail: {
                    name_match_score: result.name_match_score,
                    dob_match: result.dob_match,
                    auth_score: result.auth_score,
                    tamper_flag: result.tamper_flag,
                },
            }]);

            // Update application
            await insforge.database.from('onboarding_applications').update({
                kyc_status: result.kyc_outcome,
                kyc_name_score: result.name_match_score,
                kyc_auth_score: result.auth_score,
                kyc_tamper_flag: result.tamper_flag,
                kyc_doc_type: doc_type,
                kyc_completed_at: new Date().toISOString(),
            }).eq('application_id', application_id);
        }

        return NextResponse.json(result);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
