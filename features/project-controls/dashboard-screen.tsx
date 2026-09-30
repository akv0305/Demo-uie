'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { CardSkeleton, KpiCard, PageHeader, SelectField, type Option } from '@/components/erp';
import { formatCrore, formatDate, formatPercent } from '@/lib/format';
import type {
  BankGuarantee,
  Claim,
  DailyProgressReport,
  Hindrance,
  Project,
  Variation,
} from '@/lib/data/types';
import type { RolledWbsNode } from '@/lib/project/wbs-rollup';
import {
  dashboardPosition,
  dprTrend,
  hindranceByResponsibility,
  progressGauges,
} from '@/lib/project/dashboard';
import {
  HindranceSplitPanel,
  OutputTrend,
  ProgressBars,
  SectionHeading,
} from './dashboard-widgets';

export interface DashboardScreenProps {
  project: Project | null;
  wbs: RolledWbsNode[];
  hindrances: Hindrance[];
  variations: Variation[];
  claims: Claim[];
  guarantees: BankGuarantee[];
  dprs: DailyProgressReport[];
  isLoading: boolean;
  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];
}

export function DashboardScreen({
  project,
  wbs,
  hindrances,
  variations,
  claims,
  guarantees,
  dprs,
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
}: DashboardScreenProps) {
  const p = React.useMemo(
    () => dashboardPosition(project, wbs, hindrances, variations, claims, guarantees, dprs),
    [project, wbs, hindrances, variations, claims, guarantees, dprs],
  );
  const gauges = React.useMemo(() => progressGauges(p), [p]);
  const splits = React.useMemo(() => hindranceByResponsibility(hindrances), [hindrances]);
  const trend = React.useMemo(() => dprTrend(dprs), [dprs]);

  return (
    <div className="stack-section">
      <PageHeader
        title={t.project.dashboard}
        subtitle={t.project.dashboardSubtitle}
        helpTopic="projectDashboard"
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupProjectControls }]}
      />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-full max-w-sm">
          <SelectField
            id="db-project"
            label={t.nav.project}
            value={projectId}
            onChange={onProjectChange}
            options={projectOptions}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {t.project.dbAsOn} {formatDate(new Date())}
        </p>
      </div>

      {isLoading ? (
        <CardSkeleton count={4} />
      ) : !project ? (
        <p className="text-sm text-muted-foreground">{t.project.dbEmptyHint}</p>
      ) : (
        <>
          {/* ---------- Progress against programme ---------- */}
          <section aria-label={t.project.dbSecProgress}>
            <SectionHeading title={t.project.dbSecProgress} href="/project-controls/wbs-budget" />

            <div className="grid grid-cols-1 gap-section lg:grid-cols-2">
              <ProgressBars gauges={gauges} />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <KpiCard
                  label={t.project.dbSlippage}
                  value={formatPercent(Math.abs(p.slippagePct))}
                  trend={p.slippagePct < 0 ? 'DOWN' : 'UP'}
                  trendIsGood={p.slippagePct >= 0}
                  comparison={
                    p.slippagePct < 0 ? t.project.dbSlippageBehind : t.project.dbSlippageAhead
                  }
                />
                <KpiCard
                  label={p.isOverrun ? t.project.dbDaysOverrun : t.project.dbDaysRemaining}
                  value={String(Math.abs(p.daysRemaining))}
                  unit={t.project.dbDays}
                  trend={p.isOverrun ? 'DOWN' : 'FLAT'}
                  trendIsGood={p.isOverrun ? false : undefined}
                  comparison={`${p.daysElapsed} ${t.project.dbOfDays} ${p.daysTotal} ${t.project.dbDays}`}
                />
                <KpiCard
                  label={t.project.dbKpiDprCount}
                  value={String(p.dprCount)}
                  comparison={
                    p.lastDprDate
                      ? `${t.project.dbLastReport}: ${formatDate(p.lastDprDate)}`
                      : t.project.dbNoReports
                  }
                  href="/project-controls/daily-progress-report"
                />
                <KpiCard
                  label={t.project.dbKpiDprPending}
                  value={String(p.dprPendingApproval)}
                  comparison={
                    p.daysSinceLastDpr !== undefined && p.daysSinceLastDpr > 2
                      ? `${t.project.dbReportingGap} ${p.daysSinceLastDpr} ${t.project.dbDays}`
                      : undefined
                  }
                  href="/project-controls/daily-progress-report"
                />
              </div>
            </div>
          </section>

          {/* ---------- Cost ---------- */}
          <section aria-label={t.project.dbSecCost}>
            <SectionHeading title={t.project.dbSecCost} href="/project-controls/wbs-budget" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard label={t.project.dbKpiBudget} value={formatCrore(p.budget)} />
              <KpiCard
                label={t.project.dbKpiActual}
                value={formatCrore(p.actual)}
                comparison={formatPercent(p.consumedPct)}
              />
              <KpiCard label={t.project.dbKpiBalance} value={formatCrore(p.costBalance)} />
              <KpiCard
                label={t.project.dbKpiConsumed}
                value={formatPercent(p.consumedPct)}
                trend={p.overrunNodes > 0 ? 'UP' : 'FLAT'}
                trendIsGood={p.overrunNodes > 0 ? false : undefined}
                comparison={
                  p.overrunNodes > 0
                    ? `${p.overrunNodes} ${t.project.dbOverrunNodes}`
                    : undefined
                }
              />
            </div>
          </section>

          {/* ---------- Commercial exposure ---------- */}
          <section aria-label={t.project.dbSecExposure}>
            <SectionHeading
              title={t.project.dbSecExposure}
              href="/project-controls/contract-summary"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                label={t.project.dbKpiExposure}
                value={formatCrore(p.totalExposure)}
                comparison={t.project.dbExposureNote}
              />
              <KpiCard
                label={t.project.dbKpiVariationsPending}
                value={formatCrore(p.pendingVariationValue)}
                comparison={`${p.pendingVariationCount} ${t.project.cpAwaiting}`}
                href="/project-controls/variation-register"
              />
              <KpiCard
                label={t.project.dbKpiClaimsLive}
                value={formatCrore(p.liveClaimValue)}
                comparison={`${p.liveClaimCount} ${t.project.cpUnderPursuit}`}
                href="/project-controls/claim-register"
              />
              <KpiCard
                label={t.project.dbKpiDisputes}
                value={String(p.disputeCount)}
                trend={p.disputeCount > 0 ? 'UP' : 'FLAT'}
                trendIsGood={p.disputeCount > 0 ? false : undefined}
                comparison={t.project.dbKpiDisputesHint}
                href="/project-controls/claim-register"
              />
            </div>
          </section>

          {/* ---------- Delay days ---------- */}
          <section aria-label={t.project.dbSecHindrance}>
            <SectionHeading
              title={t.project.dbSecHindrance}
              href="/project-controls/hindrance-register"
            />
            <div className="grid grid-cols-1 gap-section lg:grid-cols-2">
              <HindranceSplitPanel splits={splits} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <KpiCard label={t.project.dbOpenHindrances} value={String(p.openHindrances)} />
                <KpiCard
                  label={t.project.dbHindranceDays}
                  value={String(p.hindranceDaysOpen)}
                  unit={t.project.dbDays}
                />
                <KpiCard
                  label={t.project.dbKpiEotDays}
                  value={String(p.eotDaysClaimable)}
                  unit={t.project.dbDays}
                />
                <KpiCard
                  label={t.project.dbKpiBgExpiring}
                  value={String(p.bgExpiringCount)}
                  trend={p.bgLapsedCount > 0 ? 'UP' : 'FLAT'}
                  trendIsGood={p.bgLapsedCount > 0 ? false : undefined}
                  comparison={
                    p.bgLapsedCount > 0
                      ? `${p.bgLapsedCount} ${t.project.dbBgLapsed}`
                      : formatCrore(p.bgLiveValue)
                  }
                  href="/project-controls/bg-retention"
                />
              </div>
            </div>
          </section>

          {/* ---------- Output trend ---------- */}
          <section aria-label={t.project.dbSecTrend}>
            <SectionHeading
              title={t.project.dbSecTrend}
              href="/project-controls/daily-progress-report"
            />
            <OutputTrend points={trend} />
          </section>
        </>
      )}
    </div>
  );
}

export default DashboardScreen;
