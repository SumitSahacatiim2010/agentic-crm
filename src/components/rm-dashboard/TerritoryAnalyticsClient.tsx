'use client';
// TerritoryAnalyticsClient.tsx — client boundary needed for ssr:false dynamic import
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const TerritoryAnalyticsNoSSR = dynamic(
    () => import('@/components/rm-dashboard/TerritoryAnalytics').then(mod => mod.TerritoryAnalytics),
    { ssr: false, loading: () => <Skeleton className="h-[200px] w-full bg-slate-900 rounded-xl" /> }
);

export function TerritoryAnalyticsClient(props: { segments: any[] }) {
    return <TerritoryAnalyticsNoSSR {...props} />;
}
