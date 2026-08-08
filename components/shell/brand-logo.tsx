import { HardHat } from 'lucide-react';
import { themeConfig } from '@/config/theme.config';
import { terminology as t } from '@/config/terminology.config';
import { cn } from '@/lib/utils';

/**
 * Brand mark. Uses an icon rather than an image file so no client artwork is
 * bundled; brand.appName / shortName come from the theme config.
 */
export function BrandLogo({
  collapsed = false,
  className,
}: {
  collapsed?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <HardHat className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      {!collapsed && (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-heading text-foreground">
            {themeConfig.brand.appName}
          </span>
          <span className="truncate text-[11px] text-muted-foreground">{t.common.appTagline}</span>
        </span>
      )}
    </div>
  );
}
