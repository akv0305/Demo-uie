import { History } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import type { AuditEntry } from '@/lib/data/types';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { EmptyState } from './empty-state';

/**
 * (11) AuditTrailPanel — chronological list of actions with user, timestamp,
 * action and changed-field summary.
 */
export function AuditTrailPanel({
  entries,
  className,
}: {
  entries: AuditEntry[];
  className?: string;
}) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={History}
        headline={t.audit.noEntries}
        description={t.audit.noEntriesHint}
        className={className}
      />
    );
  }

  return (
    <section className={cn('overflow-hidden rounded-lg border border-border bg-surface', className)}>
      <h3 className="border-b border-border bg-surface-muted px-3 py-2 text-sm font-heading text-foreground">
        {t.audit.title}
      </h3>
      <ol className="divide-y divide-border">
        {entries.map((entry) => (
          <li key={entry.id} className="px-3 py-2.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="text-sm font-medium text-foreground">{entry.action}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(entry.timestamp)}</p>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {entry.userName} · {entry.userRole}
            </p>

            {entry.changes.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1 border-l-2 border-border pl-2.5">
                {entry.changes.map((change, i) => (
                  <li key={`${change.field}-${i}`} className="text-xs leading-relaxed text-foreground">
                    <span className="font-medium">{change.field}</span>{' '}
                    <span className="text-muted-foreground">{t.audit.fieldChanged}</span>{' '}
                    <span className="line-through decoration-muted-foreground">{change.from}</span>{' '}
                    <span className="text-muted-foreground">{t.audit.fieldChangedTo}</span>{' '}
                    <span className="font-medium">{change.to}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
