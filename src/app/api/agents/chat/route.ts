import { NextResponse } from 'next/server';
import { runAgent, AgentMessage } from '@/lib/agents/gemini-agent';

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'message is required and must be a string' },
                { status: 400 }
            );
        }

        const agentHistory: AgentMessage[] = (history || []).map((h: any) => ({
            role: h.role === 'assistant' ? 'model' : h.role,
            content: h.content,
        }));

        const result = await runAgent(message, agentHistory);

        return NextResponse.json({
            reply: result.reply,
            toolCalls: result.toolCalls,
            error: result.error || null,
        });
    } catch (error: any) {
        console.error('[Agent Chat API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
