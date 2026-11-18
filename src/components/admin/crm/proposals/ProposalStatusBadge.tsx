'use client';

import { PROPOSAL_STATUS_LABEL, type ProposalStatus } from '@/services/sales-copilot';
import { cn } from '@/lib/utils';

const STATUS_CLASS: Record<ProposalStatus, string> = {
  DRAFT: 'bg-muted text-foreground ring-border',
  SENT: 'bg-info text-link ring-info-border',
  ACCEPTED: 'bg-success text-success-foreground ring-success-border',
  REJECTED: 'bg-danger text-danger-foreground ring-danger-border',
  EXPIRED: 'bg-warning text-warning-foreground ring-warning-border',
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
