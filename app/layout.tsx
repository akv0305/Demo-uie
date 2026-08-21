import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { themeConfig } from '@/config/theme.config';
import { themeCssText } from '@/lib/theme';
import { terminology as t } from '@/config/terminology.config';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * Generic application name only — the client's company name never appears in
 * titles or metadata. Every page is excluded from search indexing.
 */
export const metadata: Metadata = {
  title: {
    default: themeConfig.brand.appName,
    template: `%s · ${themeConfig.brand.appName}`,
  },
  description: t.common.appTagline,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="robots" content="noindex, nofollow" />
        {/* CSS custom properties generated from config/theme.config.ts */}
        <style dangerouslySetInnerHTML={{ __html: themeCssText() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
