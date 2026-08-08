import { AlertTriangle, RefreshCw } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** (15) ErrorState — message plus retry action. */
export function ErrorState({
  title = t.common.errorTitle,
  message = t.common.errorHint,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <section
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-danger/30 bg-danger/5 px-6 py-10 text-center',
        className,
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="text-base font-heading text-foreground">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="mt-1">
          <RefreshCw />
          {t.common.retry}
        </Button>
      )}
    </section>
  );
}
