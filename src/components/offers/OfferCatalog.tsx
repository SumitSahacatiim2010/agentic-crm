"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Tag } from "lucide-react";
import { MOCK_OFFERS, ProductOffer } from "@/lib/offer-mock-data";

interface OfferCatalogProps {
    onSelect: (offer: ProductOffer) => void;
}

export function OfferCatalog({ onSelect }: OfferCatalogProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredOffers = MOCK_OFFERS.filter(offer =>
        offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                    type="search"
                    placeholder="Search products (e.g., Mortgage, Auto)..."
                    className="pl-9 bg-slate-900 border-slate-800 text-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOffers.map((offer) => (
                    <Card key={offer.id} className="bg-slate-900 border-slate-800 flex flex-col hover:border-slate-700 transition-colors">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 mb-2">
                                    {offer.category}
                                </Badge>
                                <span className="text-xs font-mono text-slate-500">{offer.id}</span>
                            </div>
                            <CardTitle className="text-slate-100">{offer.name}</CardTitle>
                            <CardDescription className="line-clamp-2">{offer.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                                <div>Base Rate: <span className="text-slate-200 font-bold">{offer.baseRate}%</span></div>
                                <div>Floor Rate: <span className="text-slate-200">{offer.floorRate}%</span></div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full bg-slate-800 hover:bg-slate-700 text-white"
                                onClick={() => onSelect(offer)}
                            >
                                <Tag className="h-4 w-4 mr-2" />
                                Build Quote
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {filteredOffers.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        No products found matching "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
}
