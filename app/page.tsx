'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { terminology as t } from '@/config/terminology.config';

/**
 * Entry point. Static export cannot perform a server redirect, so the landing
 * route sends the browser to the sign-in screen on mount.
 */
export default function RootPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">{t.common.loading}</p>
    </main>
  );
}
