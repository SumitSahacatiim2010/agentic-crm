import { NextRequest, NextResponse } from 'next/server';
import { getOnboardingApplication } from '@/services/onboarding-service';

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

    const response = await getOnboardingApplication(token);

    if (response.error) {
        if (response.error.code === 'NOT_FOUND') {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }
        return NextResponse.json({ error: response.error.message }, { status: 500 });
    }

    return NextResponse.json(response.data);
}
