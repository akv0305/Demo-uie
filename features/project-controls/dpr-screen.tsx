'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import {
  DataTable,
  KpiCard,
  PageHeader,
  SelectField,
  StatusChip,
  type Option,
} from '@/components/erp';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDate, formatNumber } from '@/lib/format';
import type { DailyProgressReport } from '@/lib/data/types';
import { dprColumns, manpowerOf } from './dpr-columns';

export interface DprScreenProps {
  rows: DailyProgressReport[];
  isLoading: boolean;
  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  statusOptions: Option[];
  siteName: (id: string) => string;
  wbsName: (id: string) => string;
  equipmentName: (id: string) => string;
  subcontractorName: (id?: string) => string;
}

export function DprScreen({
  rows,
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  siteName,
  wbsName,
  equipmentName,
  subcontractorName,
}: DprScreenProps) {
  const [open, setOpen] = React.useState<DailyProgressReport | null>(null);
  const columns = React.useMemo(() => dprColumns(siteName), [siteName]);

  const kpis = React.useMemo(() => {
    const pending = rows.filter((r) => r.status === 'PENDING_APPROVAL').length;
    const hoursLost = rows.reduce((a, r) => a + (r.hoursLost ?? 0), 0);
    const latest = rows[0];
    return { count: rows.length, pending, hoursLost, manpower: latest ? manpowerOf(latest) : 0 };
  }, [rows]);

  return (
    <>
      <PageHeader
        title={t.project.dpr}
        subtitle={t.project.dprSubtitle}
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupProjectControls }]}
        helpTopic="dpr"
      />

      <section className="mb-section grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t.project.dprKpiReports} value={String(kpis.count)} />
        <KpiCard label={t.project.dprKpiPending} value={String(kpis.pending)} />
        <KpiCard label={t.project.dprKpiHoursLost} value={String(kpis.hoursLost)} />
        <KpiCard label={t.project.dprKpiManpower} value={formatNumber(kpis.manpower)} />
      </section>

      <section className="mb-section flex flex-col gap-2 rounded-lg border border-border bg-surface p-card sm:flex-row sm:items-end">
        <SelectField
          id="dpr-project"
          label={t.nav.project}
          value={projectId}
          onChange={onProjectChange}
          options={projectOptions}
          className="w-full sm:w-80"
        />
        <SelectField
          id="dpr-status"
          label={t.common.status}
          value={statusFilter}
          onChange={onStatusFilterChange}
          options={statusOptions}
          className="w-full sm:w-52"
        />
      </section>

      <DataTable<DailyProgressReport>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        onRowClick={(r) => setOpen(r)}
        emptyHeadline={t.project.dprEmpty}
        emptyDescription={t.project.dprEmptyHint}
        cardTitle={(r) => formatDate(r.date)}
        cardSubtitle={(r) => r.documentNo}
      />

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-3">
                  {formatDate(open.date)}
                  <span className="text-sm font-normal text-muted-foreground">{open.documentNo}</span>
                  <StatusChip status={open.status} />
                </DialogTitle>
              </DialogHeader>

              <section className="mt-4">
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t.project.secDprProgress}
                </h3>
                <ul className="divide-y divide-border rounded-md border border-border">
                  {open.progressLines.map((l) => (
                    <li key={l.id} className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2 text-sm">
                      <span className="text-foreground">
                        {wbsName(l.wbsId)}
                        {l.location && <span className="text-muted-foreground"> · {l.location}</span>}
                      </span>
                      <span className="num text-foreground">
                        {formatNumber(l.todayQty)} {l.uomCode}
                        <span className="ml-2 text-muted-foreground">
                          ({t.project.dprCumulativeQty} {formatNumber(l.cumulativeQty)})
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-4">
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t.project.secDprLabour}
                </h3>
                <ul className="divide-y divide-border rounded-md border border-border">
                  {open.labourLines.map((l) => (
                    <li key={l.id} className="flex items-baseline justify-between gap-2 px-3 py-2 text-sm">
                      <span className="text-foreground">
                        {l.trade}
                        <span className="text-muted-foreground"> · {subcontractorName(l.subcontractorId)}</span>
                      </span>
                      <span className="num text-foreground">
                        {l.skilledCount + l.unskilledCount}
                        <span className="ml-2 text-muted-foreground">
                          ({l.skilledCount} {t.project.dprSkilled} / {l.unskilledCount} {t.project.dprUnskilled})
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-4">
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t.project.secDprEquipment}
                </h3>
                <ul className="divide-y divide-border rounded-md border border-border">
                  {open.equipmentLines.map((l) => (
                    <li key={l.id} className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2 text-sm">
                      <span className="text-foreground">{equipmentName(l.equipmentId)}</span>
                      <span className="num text-muted-foreground">
                        {l.hoursWorked} {t.project.dprHoursWorked} · {l.idleHours} {t.project.dprIdleHours} ·{' '}
                        {l.breakdownHours} {t.project.dprBreakdownHours}
                        {l.dieselIssued ? ` · ${l.dieselIssued} ${t.project.dprDiesel}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">{t.project.dprHindrance}: </span>
                  <span className="text-foreground">{open.hindranceRemarks ?? t.project.dprNoHindrance}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">{t.project.dprPreparedBy}: </span>
                  <span className="text-foreground">{open.preparedByName}</span>
                </p>
              </section>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default DprScreen;
