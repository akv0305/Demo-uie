import Link from 'next/link';
import { ArrowRight, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * (12) KpiCard — label, large value, unit, secondary comparison line,
 * optional trend indicator and drill-down link.
 */
export function KpiCard({
  label,
  value,
  unit,
  comparison,
  trend,
  trendIsGood,
  href,
  className,
}: {
  label: string;
  value: string;
  unit?: string;
  comparison?: string;
  trend?: 'UP' | 'DOWN' | 'FLAT';
  trendIsGood?: boolean;
  href?: string;
  className?: string;
}) {
  const TrendIcon = trend === 'UP' ? TrendingUp : trend === 'DOWN' ? TrendingDown : Minus;

  // A rising figure is not always good news (for example cost overrun).
  const trendClass =
    trend === 'FLAT' || trend === undefined
      ? 'text-muted-foreground'
      : trendIsGood === false
        ? 'text-danger'
        : trendIsGood === true
          ? 'text-success'
          : 'text-muted-foreground';

  return (
    <Card className={cn('flex flex-col justify-between p-card', className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>

      <p className="mt-2 flex items-baseline gap-1.5">
        <span className="num text-2xl font-heading leading-none text-foreground">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        {trend && (
          <span className={cn('ml-auto flex items-center', trendClass)}>
            <TrendIcon className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">
              {trend === 'UP' ? t.common.trendUp : trend === 'DOWN' ? t.common.trendDown : ''}
            </span>
          </span>
        )}
      </p>

      {comparison && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{comparison}</p>}

      {href && (
        <Link
          href={href}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {t.common.drillDown}
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      )}
    </Card>
  );
}
