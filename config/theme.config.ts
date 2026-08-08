/**
 * =============================================================================
 * THEME CONFIGURATION — SINGLE SOURCE OF TRUTH FOR ALL VISUAL STYLING
 * =============================================================================
 *
 * Changing values in THIS FILE ONLY must restyle the entire application:
 * colours, fonts, radii and layout density.
 *
 * Rules enforced across the codebase:
 *  - No hex / rgb() literals in any component.
 *  - No Tailwind palette classes (bg-blue-500, text-gray-700, ...) anywhere.
 *  - Components use semantic Tailwind names only (bg-background, bg-surface,
 *    text-foreground, text-muted-foreground, border-border, bg-primary, ...)
 *    which resolve to the CSS custom properties generated from this object.
 *
 * Colour format: HSL channel triplets "H S% L%" (no hsl() wrapper) so Tailwind
 * can compose them with opacity modifiers, e.g. bg-primary/10.
 */

export type Density = 'comfortable' | 'compact';

export interface ThemeColors {
  /** Page canvas behind all content. */
  background: string;
  /** Cards, panels, table surfaces sitting on the canvas. */
  surface: string;
  /** Subtle fills: table headers, disabled inputs, hover rows. */
  surfaceMuted: string;
  /** Primary readable text. */
  foreground: string;
  /** Secondary / helper text, captions, column labels. */
  foregroundMuted: string;

  /** Brand colour: primary buttons, active nav, focus accents. */
  primary: string;
  /** Text/icon colour placed on top of `primary`. */
  primaryForeground: string;
  /** Low-emphasis buttons and chips. */
  secondary: string;
  secondaryForeground: string;
  /** Hover/selected wash for interactive rows and menu items. */
  accent: string;

  /** Hairlines, dividers, table gridlines, card outlines. */
  border: string;
  /** Form control border. */
  input: string;
  /** Focus ring. */
  ring: string;

  // --- Document workflow status colours -------------------------------------
  draft: string;
  submitted: string;
  pendingApproval: string;
  approved: string;
  rejected: string;
  returned: string;
  revised: string;
  cancelled: string;
  closed: string;

  // --- Semantic feedback colours --------------------------------------------
  success: string;
  warning: string;
  danger: string;
  info: string;
}

export interface ThemeTypography {
  fontSans: string;
  fontMono: string;
  /** Root font size; every rem-based size scales from this. */
  baseFontSize: string;
  /** Weight applied to h1–h6 and section titles. */
  headingWeight: string;
}

export interface ThemeShape {
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
}

export interface ThemeBrand {
  appName: string;
  shortName: string;
  logoPath: string;
  logoMarkPath: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  typography: ThemeTypography;
  shape: ThemeShape;
  /** Drives table row height, form field height and page padding. */
  density: Density;
  brand: ThemeBrand;
}

export const themeConfig: ThemeConfig = {
  colors: {
    // Neutral, professional, data-dense palette.
    background: '210 20% 98%', // near-white page canvas
    surface: '0 0% 100%', // white cards / tables
    surfaceMuted: '210 20% 96%', // table header, subtle fills
    foreground: '215 28% 17%', // dark blue-grey text
    foregroundMuted: '215 16% 47%', // secondary text

    primary: '215 45% 26%', // deep blue-grey brand
    primaryForeground: '0 0% 100%',
    secondary: '210 20% 94%',
    secondaryForeground: '215 28% 17%',
    accent: '210 30% 93%',

    border: '214 20% 88%',
    input: '214 20% 84%',
    ring: '215 45% 36%',

    // Workflow statuses — muted, legible, distinguishable.
    draft: '215 14% 52%', // grey — not yet in workflow
    submitted: '206 70% 42%', // blue — sent onward
    pendingApproval: '32 85% 44%', // amber — awaiting a person
    approved: '152 55% 33%', // green — cleared
    rejected: '0 65% 46%', // red — refused
    returned: '270 45% 48%', // violet — sent back for correction
    revised: '190 60% 36%', // teal — reissued after change
    cancelled: '215 10% 60%', // pale grey — void
    closed: '215 22% 34%', // dark slate — completed & locked

    success: '152 55% 33%',
    warning: '32 85% 44%',
    danger: '0 65% 46%',
    info: '206 70% 42%',
  },

  typography: {
    fontSans:
      "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontMono:
      "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
    baseFontSize: '14px',
    headingWeight: '600',
  },

  shape: {
    radiusSm: '4px',
    radiusMd: '6px',
    radiusLg: '10px',
  },

  density: 'comfortable',

  brand: {
    appName: 'Infra ERP',
    shortName: 'ERP',
    logoPath: '/brand/logo.svg',
    logoMarkPath: '/brand/logo-mark.svg',
  },
};

/**
 * Density scale — resolved into CSS variables by lib/theme.ts.
 * Components must read these via Tailwind utilities (h-row, p-page, h-field)
 * rather than hardcoding sizes.
 */
export const densityScale = {
  comfortable: {
    rowHeight: '44px',
    rowPaddingY: '10px',
    fieldHeight: '38px',
    pagePaddingX: '24px',
    pagePaddingY: '20px',
    sectionGap: '20px',
    cardPadding: '20px',
  },
  compact: {
    rowHeight: '34px',
    rowPaddingY: '5px',
    fieldHeight: '32px',
    pagePaddingX: '16px',
    pagePaddingY: '12px',
    sectionGap: '14px',
    cardPadding: '14px',
  },
} as const;

export type DensityTokens = (typeof densityScale)[Density];

export default themeConfig;
