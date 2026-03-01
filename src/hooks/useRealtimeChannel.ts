"use client";

import { useEffect, useRef } from "react";
import { insforge } from "@/lib/insforge-client";

/**
 * Shared state to prevent multiple components from racing to connect.
 * Once connected, all subsequent callers skip the connect step.
 */
let connectPromise: Promise<void> | null = null;

async function ensureConnected() {
    if (insforge.realtime.isConnected) return;
    if (!connectPromise) {
        connectPromise = insforge.realtime
            .connect()
            .then(() => {
                console.log("[Realtime] Connected, socketId:", insforge.realtime.socketId);
            })
            .catch((err) => {
                connectPromise = null; // allow retry on failure
                console.error("[Realtime] Connection failed:", err);
                throw err;
            });
    }
    return connectPromise;
}

/**
 * Subscribe to a realtime channel and listen for a specific event.
 *
 * Handles connect → subscribe → on/off lifecycle automatically.
 * Cleans up on unmount.
 *
 * @param channel  - InsForge channel name (e.g. "leads", "service_inbox")
 * @param event    - Event name to listen for (e.g. "INSERT_lead")
 * @param callback - Handler receiving the event payload
 */
export function useRealtimeChannel<T = any>(
    channel: string,
    event: string,
    callback: (payload: T) => void
) {
    // Keep callback ref stable to avoid re-subscribing on every render
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        let cancelled = false;

        const handler = (payload: T) => {
            if (!cancelled) callbackRef.current(payload);
        };

        (async () => {
            try {
                await ensureConnected();
                if (cancelled) return;

                const res = await insforge.realtime.subscribe(channel);
                if (!res.ok) {
                    console.warn(`[Realtime] Subscribe to '${channel}' failed:`, res.error);
                    return;
                }

                insforge.realtime.on(event, handler);
            } catch (err) {
                console.error(`[Realtime] Error setting up '${channel}':`, err);
            }
        })();

        return () => {
            cancelled = true;
            try {
                insforge.realtime.off(event, handler);
                insforge.realtime.unsubscribe(channel);
            } catch (_) { /* safe cleanup */ }
        };
    }, [channel, event]);
}
