"use client";

import { useState } from "react";
import { OfferCatalog } from "@/components/offers/OfferCatalog";
import { QuoteBuilder } from "@/components/offers/QuoteBuilder";
import { QuoteComparison } from "@/components/offers/QuoteComparison";
import { ProductOffer } from "@/lib/offer-mock-data";

export default function QuotesPage() {
    const [selectedOffer, setSelectedOffer] = useState<ProductOffer | null>(null);
    const [quotes, setQuotes] = useState<any[]>([]);

    const handleAddQuote = (quote: any) => {
        setQuotes([...quotes, quote]);
    };

    const handleRemoveQuote = (id: string) => {
        setQuotes(quotes.filter(q => q.id !== id));
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col gap-6">

            <div className="flex flex-col md:flex-row gap-6 h-[800px]">

                {/* Left: Component Catalog */}
                <div className="md:w-1/2 flex flex-col gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Product Offer Catalog</h2>
                        <p className="text-slate-400 text-sm">Browse approved products and initiate quotes.</p>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2">
                        <OfferCatalog onSelect={setSelectedOffer} />
                    </div>
                </div>

                {/* Right: Quote Builder (Detail View) */}
                <div className="md:w-1/2 flex flex-col gap-4">
                    <div className="h-full">
                        <QuoteBuilder
                            selectedOffer={selectedOffer}
                            onSaveQuote={handleAddQuote}
                        />
                    </div>
                </div>
            </div>

            {/* Comparisons (Bottom) */}
            <div className="min-h-[300px]">
                <QuoteComparison quotes={quotes} onRemove={handleRemoveQuote} />
            </div>

        </div>
    );
}
