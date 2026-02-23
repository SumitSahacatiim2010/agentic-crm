"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";

interface SLATimerProps {
    deadline: string;
}

export function SLATimer({ deadline }: SLATimerProps) {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isBreached, setIsBreached] = useState(false);

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date().getTime();
            const end = new Date(deadline).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setIsBreached(true);
                setTimeLeft(0);
            } else {
                setIsBreached(false);
                setTimeLeft(diff);
            }
        };

        calculateTime();
        const timer = setInterval(calculateTime, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [deadline]);

    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (isBreached) {
        return (
            <Badge variant="destructive" className="bg-rose-600 text-white animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" /> SLA BREACHED
            </Badge>
        );
    }

    const isCritical = hours < 4;

    return (
        <Badge variant="outline" className={`
        ${isCritical ? 'bg-amber-500/10 text-amber-500 border-amber-500/50' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50'}
        font-mono
    `}>
            <Clock className="h-3 w-3 mr-1" />
            {hours}h {minutes}m
        </Badge>
    );
}
