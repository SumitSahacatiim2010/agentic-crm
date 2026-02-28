import { NextRequest, NextResponse } from 'next/server';
import { saveOnboardingProgress } from '@/services/onboarding-service';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await saveOnboardingProgress(body);

        if (response.error) {
            return NextResponse.json({ error: response.error.message }, { status: 500 });
        }

        // Return 201 if it's a new record
        return NextResponse.json(response.data, { status: response.data.is_new ? 201 : 200 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
