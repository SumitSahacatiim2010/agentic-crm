import { NextResponse } from 'next/server';
import { runAgent } from '@/lib/agents/gemini-agent';

const JOURNEY_PROMPTS: Record<string, string> = {
    J1: `You are orchestrating the J1: Retail Walk-In Customer Journey.
Steps: 1) Capture walk-in lead → 2) BANT qualification → 3) Convert to opportunity → 4) Credit application (if applicable) → 5) Onboarding.
Use the available tools to execute each step. Ask the user for any missing information before proceeding.`,

    J2: `You are orchestrating the J2: Digital Lead Capture Journey.
Steps: 1) Ingest digital lead (from website/campaign) → 2) Auto-qualify → 3) Route to RM → 4) Convert to opportunity.
Use the available tools to execute each step.`,

    J3: `You are orchestrating the J3: Branch-Led Onboarding Journey.
Steps: 1) Create lead from branch referral → 2) BANT qualify → 3) Start onboarding wizard → 4) Save progress through each step → 5) Complete onboarding.
Use the available tools to execute each step.`,
};

export async function POST(req: Request) {
    try {
        const { journey, goal, context } = await req.json();

        if (!journey || !JOURNEY_PROMPTS[journey]) {
            return NextResponse.json(
                { error: `Invalid journey. Must be one of: ${Object.keys(JOURNEY_PROMPTS).join(', ')}` },
                { status: 400 }
            );
        }

        const systemPrompt = JOURNEY_PROMPTS[journey];
        const userMessage = goal || `Execute the ${journey} journey.${context ? ` Context: ${JSON.stringify(context)}` : ''}`;

        const result = await runAgent(userMessage, [], systemPrompt);

        return NextResponse.json({
            journey,
            reply: result.reply,
            toolCalls: result.toolCalls,
            error: result.error || null,
        });
    } catch (error: any) {
        console.error('[Agent Orchestrate API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
