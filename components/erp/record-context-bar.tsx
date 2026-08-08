'use client';

import { Building2, FolderKanban, Warehouse } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import { cn } from '@/lib/utils';
import { HelpHint } from './help-hint';

/**
 * (18) RecordContextBar — thin strip on every transaction screen showing
 * Company, Project and Site so users never lose context.
 */
export function RecordContextBar({
  companyName,
  projectName,
  siteName,
  className,
}: {
  companyName?: string;
  projectName?: string;
  siteName?: string;
  className?: string;
}) {
  const entries = [
    { icon: Building2, label: t.nav.company, value: companyName },
    { icon: FolderKanban, label: t.nav.project, value: projectName },
    { icon: Warehouse, label: t.nav.site, value: siteName },
  ].filter((e) => Boolean(e.value));

  if (entries.length === 0) return null;

  return (
    <aside
      aria-label={t.nav.company}
      className={cn(
        'mb-section flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-md border border-border bg-surface-muted px-3 py-2',
        className,
      )}
    >
      {entries.map(({ icon: Icon, label, value }) => (
        <span key={label} className="flex min-w-0 items-center gap-1.5 text-sm">
          <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
            {label}:
          </span>
          <span className="truncate font-medium text-foreground">{value}</span>
        </span>
      ))}
      <HelpHint topic="companyProjectContext" className="ml-auto" />
    </aside>
  );
}
