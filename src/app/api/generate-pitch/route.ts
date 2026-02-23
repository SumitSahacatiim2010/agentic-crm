import { NextResponse } from 'next/server';
import { getInsforgeServer } from '@/lib/insforge';
import { getCustomer360 } from '@/lib/mock-data';

export async function POST(req: Request) {
    try {
        const { customerId, offerName, offerReason } = await req.json();

        if (!customerId || !offerName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const serverClient = await getInsforgeServer();
        const customer = await getCustomer360(customerId);

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found or unauthorized' }, { status: 404 });
        }

        const prompt = `
            You are a top-tier Relationship Manager at an enterprise bank. 
            Act as a professional, empathetic, and persuasive advisor.
            
            Customer: ${customer.profile.full_legal_name}
            Segment: ${customer.profile.tier}
            
            Based on their financial data, you need to write a short, personalized email (max 4 sentences) 
            pitching the following Next Best Action:
            Offer: ${offerName}
            Why it is recommended: ${offerReason}
            
            Tone: Professional, helpful, concise.
            Do not include placeholders like [Your Name]. Just give the body of the email.
        `;

        const completion = await serverClient.ai.chat.completions.create({
            model: 'anthropic/claude-3.5-haiku',
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
        });

        const generatedResponse = completion.choices[0].message.content.trim();

        return NextResponse.json({ success: true, pitch: generatedResponse });
    } catch (error: any) {
        console.error("AI Pitch Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
