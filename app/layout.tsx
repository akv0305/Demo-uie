import type { Metadata } from 'next';
import './globals.css';
import { themeConfig } from '@/config/theme.config';
import { themeCssText } from '@/lib/theme';
import { terminology as t } from '@/config/terminology.config';

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
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* CSS custom properties generated from config/theme.config.ts */}
        <style dangerouslySetInnerHTML={{ __html: themeCssText() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
