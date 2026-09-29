'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { DataTable, KpiCard, PageHeader, SelectField, type Option } from '@/components/erp';
import { formatCrore, formatPercent } from '@/lib/format';
import { wbsTotals, type RolledWbsNode } from '@/lib/project/wbs-rollup';
import { wbsBudgetColumns } from './wbs-budget-columns';

export interface WbsBudgetScreenProps {
  rows: RolledWbsNode[];
  isLoading: boolean;
  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];
}

export function WbsBudgetScreen({
  rows,
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
}: WbsBudgetScreenProps) {
  const columns = React.useMemo(() => wbsBudgetColumns(), []);
  const totals = React.useMemo(() => wbsTotals(rows), [rows]);

  return (
    <>
      <PageHeader
        title={t.project.wbsBudget}
        subtitle={t.project.wbsBudgetSubtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/home' },
          { label: t.nav.groupProjectControls },
        ]}
        helpTopic="wbs"
      />

      <section className="mb-section grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t.project.wbsKpiBudget} value={formatCrore(totals.budget)} />
        <KpiCard
          label={t.project.wbsKpiActual}
          value={formatCrore(totals.actual)}
          comparison={formatPercent(totals.consumedPct)}
        />
        <KpiCard label={t.project.wbsKpiBalance} value={formatCrore(totals.balance)} />
        <KpiCard
          label={t.project.wbsKpiOverrun}
          value={String(totals.overrunCount)}
          comparison={t.project.wbsOverrunHint}
        />
      </section>

      <section className="mb-section flex flex-col gap-2 rounded-lg border border-border bg-surface p-card sm:flex-row sm:items-end">
        <SelectField
          id="wbs-project"
          label={t.project.selectProject}
          value={projectId}
          onChange={onProjectChange}
          options={projectOptions}
          className="w-full sm:w-96"
        />
      </section>

      <p className="mb-3 text-sm text-muted-foreground">{t.project.wbsRolledNote}</p>

      <DataTable<RolledWbsNode>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        emptyHeadline={t.project.wbsBudgetEmpty}
        emptyDescription={t.project.wbsBudgetEmptyHint}
        cardTitle={(r) => `${r.code}  ${r.name}`}
        cardSubtitle={(r) => formatCrore(r.rolledBudgetedCost)}
      />
    </>
  );
}

export default WbsBudgetScreen;
