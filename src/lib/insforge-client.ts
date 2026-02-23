// src/lib/insforge-client.ts
// Singleton Insforge client for browser/server use
import { createClient } from '@insforge/sdk';

export const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});

export const EDGE_BASE = `${process.env.NEXT_PUBLIC_INSFORGE_BASE_URL}/functions/v1`;
