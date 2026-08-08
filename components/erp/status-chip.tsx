import type { DocumentStatus } from '@/lib/data/types';
import { terminology as t } from '@/config/terminology.config';
import { cn } from '@/lib/utils';

/**
 * (4) StatusChip — renders any DocumentStatus using the status tokens defined
 * in theme.config.ts. Labels come from terminology.config.ts.
 */
const STATUS_CLASSES: Record<DocumentStatus, string> = {
  DRAFT: 'border-status-draft/30 bg-status-draft/10 text-status-draft',
  SUBMITTED: 'border-status-submitted/30 bg-status-submitted/10 text-status-submitted',
  PENDING_APPROVAL:
    'border-status-pendingApproval/30 bg-status-pendingApproval/10 text-status-pendingApproval',
  APPROVED: 'border-status-approved/30 bg-status-approved/10 text-status-approved',
  REJECTED: 'border-status-rejected/30 bg-status-rejected/10 text-status-rejected',
  RETURNED: 'border-status-returned/30 bg-status-returned/10 text-status-returned',
  REVISED: 'border-status-revised/30 bg-status-revised/10 text-status-revised',
  CANCELLED: 'border-status-cancelled/30 bg-status-cancelled/10 text-status-cancelled',
  CLOSED: 'border-status-closed/30 bg-status-closed/10 text-status-closed',
};

const DOT_CLASSES: Record<DocumentStatus, string> = {
  DRAFT: 'bg-status-draft',
  SUBMITTED: 'bg-status-submitted',
  PENDING_APPROVAL: 'bg-status-pendingApproval',
  APPROVED: 'bg-status-approved',
  REJECTED: 'bg-status-rejected',
  RETURNED: 'bg-status-returned',
  REVISED: 'bg-status-revised',
  CANCELLED: 'bg-status-cancelled',
  CLOSED: 'bg-status-closed',
};

export const ALL_STATUSES: DocumentStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'RETURNED',
  'REVISED',
  'CANCELLED',
  'CLOSED',
];

export function StatusChip({
  status,
  size = 'default',
  className,
}: {
  status: DocumentStatus;
  size?: 'default' | 'sm';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border font-medium',
        size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs',
        STATUS_CLASSES[status],
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DOT_CLASSES[status])} aria-hidden="true" />
      {t.status[status]}
    </span>
  );
}
