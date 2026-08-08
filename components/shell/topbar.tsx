'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ChevronRight, KeyRound, LogOut, Menu, Search, User } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { countUnreadNotifications, listNotifications } from '@/lib/data';
import type { NotificationItem } from '@/lib/data/types';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useApp } from './app-context';
import { ContextSelectors } from './context-selectors';

interface TopbarProps {
  breadcrumb: { label: string; href?: string }[];
  onOpenMobileSidebar: () => void;
}

export function Topbar({ breadcrumb, onOpenMobileSidebar }: TopbarProps) {
  const router = useRouter();
  const { user } = useApp();
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unread, setUnread] = React.useState(0);

  React.useEffect(() => {
    void (async () => {
      const [rows, count] = await Promise.all([listNotifications(), countUnreadNotifications()]);
      setNotifications(rows);
      setUnread(count);
    })();
  }, []);

  return (
    <header className="sticky top-0 z-20 flex flex-col border-b border-border bg-surface">
      {/* Row 1 — breadcrumb, search, notifications, user */}
      <div className="flex h-14 shrink-0 items-center gap-2 px-3 sm:px-4">
        <Button
          variant="ghost"
          size="iconSm"
          className="lg:hidden"
          onClick={onOpenMobileSidebar}
          aria-label={t.nav.expandSidebar}
          aria-controls="app-sidebar"
        >
          <Menu />
        </Button>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="flex min-w-0 items-center gap-1 text-sm">
            {breadcrumb.map((crumb, index) => {
              const isLast = index === breadcrumb.length - 1;
              return (
                <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1">
                  {index > 0 && (
                    <ChevronRight
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="truncate text-muted-foreground hover:text-foreground"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        'truncate',
                        isLast ? 'font-medium text-foreground' : 'text-muted-foreground',
                      )}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Global search (placeholder) */}
        <div className="relative hidden w-64 md:block xl:w-80">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="global-search"
            type="search"
            placeholder={t.common.searchPlaceholder}
            aria-label={t.common.search}
            className="h-8 pl-8"
          />
        </div>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="iconSm"
              className="relative"
              aria-label={t.nav.notifications}
            >
              <Bell />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-primary-foreground">
                  {unread}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[340px] p-0">
            <div className="border-b border-border px-3 py-2">
              <p className="text-sm font-heading">{t.nav.notifications}</p>
            </div>
            <ul className="max-h-80 divide-y divide-border overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.route}
                    className={cn(
                      'block px-3 py-2.5 transition-colors hover:bg-accent',
                      !n.isRead && 'bg-primary/5',
                    )}
                  >
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.detail}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatDateTime(n.timestamp)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-accent"
              aria-label={t.nav.profile}
            >
              <Avatar>
                <AvatarFallback>{user?.avatarInitials ?? '—'}</AvatarFallback>
              </Avatar>
              <span className="hidden min-w-0 flex-col items-start leading-tight sm:flex">
                <span className="max-w-[140px] truncate text-xs font-medium text-foreground">
                  {user?.name ?? ''}
                </span>
                <span className="max-w-[140px] truncate text-[11px] text-muted-foreground">
                  {user?.roleLabel ?? ''}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User />
              {t.nav.profile}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <KeyRound />
              {t.nav.changePassword}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/login')}>
              <LogOut />
              {t.nav.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Row 2 — company / project context, always visible */}
      <div className="flex items-center gap-3 border-t border-border bg-surface-muted px-3 py-2 sm:px-4">
        <ContextSelectors className="min-w-0 flex-1" />
      </div>
    </header>
  );
}
