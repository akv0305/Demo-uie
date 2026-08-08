import { Check, Clock, CornerUpLeft, Minus, X } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import type { ApprovalAction, ApprovalStep } from '@/lib/data/types';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { EmptyState } from './empty-state';
import { HelpHint } from './help-hint';

/**
 * (5) ApprovalTimeline — vertical stepper showing each approval level, the
 * approver, action taken, timestamp and remarks. The current pending step is
 * clearly highlighted and a plain-language line states who it waits with.
 */
const ACTION_META: Record<
  ApprovalAction,
  { icon: typeof Check; label: string; ring: string; chip: string; text: string }
> = {
  APPROVED: {
    icon: Check,
    label: t.status.APPROVED,
    ring: 'border-status-approved bg-status-approved text-primary-foreground',
    chip: 'bg-status-approved/10 text-status-approved',
    text: 'text-status-approved',
  },
  REJECTED: {
    icon: X,
    label: t.status.REJECTED,
    ring: 'border-status-rejected bg-status-rejected text-primary-foreground',
    chip: 'bg-status-rejected/10 text-status-rejected',
    text: 'text-status-rejected',
  },
  RETURNED: {
    icon: CornerUpLeft,
    label: t.status.RETURNED,
    ring: 'border-status-returned bg-status-returned text-primary-foreground',
    chip: 'bg-status-returned/10 text-status-returned',
    text: 'text-status-returned',
  },
  PENDING: {
    icon: Clock,
    label: t.approval.pending,
    ring: 'border-status-pendingApproval bg-status-pendingApproval text-primary-foreground',
    chip: 'bg-status-pendingApproval/10 text-status-pendingApproval',
    text: 'text-status-pendingApproval',
  },
  NOT_STARTED: {
    icon: Minus,
    label: t.approval.notStarted,
    ring: 'border-border bg-surface-muted text-muted-foreground',
    chip: 'bg-surface-muted text-muted-foreground',
    text: 'text-muted-foreground',
  },
};

export function ApprovalTimeline({
  steps,
  className,
}: {
  steps: ApprovalStep[];
  className?: string;
}) {
  if (steps.length === 0) {
    return (
      <EmptyState
        icon={Check}
        headline={t.approval.noWorkflow}
        description={t.common.inPreparationHint}
        className={className}
      />
    );
  }

  const pending = steps.find((s) => s.action === 'PENDING');
  const isComplete = !pending;

  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-heading text-foreground">{t.approval.title}</h3>
        <HelpHint topic="approvalTimeline" />
      </div>

      {/* Plain-language current position */}
      {pending ? (
        <p className="rounded-md border border-status-pendingApproval/30 bg-status-pendingApproval/10 px-3 py-2 text-sm text-foreground">
          <span className="font-medium">{t.approval.waitingWith}:</span>{' '}
          {pending.approverName} ({pending.approverRole})
        </p>
      ) : (
        <p className="rounded-md border border-status-approved/30 bg-status-approved/10 px-3 py-2 text-sm text-foreground">
          {t.approval.completed}
        </p>
      )}

      <ol className="flex flex-col">
        {steps.map((step, index) => {
          const meta = ACTION_META[step.action];
          const Icon = meta.icon;
          const isLast = index === steps.length - 1;
          const isCurrent = step.action === 'PENDING';

          return (
            <li key={`${step.level}-${step.approverName}`} className="flex gap-3">
              {/* Rail */}
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2',
                    meta.ring,
                    isCurrent && 'ring-4 ring-status-pendingApproval/20',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                {!isLast && <span className="my-1 w-px flex-1 bg-border" aria-hidden="true" />}
              </div>

              {/* Body */}
              <div
                className={cn(
                  'mb-3 min-w-0 flex-1 rounded-md border px-3 py-2.5',
                  isCurrent
                    ? 'border-status-pendingApproval/40 bg-status-pendingApproval/5'
                    : 'border-border bg-surface',
                  step.action === 'NOT_STARTED' && 'opacity-70',
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t.approval.level} {step.level}
                    </p>
                    <p className="truncate text-sm font-medium text-foreground">
                      {step.approverName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{step.approverRole}</p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-sm px-2 py-0.5 text-xs font-medium',
                      meta.chip,
                    )}
                  >
                    {meta.label}
                  </span>
                </div>

                {step.actionedOn && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {t.approval.actionedOn}: {formatDateTime(step.actionedOn)}
                  </p>
                )}
                {step.remarks && (
                  <p className="mt-1.5 border-t border-border pt-1.5 text-sm leading-relaxed text-foreground">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t.approval.remarks}:{' '}
                    </span>
                    {step.remarks}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {isComplete && steps.length > 0 && (
        <p className="text-xs text-muted-foreground">{t.approval.completed}</p>
      )}
    </section>
  );
}
