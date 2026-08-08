import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HelpHint, type HelpKey } from './help-hint';

/** (1) PageHeader — title, subtitle, breadcrumb, primary and secondary actions. */
export interface PageAction {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  disabled?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  primaryAction,
  secondaryActions = [],
  helpTopic,
  className,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; href?: string }[];
  primaryAction?: PageAction;
  secondaryActions?: PageAction[];
  helpTopic?: HelpKey;
  className?: string;
}) {
  const renderAction = (action: PageAction, key: string, defaultVariant: PageAction['variant']) => {
    const content = (
      <>
        {action.icon}
        {action.label}
      </>
    );
    if (action.href) {
      return (
        <Button key={key} asChild variant={action.variant ?? defaultVariant} size="sm">
          <Link href={action.href}>{content}</Link>
        </Button>
      );
    }
    return (
      <Button
        key={key}
        variant={action.variant ?? defaultVariant}
        size="sm"
        onClick={action.onClick}
        disabled={action.disabled}
      >
        {content}
      </Button>
    );
  };

  return (
    <header className={cn('mb-section flex flex-col gap-3', className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {breadcrumb.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-foreground">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-heading text-foreground">{title}</h1>
            {helpTopic && <HelpHint topic={helpTopic} />}
          </div>
          {subtitle && (
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {(primaryAction || secondaryActions.length > 0) && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {secondaryActions.map((a, i) => renderAction(a, `sec-${i}`, 'outline'))}
            {primaryAction && renderAction(primaryAction, 'primary', 'default')}
          </div>
        )}
      </div>
    </header>
  );
}
