
import { NBA_OFFER_CATALOG, NBAModelOffer } from "./nba-mock-data";

// Type definition for the ranking response
export interface RankedOffer extends NBAModelOffer {
    finalScore: number;
    rank: number;
}

/**
 * SIMULATED EDGE FUNCTION: nba-ranking
 * 
 * In production, this would be a Python/Go model running on InsForge Functions.
 * Here we simulate the "Contextual Bandit" logic with randomized epsilon-greedy exploration.
 */
export async function getNextBestActions(customerId: string, context?: any): Promise<RankedOffer[]> {
    // Simulate API Latency (ML Inference time)
    await new Promise(resolve => setTimeout(resolve, 600));

    // logic: 
    // 1. Filter out non-compliant offers (Suitability Check)
    // 2. Calculate Final Score = (Base Propensity * 0.7) + (Margin Scored * 0.3) + Random Noise (Exploration)

    const eligibleOffers = NBA_OFFER_CATALOG.filter(offer => offer.regulatoryCheck);

    const ranked = eligibleOffers.map(offer => {
        // Normalize margin to 0-100 scale (approx) for scoring
        const marginScore = Math.min(offer.margin / 50, 100);

        // Removed Math.random() for deterministic SSR hydration
        const explorationNoise = 0;

        const finalScore = (offer.baseScore * 0.7) + (marginScore * 0.3) + explorationNoise;

        return {
            ...offer,
            finalScore: Math.round(finalScore),
            rank: 0 // placeholder
        };
    });

    // Sort by Final Score Descending
    ranked.sort((a, b) => b.finalScore - a.finalScore);

    // Assign Ranks
    return ranked.map((offer, index) => ({
        ...offer,
        rank: index + 1
    }));
}

/**
 * Simulate Feedback Loop (Reinforcement Learning)
 */
export async function captureNBAFeedback(offerId: string, event: 'accept' | 'reject' | 'defer') {
    console.log(`[NBA-RL-MODEL] Feedback Received for ${offerId}: ${event}`);
    // In real life, this sends a reward signal to the model
    return { success: true };
}
