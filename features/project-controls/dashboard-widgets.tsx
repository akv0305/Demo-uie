'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import { Card } from '@/components/ui/card';
import { formatNumber, formatPercent } from '@/lib/format';
import type { HindranceSplit, ProgressGauge, TrendPoint } from '@/lib/project/dashboard';
import { cn } from '@/lib/utils';

const SEVERITY_FILL: Record<ProgressGauge['severity'], string> = {
  ok: 'bg-primary',
  warn: 'bg-warning',
  bad: 'bg-danger',
};

/** Horizontal progress bars — the three figures a PM is asked for first. */
export function ProgressBars({ gauges }: { gauges: ProgressGauge[] }) {
  return (
    <Card className="p-card">
      <ul className="flex flex-col gap-4">
        {gauges.map((g) => (
          <li key={g.label}>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-sm text-foreground">{g.label}</span>
              <span className="num text-sm font-medium text-foreground">
                {formatPercent(g.pct)}
              </span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={Math.round(g.pct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={g.label}
            >
              <div
                className={cn('h-full rounded-full transition-all', SEVERITY_FILL[g.severity])}
                style={{ width: `${Math.min(100, Math.max(0, g.pct))}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

const RESPONSIBILITY_FILL = ['bg-danger', 'bg-warning', 'bg-info'] as const;

/** Stacked split of delay days by who is answerable. */
export function HindranceSplitPanel({ splits }: { splits: HindranceSplit[] }) {
  const totalDays = splits.reduce((a, s) => a + s.days, 0);

  if (totalDays === 0) {
    return (
      <Card className="p-card">
        <p className="text-sm text-muted-foreground">{t.project.dbNoHindrances}</p>
      </Card>
    );
  }

  return (
    <Card className="p-card">
      <div className="mb-3 flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {splits.map((s, i) => (
          <div
            key={s.label}
            className={RESPONSIBILITY_FILL[i % RESPONSIBILITY_FILL.length]}
            style={{ width: `${s.pct}%` }}
            title={`${s.label}: ${s.days} ${t.project.dbDays}`}
          />
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        {splits.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                'h-2.5 w-2.5 shrink-0 rounded-full',
                RESPONSIBILITY_FILL[i % RESPONSIBILITY_FILL.length],
              )}
              aria-hidden="true"
            />
            <span className="flex-1 text-foreground">{s.label}</span>
            <span className="text-xs text-muted-foreground">
              {s.count} {t.project.dbEvents}
            </span>
            <span className="num w-20 text-right font-medium text-foreground">
              {s.days} {t.project.dbDays}
            </span>
            <span className="num w-14 text-right text-xs text-muted-foreground">
              {formatPercent(s.pct, 0)}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {t.project.dbHindranceNote}
      </p>
    </Card>
  );
}

/**
 * Column chart of daily output, drawn with plain divs. A wet day shows up as a
 * short bar, which is exactly the conversation this is meant to start.
 */
export function OutputTrend({ points }: { points: TrendPoint[] }) {
  if (points.length < 2) {
    return (
      <Card className="p-card">
        <p className="text-sm text-muted-foreground">{t.project.dbNoTrend}</p>
      </Card>
    );
  }

  const peak = Math.max(...points.map((p) => p.value), 1);

  return (
    <Card className="p-card">
      <div className="flex h-40 items-end gap-1.5">
        {points.map((p) => (
          <div key={p.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm bg-primary/80 transition-all hover:bg-primary"
              style={{ height: `${Math.max(2, (p.value / peak) * 100)}%` }}
              title={`${p.label}: ${formatNumber(p.value)}`}
            />
            <span className="w-full truncate text-center text-[10px] text-muted-foreground">
              {p.label.slice(8)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t.project.dbTrendNote}</p>
    </Card>
  );
}

/** A section heading with an optional link through to the underlying register. */
export function SectionHeading({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h2 className="font-heading text-lg text-foreground">{title}</h2>
      {children}
      {href && (
        <Link
          href={href}
          className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {t.project.dbOpenRegister}
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
