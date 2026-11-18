'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import LegacyLeadsPage from '@/components/admin/crm/legacy/LegacyLeadsPage';
import { PipelinePage } from '@/components/admin/crm/pipeline/PipelinePage';
import { PipelineQueryProvider } from '@/components/admin/crm/pipeline/providers/PipelineQueryProvider';

function PipelineSkeleton() {
  return (
    <div className="admin-page" aria-busy="true" aria-label="Carregando pipeline">
      <div className="space-y-2">
        <Skeleton className="shimmer h-7 w-56" />
        <Skeleton className="shimmer h-4 w-80" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="shimmer h-24 rounded-2xl" />
        ))}
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="shimmer h-72 w-[304px] flex-shrink-0 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

/** Flag NEXT_PUBLIC_PIPELINE_V2=false volta para a tela de producao (legado). Padrao: pipeline novo. */
export default function CrmLeadsPage() {
  if (process.env.NEXT_PUBLIC_PIPELINE_V2 === 'false') {
    return (
      <Suspense fallback={<PipelineSkeleton />}>
        <LegacyLeadsPage />
      </Suspense>
    );
  }
  return (
    <PipelineQueryProvider>
      <Suspense fallback={<PipelineSkeleton />}>
        <PipelinePage />
      </Suspense>
    </PipelineQueryProvider>
  );
}
