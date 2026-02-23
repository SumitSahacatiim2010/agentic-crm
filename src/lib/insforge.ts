import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || '';
const insforgeKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '';

// Default client for raw public/anon queries
export const insforge = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeKey
});

// Helper for authenticated server components / API routes
export async function getInsforgeServer() {
    const { token } = await auth();
    return createClient({
        baseUrl: insforgeUrl,
        anonKey: insforgeKey,
        edgeFunctionToken: token || undefined
    });
}
