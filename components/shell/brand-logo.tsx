'use client';

import * as React from 'react';
import { themeConfig } from '@/config/theme.config';
import { terminology as t } from '@/config/terminology.config';
import { cn } from '@/lib/utils';

/** Tried in order; first one that loads wins. */
const FULL_SOURCES = ['/brand/logo.svg', '/brand/logo.png'];
const MARK_SOURCES = ['/brand/logo-mark.svg', '/brand/logo-mark.png'];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

function LogoImage({
  sources,
  alt,
  height,
  fallback,
}: {
  sources: string[];
  alt: string;
  height: number;
  fallback: React.ReactNode;
}) {
  const [i, setI] = React.useState(0);
  if (i >= sources.length) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={sources[i]}
      src={sources[i]}
      alt={alt}
      style={{ height }}
      className="w-auto shrink-0 select-none"
      onError={() => setI((n) => n + 1)}
    />
  );
}

export function BrandLogo({
  collapsed = false,
  className,
  height,
  hideTagline = false,
}: {
  collapsed?: boolean;
  className?: string;
  /** Logo height in px. Sidebar uses 30, login 48. */
  height?: number;
  /** Suppress the tagline line (login page prints its own). */
  hideTagline?: boolean;
}) {
  const h = height ?? (collapsed ? 30 : 32);
  const name = themeConfig.brand.appName;

  const monogram = (
    <span
      style={{ height: h, width: h }}
      className="flex shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-heading tracking-tight text-primary-foreground"
    >
      {initials(name)}
    </span>
  );

  if (collapsed) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <LogoImage sources={MARK_SOURCES} alt={name} height={h} fallback={monogram} />
      </div>
    );
  }

  return (
    <div className={cn('flex min-w-0 flex-col items-start gap-1', className)}>
      <LogoImage
        sources={FULL_SOURCES}
        alt={name}
        height={h}
        fallback={
          <span className="flex items-center gap-2.5">
            {monogram}
            <span className="truncate text-sm font-heading text-foreground">{name}</span>
          </span>
        }
      />
      {!hideTagline && (
        <span className="truncate text-[11px] text-muted-foreground">{t.common.appTagline}</span>
      )}
    </div>
  );
}
