'use client';

import { PROPOSAL_STATUS_LABEL, type ProposalStatus } from '@/services/sales-copilot';
import { cn } from '@/lib/utils';

const STATUS_CLASS: Record<ProposalStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 ring-slate-200',
  SENT: 'bg-blue-50 text-blue-700 ring-blue-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 ring-red-200',
  EXPIRED: 'bg-amber-50 text-amber-800 ring-amber-200',
};

export function ProposalStatusBadge({ status, className }: { status: ProposalStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset',
        STATUS_CLASS[status],
        className,
      )}
    >
      {PROPOSAL_STATUS_LABEL[status]}
    </span>
  );
}
