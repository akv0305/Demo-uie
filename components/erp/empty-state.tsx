import * as React from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** (13) EmptyState — icon, headline, explanatory sentence, primary action. */
export function EmptyState({
  icon: Icon = Inbox,
  headline,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
}: {
  icon?: LucideIcon;
  headline: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center',
        className,
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-muted-foreground">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="text-base font-heading text-foreground">{headline}</h3>
      {description && (
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      {actionLabel &&
        (actionHref ? (
          <Button asChild size="sm" className="mt-1">
            <a href={actionHref}>{actionLabel}</a>
          </Button>
        ) : (
          <Button size="sm" className="mt-1" onClick={onAction}>
            {actionLabel}
          </Button>
        ))}
    </section>
  );
}
