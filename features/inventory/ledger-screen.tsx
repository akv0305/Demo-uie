'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import {
  DataTable,
  DateField,
  EmptyState,
  KpiCard,
  PageHeader,
  SearchableSelectField,
  SelectField,
  type Option,
} from '@/components/erp';
import { formatAmount, formatQuantity } from '@/lib/format';
import type { LedgerSource, StockLedgerRow } from '@/lib/data/types';
import { ledgerColumns } from './ledger-columns';

const SOURCES: LedgerSource[] = [
  'GRN',
  'ISSUE',
  'RETURN',
  'TRANSFER_OUT',
  'TRANSFER_IN',
  'ADJUSTMENT',
];

export interface LedgerScreenProps {
  rows: StockLedgerRow[];
  opening: { quantity: number; value: number };
  totals: {
    movements: number;
    openingQty: number;
    openingValue: number;
    inQty: number;
    inValue: number;
    outQty: number;
    outValue: number;
    closingQty: number;
    closingValue: number;
    wentNegative: boolean;
  };
  isLoading: boolean;

  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];

  storeSiteId: string;
  onStoreChange: (v: string) => void;
  storeOptions: Option[];

  itemId: string;
  onItemChange: (v: string) => void;
  itemOptions: Option[];

  fromDate: string;
  onFromDateChange: (v: string) => void;
  toDate: string;
  onToDateChange: (v: string) => void;

  source: LedgerSource | 'ALL';
  onSourceChange: (v: LedgerSource | 'ALL') => void;
}

export function LedgerScreen({
  rows,
  opening,
  totals,
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
  storeSiteId,
  onStoreChange,
  storeOptions,
  itemId,
  onItemChange,
  itemOptions,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  source,
  onSourceChange,
}: LedgerScreenProps) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(50);

  // Any change of filter invalidates the page the user was on.
  React.useEffect(() => {
    setPage(1);
  }, [projectId, storeSiteId, itemId, fromDate, toDate, source]);

  /**
   * The opening figure is shown as a row so the closing balance can be checked
   * by hand down the column (D-148). It only means anything once a start date
   * has been given.
   */
  const display = React.useMemo<StockLedgerRow[]>(() => {
    if (!fromDate) return rows;
    const openingRow: StockLedgerRow = {
      id: 'opening',
      date: fromDate,
      source: 'OPENING',
      documentId: '',
      documentNo: '',
      storeSiteId,
      itemId,
      description: t.inventory.slOpening,
      uomCode: rows[0]?.uomCode ?? '',
      inQty: 0,
      outQty: 0,
      balanceQty: opening.quantity,
      balanceValue: opening.value,
    };
    return [openingRow, ...rows];
  }, [rows, fromDate, opening, storeSiteId, itemId]);

  const paged = display.slice((page - 1) * pageSize, page * pageSize);

  const unit = rows[0]?.uomCode ?? '';
  const withUnit = (qty: number) => `${formatQuantity(qty)}${unit ? ` ${unit}` : ''}`;

  return (
    <>
      <PageHeader
        title={t.inventory.slFull}
        subtitle={t.inventory.slSubtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/home' },
          { label: t.nav.groupInventory },
          { label: t.inventory.slFull },
        ]}
        helpTopic="stockLedger"
      />

      <div className="mb-section grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <SelectField
          id="sl-project"
          label={t.masters.project}
          options={projectOptions}
          value={projectId}
          onChange={onProjectChange}
        />
        <SelectField
          id="sl-store"
          label={t.inventory.slStore}
          required
          options={storeOptions}
          value={storeSiteId}
          onChange={onStoreChange}
        />
        <SearchableSelectField
          id="sl-item"
          label={t.inventory.slItem}
          options={[{ value: '', label: t.inventory.slAllItems }, ...itemOptions]}
          value={itemId}
          onChange={onItemChange}
        />
        <DateField
          id="sl-from"
          label={t.inventory.slFromDate}
          value={fromDate}
          onChange={onFromDateChange}
        />
        <DateField
          id="sl-to"
          label={t.inventory.slToDate}
          value={toDate}
          onChange={onToDateChange}
        />
        <SelectField
          id="sl-source"
          label={t.inventory.slSource}
          options={[
            { value: 'ALL', label: t.inventory.slAllSources },
            ...SOURCES.map((s) => ({
              value: s,
              label: t.inventory[`ls${s}` as keyof typeof t.inventory] as string,
            })),
          ]}
          value={source}
          onChange={(v) => onSourceChange(v as LedgerSource | 'ALL')}
        />
      </div>

      {!storeSiteId ? (
        <EmptyState
          headline={t.inventory.slPickStore}
          description={t.inventory.slPickStoreHint}
        />
      ) : (
        <>
          <div className="mb-section grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label={t.inventory.slKpiOpening}
              value={withUnit(totals.openingQty)}
              comparison={formatAmount(totals.openingValue)}
            />
            <KpiCard
              label={t.inventory.slKpiReceipts}
              value={withUnit(totals.inQty)}
              comparison={formatAmount(totals.inValue)}
            />
            <KpiCard
              label={t.inventory.slKpiIssues}
              value={withUnit(totals.outQty)}
              comparison={formatAmount(totals.outValue)}
            />
            <KpiCard
              label={t.inventory.slKpiClosing}
              value={withUnit(totals.closingQty)}
              comparison={
                totals.wentNegative
                  ? t.inventory.slNegative
                  : `${totals.movements} ${t.inventory.slKpiMovements.toLowerCase()}`
              }
              trend={totals.wentNegative ? 'DOWN' : undefined}
              trendIsGood={false}
            />
          </div>

          {totals.wentNegative && (
            <p className="mb-section rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger">
              {t.inventory.slNegative} — {t.inventory.slNegativeHint}
            </p>
          )}

          <DataTable
            columns={ledgerColumns()}
            rows={paged}
            rowKey={(r) => r.id}
            total={display.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
            isLoading={isLoading}
            emptyHeadline={t.inventory.slEmpty}
            emptyDescription={t.inventory.slEmptyHint}
            cardTitle={(r) => r.description}
            cardSubtitle={(r) => r.documentNo}
          />

          <p className="mt-3 text-xs text-muted-foreground">{t.inventory.slDerived}</p>
        </>
      )}
    </>
  );
}

export default LedgerScreen;
