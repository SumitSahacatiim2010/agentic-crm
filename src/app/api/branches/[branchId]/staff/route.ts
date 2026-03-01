import { NextResponse } from 'next/server';
import { getBranchStaff } from '@/services/branch-service';

export async function GET(request: Request, { params }: { params: { branchId: string } }) {
    try {
        const response = await getBranchStaff(params.branchId);

        if (response.error) {
            return NextResponse.json({ error: response.error }, { status: 500 });
        }

        return NextResponse.json(response);
    } catch (e: any) {
        return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
    }
}
