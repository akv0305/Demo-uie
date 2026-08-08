'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { navigationForRole, type NavGroup } from '@/config/navigation.config';
import { terminology as t } from '@/config/terminology.config';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useApp } from './app-context';
import { BrandLogo } from './brand-logo';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useApp();
  const groups = React.useMemo<NavGroup[]>(
    () => (user ? navigationForRole(user.role) : []),
    [user],
  );

  // Groups start expanded when they contain the active route.
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const next: Record<string, boolean> = {};
    groups.forEach((g) => {
      if (g.items?.some((i) => pathname.startsWith(i.href))) next[g.id] = true;
    });
    setOpenGroups((prev) => ({ ...next, ...prev }));
  }, [groups, pathname]);

  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const isActive = (href: string) => pathname === href || pathname === `${href}/`;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        id="app-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-surface transition-[width,transform] duration-200',
          collapsed ? 'w-[68px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex h-14 shrink-0 items-center border-b border-border',
            collapsed ? 'justify-center px-2' : 'justify-between px-3',
          )}
        >
          <Link href="/home" onClick={onCloseMobile} aria-label={t.nav.home}>
            <BrandLogo collapsed={collapsed} />
          </Link>
          <Button
            variant="ghost"
            size="iconSm"
            className="lg:hidden"
            onClick={onCloseMobile}
            aria-label={t.common.close}
          >
            <X />
          </Button>
        </div>

        {/* Scrollable navigation */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3"
          aria-label={t.nav.groupMasters}
        >
          <ul className="flex flex-col gap-0.5">
            {groups.map((group) => {
              const Icon = group.icon;

              // Single-link group (Home, showcase)
              if (group.href) {
                const active = isActive(group.href);
                return (
                  <li key={group.id}>
                    <Link
                      href={group.href}
                      onClick={onCloseMobile}
                      title={collapsed ? group.label : undefined}
                      className={cn(
                        'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                        collapsed && 'justify-center px-2',
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-accent',
                      )}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                      {!collapsed && <span className="truncate">{group.label}</span>}
                    </Link>
                  </li>
                );
              }

              const groupHasActive = group.items?.some((i) => isActive(i.href)) ?? false;
              const isOpen = collapsed ? false : (openGroups[group.id] ?? false);

              return (
                <li key={group.id}>
                  <button
                    type="button"
                    onClick={() => (collapsed ? onToggleCollapsed() : toggleGroup(group.id))}
                    title={collapsed ? group.label : undefined}
                    aria-expanded={isOpen}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                      collapsed && 'justify-center px-2',
                      groupHasActive && !isOpen
                        ? 'bg-accent text-foreground'
                        : 'text-foreground hover:bg-accent',
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate text-left">{group.label}</span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                            isOpen && 'rotate-180',
                          )}
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </button>

                  {!collapsed && isOpen && (
                    <ul className="mt-0.5 flex flex-col gap-0.5 border-l border-border pl-3 ml-4">
                      {group.items?.map((item) => {
                        const active = isActive(item.href);
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={onCloseMobile}
                              className={cn(
                                'block rounded-md px-2.5 py-1.5 text-sm transition-colors',
                                active
                                  ? 'bg-primary/10 font-medium text-primary'
                                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                              )}
                            >
                              {item.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse control */}
        <div className="shrink-0 border-t border-border p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapsed}
            className={cn('hidden w-full lg:flex', collapsed && 'justify-center px-0')}
            aria-label={collapsed ? t.nav.expandSidebar : t.nav.collapseSidebar}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            {!collapsed && <span className="ml-1">{t.nav.collapseSidebar}</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
