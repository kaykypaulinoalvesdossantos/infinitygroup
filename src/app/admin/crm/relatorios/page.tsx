'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PipelineQueryProvider } from '@/components/admin/crm/pipeline/providers/PipelineQueryProvider';
import { ReportsPage } from '@/components/admin/crm/reports/ReportsPage';

function ReportsFallback() {
  return (
    <div className="space-y-6 p-4 md:p-8" aria-busy="true" aria-label="Carregando relatórios">
      <Skeleton className="shimmer h-7 w-56" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="shimmer h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function CrmRelatoriosPage() {
  return (
    <PipelineQueryProvider>
      <Suspense fallback={<ReportsFallback />}>
        <ReportsPage />
      </Suspense>
    </PipelineQueryProvider>
  );
}
