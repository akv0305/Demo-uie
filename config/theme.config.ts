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
 *
 * Palette derived from the client brand mark (navy "U" shield + navy wordmark).
 * Source hex values are recorded in comments for traceability.
 */

export type Density = 'comfortable' | 'compact';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceMuted: string;
  foreground: string;
  foregroundMuted: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  border: string;
  input: string;
  ring: string;
  draft: string;
  submitted: string;
  pendingApproval: string;
  approved: string;
  rejected: string;
  returned: string;
  revised: string;
  cancelled: string;
  closed: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
}

export interface ThemeTypography {
  fontSans: string;
  fontMono: string;
  baseFontSize: string;
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
  density: Density;
  brand: ThemeBrand;
}

export const themeConfig: ThemeConfig = {
  colors: {
    // --- Neutrals: cool greys tuned to the navy hue family ------------------
    background: '210 20% 98%',      // #F6F7F9  page canvas
    surface: '0 0% 100%',           // #FFFFFF  cards / tables / forms
    surfaceMuted: '212 22% 96%',    // #F1F3F6  table header, subtle fills
    foreground: '213 15% 12%',      // #1A1D21  primary text
    foregroundMuted: '213 13% 43%', // #5F6B7A  labels, helper text

    // --- Brand --------------------------------------------------------------
    primary: '211 67% 21%',         // #12355B  logo navy — sidebar, buttons
    primaryForeground: '0 0% 100%',
    secondary: '213 31% 93%',       // #E8EDF3  pale navy tint
    secondaryForeground: '211 67% 21%',

    // NOTE: `accent` is a LIGHT hover/selected wash. tailwind.config maps
    // accent-foreground to --foreground (dark text), so accent must stay
    // light or hover states become unreadable. Do not set this to navy.
    accent: '213 40% 92%',

    border: '213 20% 88%',          // #DDE2E8
    input: '213 18% 84%',           // #CBD2DA
    ring: '212 66% 32%',            // #1B4C86  lighter navy focus ring

    // --- Workflow statuses --------------------------------------------------
    draft: '215 14% 52%',
    submitted: '206 70% 42%',
    pendingApproval: '32 85% 44%',
    approved: '152 55% 33%',
    rejected: '0 65% 46%',
    returned: '270 45% 48%',
    revised: '190 60% 36%',
    cancelled: '215 10% 60%',
    closed: '215 22% 34%',

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
    appName: 'Unique Infra Engineers',
    shortName: 'UIE',
    logoPath: '/brand/logo.svg',
    logoMarkPath: '/brand/logo-mark.svg',
  },
};

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
