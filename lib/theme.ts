/**
 * Converts theme.config.ts into CSS custom properties applied to <html>.
 * This is the ONLY bridge between the config object and the rendered styles.
 */
import {
  themeConfig,
  densityScale,
  type ThemeConfig,
  type DensityTokens,
} from '@/config/theme.config';

/** Flat map of CSS variable name -> value, derived from the theme config. */
export function buildCssVariables(theme: ThemeConfig = themeConfig): Record<string, string> {
  const d: DensityTokens = densityScale[theme.density];
  const c = theme.colors;

  return {
    // --- Colours (HSL triplets, consumed by tailwind.config.ts) --------------
    '--background': c.background,
    '--surface': c.surface,
    '--surface-muted': c.surfaceMuted,
    '--foreground': c.foreground,
    '--foreground-muted': c.foregroundMuted,
    '--primary': c.primary,
    '--primary-foreground': c.primaryForeground,
    '--secondary': c.secondary,
    '--secondary-foreground': c.secondaryForeground,
    '--accent': c.accent,
    '--border': c.border,
    '--input': c.input,
    '--ring': c.ring,

    '--status-draft': c.draft,
    '--status-submitted': c.submitted,
    '--status-pending-approval': c.pendingApproval,
    '--status-approved': c.approved,
    '--status-rejected': c.rejected,
    '--status-returned': c.returned,
    '--status-revised': c.revised,
    '--status-cancelled': c.cancelled,
    '--status-closed': c.closed,

    '--success': c.success,
    '--warning': c.warning,
    '--danger': c.danger,
    '--info': c.info,

    // --- Typography ---------------------------------------------------------
    '--font-sans': theme.typography.fontSans,
    '--font-mono': theme.typography.fontMono,
    '--base-font-size': theme.typography.baseFontSize,
    '--heading-weight': theme.typography.headingWeight,

    // --- Shape --------------------------------------------------------------
    '--radius-sm': theme.shape.radiusSm,
    '--radius-md': theme.shape.radiusMd,
    '--radius-lg': theme.shape.radiusLg,

    // --- Density ------------------------------------------------------------
    '--row-height': d.rowHeight,
    '--row-padding-y': d.rowPaddingY,
    '--field-height': d.fieldHeight,
    '--page-padding-x': d.pagePaddingX,
    '--page-padding-y': d.pagePaddingY,
    '--section-gap': d.sectionGap,
    '--card-padding': d.cardPadding,
  };
}

/** Serialised declarations for injection into a <style> block on the server. */
export function themeCssText(theme: ThemeConfig = themeConfig): string {
  const vars = buildCssVariables(theme);
  const body = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `:root {\n${body}\n}`;
}

/** Applies the variables imperatively (used if the theme is swapped at runtime). */
export function applyTheme(theme: ThemeConfig = themeConfig): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  Object.entries(buildCssVariables(theme)).forEach(([k, v]) => root.style.setProperty(k, v));
}

export const theme = themeConfig;
export const density = densityScale[themeConfig.density];
export const brand = themeConfig.brand;
