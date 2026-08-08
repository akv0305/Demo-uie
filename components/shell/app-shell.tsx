'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { breadcrumbFor } from '@/config/navigation.config';
import { store } from '@/lib/data/store';
import { cn } from '@/lib/utils';
import { AppProvider } from './app-context';
import { DemoBanner } from './demo-banner';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

const COLLAPSE_KEY = 'sidebarCollapsed';

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setCollapsed(store.getPreference<boolean>(COLLAPSE_KEY, false));
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      store.setPreference<boolean>(COLLAPSE_KEY, !prev);
      return !prev;
    });
  };

  const breadcrumb = React.useMemo(() => breadcrumbFor(pathname.replace(/\/$/, '') || '/home'), [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={cn('flex min-h-screen flex-col transition-[padding] duration-200', collapsed ? 'lg:pl-[68px]' : 'lg:pl-64')}>
        <Topbar breadcrumb={breadcrumb} onOpenMobileSidebar={() => setMobileOpen(true)} />

        <main id="main-content" className="flex-1 page-padding">
          <DemoBanner />
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <Shell>{children}</Shell>
    </AppProvider>
  );
}
