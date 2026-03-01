/**
 * Phase 7: Gemini Agent Engine
 *
 * Uses @google/genai with native tool-calling (functionDeclarations)
 * to build a goal-oriented agent that can invoke Phase 6 microservices.
 */
import { GoogleGenAI, FunctionCallingConfigMode } from '@google/genai';
import { crmToolDeclarations } from './tool-declarations';
import { executeTool } from './tool-executor';

const GEMINI_MODEL = 'gemini-2.5-flash';
const MAX_TOOL_ROUNDS = 5; // Safety limit to prevent infinite loops

export interface AgentMessage {
    role: 'user' | 'model';
    content: string;
    toolCalls?: { name: string; args: any; result: any }[];
}

export interface AgentResponse {
    reply: string;
    toolCalls: { name: string; args: any; result: any }[];
    error?: string;
}

const SYSTEM_PROMPT = `You are an expert Banking CRM AI Assistant embedded in an enterprise banking platform.
You help Relationship Managers (RMs) manage their daily workflows by performing actions in the CRM system.

Your capabilities include:
- Creating and managing leads (walk-in, digital, referral)
- Qualifying leads with BANT scores
- Converting leads to opportunities
- Managing the sales pipeline
- Processing credit applications
- Managing customer onboarding
- Retrieving CRM data (leads, opportunities, credit applications)

Guidelines:
- Be concise and professional
- When creating records, confirm what was created with key details
- If you need more information to complete an action, ask for it
- Always use the available tools rather than making up data
- When presenting data, format it clearly with bullet points or tables
- If a tool call fails, explain the error and suggest next steps`;

/**
 * Run the Gemini agent with tool-calling loop.
 * Returns the final text response and all tool calls made.
 */
export async function runAgent(
    userMessage: string,
    history: AgentMessage[] = [],
    systemPrompt?: string
): Promise<AgentResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
        return {
            reply: 'Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.',
            toolCalls: [],
            error: 'MISSING_API_KEY',
        };
    }

    const genai = new GoogleGenAI({ apiKey });
    const allToolCalls: AgentResponse['toolCalls'] = [];

    // Build conversation history for Gemini
    const contents = history.map((msg) => ({
        role: msg.role === 'model' ? ('model' as const) : ('user' as const),
        parts: [{ text: msg.content }],
    }));

    // Add the current user message
    contents.push({
        role: 'user' as const,
        parts: [{ text: userMessage }],
    });

    try {
        // Initial call with tools
        let response = await genai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                systemInstruction: systemPrompt || SYSTEM_PROMPT,
                tools: [{ functionDeclarations: crmToolDeclarations as any }],
                toolConfig: {
                    functionCallingConfig: {
                        mode: FunctionCallingConfigMode.AUTO,
                    },
                },
            },
        });

        // Tool-calling loop
        let rounds = 0;
        while (rounds < MAX_TOOL_ROUNDS) {
            const candidate = response.candidates?.[0];
            if (!candidate?.content?.parts) break;

            // Check for function calls
            const functionCalls = candidate.content.parts.filter(
                (p: any) => p.functionCall
            );

            if (functionCalls.length === 0) break; // No more tool calls, we have the final answer

            // Execute each function call
            const functionResponses = [];
            for (const part of functionCalls) {
                const fc = (part as any).functionCall;
                const toolResult = await executeTool(fc.name, fc.args || {});
                allToolCalls.push({
                    name: fc.name,
                    args: fc.args,
                    result: toolResult.result,
                });
                functionResponses.push({
                    name: fc.name,
                    response: toolResult.error
                        ? { error: toolResult.error }
                        : { result: toolResult.result },
                });
            }

            // Send tool results back to Gemini
            response = await genai.models.generateContent({
                model: GEMINI_MODEL,
                contents: [
                    ...contents,
                    { role: 'model' as const, parts: candidate.content.parts },
                    {
                        role: 'user' as const,
                        parts: functionResponses.map((fr) => ({
                            functionResponse: fr,
                        })),
                    },
                ],
                config: {
                    systemInstruction: systemPrompt || SYSTEM_PROMPT,
                    tools: [{ functionDeclarations: crmToolDeclarations as any }],
                    toolConfig: {
                        functionCallingConfig: {
                            mode: FunctionCallingConfigMode.AUTO,
                        },
                    },
                },
            });

            rounds++;
        }

        // Extract final text response
        const finalText =
            response.candidates?.[0]?.content?.parts
                ?.filter((p: any) => p.text)
                .map((p: any) => p.text)
                .join('') || 'I completed the requested actions.';

        return {
            reply: finalText,
            toolCalls: allToolCalls,
        };
    } catch (err: any) {
        console.error('[GeminiAgent] Error:', err);
        return {
            reply: `I encountered an error: ${err.message || String(err)}`,
            toolCalls: allToolCalls,
            error: err.message,
        };
    }
}
