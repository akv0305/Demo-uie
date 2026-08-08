import type { Config } from 'tailwindcss';

/**
 * Every colour name here resolves to a CSS variable generated from
 * config/theme.config.ts. There are NO literal colour values in this file,
 * so the palette can only be changed via the theme config.
 */
const hsl = (name: string) => `hsl(var(${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './config/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: hsl('--background'),
        surface: {
          DEFAULT: hsl('--surface'),
          muted: hsl('--surface-muted'),
        },
        foreground: hsl('--foreground'),
        muted: {
          DEFAULT: hsl('--surface-muted'),
          foreground: hsl('--foreground-muted'),
        },
        primary: {
          DEFAULT: hsl('--primary'),
          foreground: hsl('--primary-foreground'),
        },
        secondary: {
          DEFAULT: hsl('--secondary'),
          foreground: hsl('--secondary-foreground'),
        },
        accent: {
          DEFAULT: hsl('--accent'),
          foreground: hsl('--foreground'),
        },
        card: {
          DEFAULT: hsl('--surface'),
          foreground: hsl('--foreground'),
        },
        popover: {
          DEFAULT: hsl('--surface'),
          foreground: hsl('--foreground'),
        },
        destructive: {
          DEFAULT: hsl('--danger'),
          foreground: hsl('--primary-foreground'),
        },
        border: hsl('--border'),
        input: hsl('--input'),
        ring: hsl('--ring'),

        success: hsl('--success'),
        warning: hsl('--warning'),
        danger: hsl('--danger'),
        info: hsl('--info'),

        status: {
          draft: hsl('--status-draft'),
          submitted: hsl('--status-submitted'),
          pendingApproval: hsl('--status-pending-approval'),
          approved: hsl('--status-approved'),
          rejected: hsl('--status-rejected'),
          returned: hsl('--status-returned'),
          revised: hsl('--status-revised'),
          cancelled: hsl('--status-cancelled'),
          closed: hsl('--status-closed'),
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      fontWeight: {
        heading: 'var(--heading-weight)' as unknown as string,
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      spacing: {
        'page-x': 'var(--page-padding-x)',
        'page-y': 'var(--page-padding-y)',
        section: 'var(--section-gap)',
        card: 'var(--card-padding)',
        'row-y': 'var(--row-padding-y)',
      },
      height: {
        row: 'var(--row-height)',
        field: 'var(--field-height)',
      },
      minHeight: {
        row: 'var(--row-height)',
        field: 'var(--field-height)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
