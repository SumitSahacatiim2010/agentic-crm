import { NextRequest, NextResponse } from 'next/server';
import { KNOWLEDGE_BASE } from '@/lib/knowledge-data';

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const categoryQuery = searchParams.get('category') || '';
    const rawKeywords = searchParams.get('keywords') || '';
    const queryKeywords = rawKeywords.toLowerCase().split(/[\s,]+/).filter(Boolean);

    let matchCategory = 'General';
    if (categoryQuery.includes('regulatory_complaint')) matchCategory = 'Compliance';
    if (categoryQuery.includes('billing')) matchCategory = 'Servicing';
    if (categoryQuery.includes('technical')) matchCategory = 'General';
    if (categoryQuery.includes('service_request')) matchCategory = 'Servicing';

    let data = KNOWLEDGE_BASE.filter(a => a.category === matchCategory);

    // If no exact category match, fallback to some items
    if (data.length === 0) data = KNOWLEDGE_BASE.slice(0, 5);

    const scored = data.map(article => {
        const artText = (article.title + " " + article.content).toLowerCase();
        let overlap = 0;
        if (queryKeywords.length > 0) {
            overlap = queryKeywords.filter(q => artText.includes(q)).length;
        }

        // Mock helpful scores for demo based on article views
        const helpful = Math.floor(article.views * 0.05);
        const notHelpful = Math.floor(article.views * 0.01);
        const total = helpful + notHelpful;
        const helpfulRatio = total > 0 ? helpful / total : 0.5;

        return {
            article_id: article.id,
            title: article.title,
            category: article.category,
            excerpt: article.excerpt,
            helpful_count: helpful,
            not_helpful_count: notHelpful,
            _score: overlap + helpfulRatio + (Math.random() * 0.5) // Random fuzzing for demo variance
        };
    });

    scored.sort((a, b) => b._score - a._score);
    const top3 = scored.slice(0, 3).map(({ _score, ...rest }) => rest);

    return NextResponse.json(top3);
}
