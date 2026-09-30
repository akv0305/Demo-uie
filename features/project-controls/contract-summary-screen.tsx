'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { DataTable, KpiCard, PageHeader, SelectField, type Option } from '@/components/erp';
import { formatCrore, formatDate, formatPercent } from '@/lib/format';
import type { Claim, Hindrance, Project, Variation } from '@/lib/data/types';
import type { RolledWbsNode } from '@/lib/project/wbs-rollup';
import { contractPosition, statementRows } from '@/lib/project/contract-summary';
import { contractSummaryColumns } from './contract-summary-columns';
import type { StatementRow as StatementRowType } from '@/lib/project/contract-summary';

export interface ContractSummaryScreenProps {
  project: Project | null;
  variations: Variation[];
  claims: Claim[];
  hindrances: Hindrance[];
  wbs: RolledWbsNode[];
  isLoading: boolean;
  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];
}

export function ContractSummaryScreen({
  project,
  variations,
  claims,
  hindrances,
  wbs,
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
}: ContractSummaryScreenProps) {
  const position = React.useMemo(
    () => contractPosition(project, variations, claims, hindrances, wbs),
    [project, variations, claims, hindrances, wbs],
  );
  const rows = React.useMemo(() => statementRows(position), [position]);
  const columns = React.useMemo(() => contractSummaryColumns(), []);

  const exposure = position.pendingVariations + position.liveClaims;

  return (
    <>
      <PageHeader
        title={t.project.contractSummary}
        subtitle={t.project.contractSummarySubtitle}
        helpTopic="contractPosition"
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupProjectControls }]}
      />

      <section className="mb-section max-w-sm">
        <SelectField
          id="cp-project"
          label={t.nav.project}
          value={projectId}
          onChange={onProjectChange}
          options={projectOptions}
        />
      </section>

      <section className="mb-section grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t.project.cpKpiRevised}
          value={formatCrore(position.revisedContractValue)}
          comparison={t.project.cpRevisedNote}
        />
        <KpiCard
          label={t.project.cpKpiExposure}
          value={formatCrore(exposure)}
          comparison={t.project.cpKpiExposureHint}
        />
        <KpiCard
          label={t.project.cpKpiDeviation}
          value={formatPercent(position.deviationPct)}
          trend={position.isDeviationBreached ? 'UP' : 'FLAT'}
          trendIsGood={position.isDeviationBreached ? false : undefined}
          comparison={
            position.isDeviationBreached
              ? t.project.cpDeviationBreach
              : `${t.project.cpKpiDeviationHint} (${formatPercent(position.deviationLimitPct, 0)})`
          }
        />
        <KpiCard label={t.project.cpKpiSettled} value={formatCrore(position.settledClaims)} />
      </section>

      <h2 className="mb-3 font-heading text-lg text-foreground">{t.project.cpStatementTitle}</h2>

      <DataTable<StatementRowType>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        emptyHeadline={t.project.cpEmpty}
        emptyDescription={t.project.cpEmptyHint}
        cardTitle={(r) => r.particulars}
        cardSubtitle={(r) => formatCrore(r.amount)}
      />

      <p className="mb-section mt-3 text-sm text-muted-foreground">{t.project.cpStatementNote}</p>

      <h2 className="mb-3 font-heading text-lg text-foreground">{t.project.cpTimeTitle}</h2>
      <section className="mb-section grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t.project.cpKpiOriginalEnd}
          value={formatDate(position.originalEndDate)}
        />
        <KpiCard
          label={t.project.cpKpiEotSought}
          value={`${position.eotDaysClaimed} ${t.project.cpDays}`}
          comparison={`${position.eotDaysOnRegister} ${t.project.cpEotRegisterHint}`}
        />
        <KpiCard
          label={t.project.cpKpiEotGranted}
          value={`${position.eotDaysGranted} ${t.project.cpDays}`}
          comparison={t.project.cpEotGrantedHint}
        />
        <KpiCard
          label={t.project.cpKpiRevisedEnd}
          value={formatDate(position.revisedEndDate)}
          trend={position.daysToRevisedEnd < 0 ? 'DOWN' : 'FLAT'}
          trendIsGood={position.daysToRevisedEnd < 0 ? false : undefined}
          comparison={
            position.daysToRevisedEnd < 0
              ? t.project.cpOverdue
              : `${position.daysToRevisedEnd} ${t.project.cpDaysRemaining}`
          }
        />
      </section>

      <h2 className="mb-3 font-heading text-lg text-foreground">{t.project.cpProgressTitle}</h2>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t.project.cpKpiPhysical}
          value={formatPercent(position.physicalProgressPct)}
        />
        <KpiCard
          label={t.project.cpKpiFinancial}
          value={formatPercent(position.financialProgressPct)}
        />
        <KpiCard
          label={t.project.cpKpiCost}
          value={formatCrore(position.costIncurred)}
          comparison={`${t.project.cpKpiCostHint} ${formatCrore(position.budgetedCost)}`}
        />
        <KpiCard
          label={t.project.wbsKpiBalance}
          value={formatCrore(position.budgetedCost - position.costIncurred)}
        />
      </section>
    </>
  );
}

export default ContractSummaryScreen;
