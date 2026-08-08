'use client';

import { HelpCircle } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/**
 * (19) HelpHint — small inline help icon giving a short plain-English
 * explanation for first-time ERP users. Text comes from terminology.help.
 */
export type HelpKey = keyof typeof t.help;

export function HelpHint({ topic, className }: { topic: HelpKey; className?: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t.common.helpTitle}
          className={cn(
            'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary',
            className,
          )}
        >
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t.common.helpTitle}
        </p>
        <p className="text-sm leading-relaxed text-foreground">{t.help[topic]}</p>
      </PopoverContent>
    </Popover>
  );
}
