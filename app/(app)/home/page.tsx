'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Droplet,
  FileText,
  Fuel,
  ListTodo,
  PackageMinus,
  PackagePlus,
  ShoppingCart,
} from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import {
  listAlerts,
  listKpis,
  listMyPendingTasks,
  listPendingApprovals,
} from '@/lib/data';
import type {
  AlertItem,
  KpiValue,
  PendingApprovalGroup,
  PendingTask,
  TaskSeverity,
} from '@/lib/data/types';
import { formatCurrency, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  CardSkeleton,
  EmptyState,
  HelpHint,
  KpiCard,
  RecordContextBar,
} from '@/components/erp';
import { useApp } from '@/components/shell/app-context';
import { cn } from '@/lib/utils';

/**
 * FILE 7 — Home page. A to-do list, not a module directory: these users have
 * never worked with an ERP, so Home tells them what needs doing today.
 */
const QUICK_CREATE = [
  { label: t.home.newPr, href: '/procurement/purchase-requisitions', icon: ShoppingCart },
  { label: t.home.newGrn, href: '/inventory/goods-receipt', icon: PackagePlus },
  { label: t.home.newIssue, href: '/inventory/material-issue', icon: PackageMinus },
  { label: t.home.newDpr, href: '/project-controls/daily-progress-report', icon: FileText },
  { label: t.home.newFuelIssue, href: '/plant/fuel-issue', icon: Fuel },
] as const;

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return t.home.greetingMorning;
  if (hour < 17) return t.home.greetingAfternoon;
  return t.home.greetingEvening;
}

const SEVERITY_STYLES: Record<TaskSeverity, { border: string; icon: string }> = {
  INFO: { border: 'border-l-info', icon: 'text-info' },
  WARNING: { border: 'border-l-warning', icon: 'text-warning' },
  DANGER: { border: 'border-l-danger', icon: 'text-danger' },
};

export default function HomePage() {
  const { user, company, project, site, isLoading: contextLoading } = useApp();
  const [approvals, setApprovals] = React.useState<PendingApprovalGroup[]>([]);
  const [tasks, setTasks] = React.useState<PendingTask[]>([]);
  const [alerts, setAlerts] = React.useState<AlertItem[]>([]);
  const [kpis, setKpis] = React.useState<KpiValue[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    void (async () => {
      setIsLoading(true);
      const [a, tk, al, k] = await Promise.all([
        listPendingApprovals(user.role),
        listMyPendingTasks(user.role),
        listAlerts(user.role),
        listKpis(user.role),
      ]);
      setApprovals(a);
      setTasks(tk);
      setAlerts(al);
      setKpis(k);
      setIsLoading(false);
    })();
  }, [user]);

  const totalPendingApprovals = approvals.reduce((sum, g) => sum + g.count, 0);

  if (contextLoading || !user) {
    return <CardSkeleton count={4} />;
  }

  return (
    <div className="stack-section">
      {/* Greeting */}
      <header>
        <h1 className="text-xl font-heading text-foreground">
          {greeting()}, {user.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user.roleLabel} · {t.home.contextLine} {company?.name ?? '—'}
          {project ? ` — ${project.shortName}` : ''}
        </p>
      </header>

      <RecordContextBar
        companyName={company?.name}
        projectName={project?.shortName}
        siteName={site?.name}
      />

      {/* Quick create */}
      <section aria-labelledby="quick-create-heading">
        <h2 id="quick-create-heading" className="mb-2 text-sm font-heading text-foreground">
          {t.home.quickCreate}
        </h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_CREATE.map(({ label, href, icon: Icon }) => (
            <Button key={href} asChild variant="outline" size="sm">
              <Link href={href}>
                <Icon />
                {label}
              </Link>
            </Button>
          ))}
        </div>
      </section>

      {/* KPIs */}
      {isLoading ? (
        <CardSkeleton count={4} />
      ) : (
        kpis.length > 0 && (
          <section aria-label="Key figures">
            <div className="grid grid-cols-1 gap-section sm:grid-cols-2 xl:grid-cols-4">
              {kpis.map((kpi) => (
                <KpiCard
                  key={kpi.id}
                  label={kpi.label}
                  value={kpi.value}
                  unit={kpi.unit}
                  comparison={kpi.comparison}
                  trend={kpi.trend}
                  trendIsGood={kpi.trendIsGood}
                  href={kpi.route}
                />
              ))}
            </div>
          </section>
        )
      )}

      <div className="grid grid-cols-1 gap-section lg:grid-cols-2">
        {/* ---------- Waiting for my action ---------- */}
        <section aria-labelledby="waiting-heading" className="flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <h2 id="waiting-heading" className="text-sm font-heading text-foreground">
              {t.home.waitingForMyAction}
            </h2>
            {totalPendingApprovals > 0 && (
              <span className="rounded-sm bg-status-pendingApproval/10 px-1.5 py-0.5 text-xs font-semibold text-status-pendingApproval">
                {totalPendingApprovals}
              </span>
            )}
            <HelpHint topic="approvalTimeline" />
          </div>

          {approvals.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              headline={t.home.nothingWaiting}
              description={t.home.nothingWaitingHint}
              className="flex-1"
            />
          ) : (
            <Card className="divide-y divide-border">
              {approvals.map((group) => (
                <Link
                  key={`${group.kind}-${group.route}`}
                  href={group.route}
                  className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-status-pendingApproval/10 text-status-pendingApproval">
                    <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {group.label}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {t.common.from} {formatDate(group.oldestDate)}
                      {group.totalAmount ? ` · ${formatCurrency(group.totalAmount)}` : ''}
                    </span>
                  </span>
                  <span className="num shrink-0 text-sm font-semibold text-foreground">
                    {group.count}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              ))}
            </Card>
          )}
        </section>

        {/* ---------- My pending tasks ---------- */}
        <section aria-labelledby="tasks-heading" className="flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <h2 id="tasks-heading" className="text-sm font-heading text-foreground">
              {t.home.myPendingTasks}
            </h2>
          </div>

          {tasks.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              headline={t.home.noPendingTasks}
              description={t.home.noPendingTasksHint}
              className="flex-1"
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {tasks.map((task) => (
                <li key={task.id}>
                  <Link
                    href={task.route}
                    className={cn(
                      'flex items-center gap-3 rounded-md border border-l-4 border-border bg-surface px-3 py-2.5 transition-colors hover:bg-accent',
                      SEVERITY_STYLES[task.severity].border,
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">{task.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{task.detail}</span>
                    </span>
                    <span className="num shrink-0 text-sm font-semibold text-foreground">
                      {task.count}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ---------- Alerts ---------- */}
      <section aria-labelledby="alerts-heading">
        <div className="mb-2 flex items-center gap-2">
          <h2 id="alerts-heading" className="text-sm font-heading text-foreground">
            {t.home.alerts}
          </h2>
          <span className="text-xs text-muted-foreground">{t.home.alertsHint}</span>
        </div>

        {alerts.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            headline={t.home.noAlerts}
            description={t.home.noAlertsHint}
          />
        ) : (
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {alerts.map((alert) => (
              <li key={alert.id}>
                <Link
                  href={alert.route}
                  className={cn(
                    'flex items-start gap-3 rounded-md border border-l-4 border-border bg-surface px-3 py-2.5 transition-colors hover:bg-accent',
                    SEVERITY_STYLES[alert.severity].border,
                  )}
                >
                  <AlertTriangle
                    className={cn('mt-0.5 h-4 w-4 shrink-0', SEVERITY_STYLES[alert.severity].icon)}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">{alert.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{alert.detail}</span>
                  </span>
                  <span className="num shrink-0 text-sm font-semibold text-foreground">
                    {alert.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
