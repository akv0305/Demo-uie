'use client';

import * as React from 'react';
import { PackageSearch } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import {
  DataTable,
  DateField,
  EmptyState,
  KpiCard,
  PageHeader,
  SelectField,
  type Option,
} from '@/components/erp';
import { formatAmount } from '@/lib/format';
import { summaryTotals, type StockSummaryRow } from '@/lib/inventory/summary';
import { summaryColumns } from './summary-columns';

export interface SummaryScreenProps {
  rows: StockSummaryRow[];
  isLoading: boolean;

  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];

  /** Empty string = every store in the project (D-158 still keeps rows apart). */
  siteId: string;
  onSiteChange: (v: string) => void;
  storeOptions: Option[];

  group: string;
  onGroupChange: (v: string) => void;
  groupOptions: Option[];

  fromDate: string;
  onFromDateChange: (v: string) => void;
  toDate: string;
  onToDateChange: (v: string) => void;
}

export function SummaryScreen({
  rows,
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
  siteId,
  onSiteChange,
  storeOptions,
  group,
  onGroupChange,
  groupOptions,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
}: SummaryScreenProps) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  // Any filter change invalidates the page the user was on.
  React.useEffect(() => {
    setPage(1);
  }, [projectId, siteId, group, fromDate, toDate]);

  const totals = React.useMemo(() => summaryTotals(rows, toDate), [rows, toDate]);

  const storeName = React.useCallback(
    (id: string) => storeOptions.find((o) => o.value === id)?.label ?? id,
    [storeOptions],
  );

  const columns = React.useMemo(
    () => summaryColumns({ showStore: !siteId, storeName, asOn: toDate }),
    [siteId, storeName, toDate],
  );

  const paged = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <PageHeader
        title={t.inventory.ssFull}
        subtitle={t.inventory.ssSubtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/home' },
          { label: t.nav.groupInventory },
          { label: t.inventory.ssFull },
        ]}
        helpTopic="stockSummary"
      />

      <div className="mb-section grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t.inventory.ssKpiItems}
          value={String(totals.holding)}
          comparison={`${totals.items} ${t.inventory.ssKpiItemsHint.toLowerCase()}`}
        />
        <KpiCard
          label={t.inventory.ssKpiValue}
          value={formatAmount(totals.closingValue)}
          comparison={
            totals.unvalued > 0
              ? `${totals.unvalued} ${t.inventory.ssUnvalued.toLowerCase()}`
              : t.inventory.ssKpiValueHint
          }
        />
        <KpiCard
          label={t.inventory.ssKpiReorder}
          value={String(totals.belowReorder)}
          comparison={
            totals.negative > 0
              ? `${totals.negative} ${t.inventory.ssNegative.toLowerCase()}`
              : t.inventory.ssKpiReorderHint
          }
          trend={totals.belowReorder > 0 ? 'UP' : undefined}
          trendIsGood={false}
        />
        <KpiCard
          label={t.inventory.ssKpiNonMoving}
          value={String(totals.nonMoving)}
          comparison={
            totals.nonMovingValue > 0
              ? formatAmount(totals.nonMovingValue)
              : t.inventory.ssKpiNonMovingHint
          }
        />
      </div>

      <div className="mb-section grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SelectField
          id="ss-project"
          label={t.masters.project}
          options={projectOptions}
          value={projectId}
          onChange={onProjectChange}
        />
        <SelectField
          id="ss-store"
          label={t.inventory.ssStore}
          options={[{ value: '', label: t.inventory.ssAllStores }, ...storeOptions]}
          value={siteId}
          onChange={onSiteChange}
        />
        <SelectField
          id="ss-group"
          label={t.inventory.ssItemGroup}
          options={[{ value: '', label: t.inventory.ssAllGroups }, ...groupOptions]}
          value={group}
          onChange={onGroupChange}
        />
        <DateField
          id="ss-from"
          label={t.inventory.ssFromDate}
          helperText={t.common.optional}
          value={fromDate}
          onChange={onFromDateChange}
        />
        <DateField
          id="ss-to"
          label={t.inventory.ssToDate}
          value={toDate}
          onChange={onToDateChange}
        />
      </div>

      {totals.negative > 0 && (
        <p className="mb-3 text-sm text-danger">
          {totals.negative} {t.inventory.ssNegativeWarning}
        </p>
      )}

      {!isLoading && !rows.length ? (
        <EmptyState
          icon={PackageSearch}
          headline={t.inventory.ssEmpty}
          description={t.inventory.ssEmptyHint}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={paged}
          rowKey={(r) => `${r.siteId}|${r.itemId}`}
          total={rows.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
          isLoading={isLoading}
          emptyHeadline={t.inventory.ssEmpty}
          emptyDescription={t.inventory.ssEmptyHint}
          cardTitle={(r) => r.description}
          cardSubtitle={(r) => storeName(r.siteId)}
        />
      )}

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        {t.inventory.ssDerived} {t.inventory.ssMixedUom} {t.inventory.ssRateHint}
      </p>
    </>
  );
}

export default SummaryScreen;
