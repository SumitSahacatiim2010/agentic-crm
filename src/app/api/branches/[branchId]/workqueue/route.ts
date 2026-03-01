import { NextResponse } from 'next/server';
import { getBranchWorkqueue } from '@/services/branch-service';

export async function GET(request: Request, { params }: { params: { branchId: string } }) {
    try {
        const { searchParams } = new URL(request.url);
        const ownerId = searchParams.get('ownerId') || undefined;

        const response = await getBranchWorkqueue(params.branchId, ownerId);

        if (response.error) {
            return NextResponse.json({ error: response.error }, { status: 500 });
        }

        return NextResponse.json(response);
    } catch (e: any) {
        return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
    }
}
