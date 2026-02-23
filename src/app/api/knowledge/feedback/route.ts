import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { article_id, helpful } = await req.json();

        if (!article_id || typeof helpful !== 'boolean') {
            return NextResponse.json({ error: 'article_id and helpful (boolean) are required' }, { status: 400 });
        }

        // Return a mocked success response incrementing counts
        // In a real app this would persist to the DB, but since we're using static array it's ephemeral
        return NextResponse.json({
            success: true,
            helpful_count: helpful ? 1 : 0,
            not_helpful_count: helpful ? 0 : 1,
        });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
