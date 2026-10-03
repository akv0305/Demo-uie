'use client';

import * as React from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { terminology as t } from '@/config/terminology.config';
import {
  DataTable,
  DateField,
  FormLayout,
  FormSection,
  KpiCard,
  PageHeader,
  SearchableSelectField,
  SelectField,
  TextField,
  TextareaField,
  type Option,
  type RowAction,
} from '@/components/erp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatAmount } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { OpeningStock, OpeningStockLine } from '@/lib/data/types';
import { existingForStore, isFrozen, openingTotals } from '@/lib/inventory/opening-stock';
import { openingColumns } from './opening-columns';
import {
  OPENING_BASES,
  emptyOpening,
  openingSchema,
  type OpeningFormValues,
} from './opening-schema';

interface OpeningLineRow {
  id: string;
  itemId: string;
  itemCode?: string;
  description: string;
  uomCode: string;
  quantity: number;
  rate: number;
  batchNo?: string;
  binLocation?: string;
  remarks?: string;
}

let rowSeq = 0;
const newRowId = () => `row-${++rowSeq}`;

function toRow(l: OpeningStockLine): OpeningLineRow {
  return {
    id: l.id,
    itemId: l.itemId,
    itemCode: l.itemCode,
    description: l.description,
    uomCode: l.uomCode,
    quantity: l.quantity,
    rate: l.rate ?? 0,
    batchNo: l.batchNo,
    binLocation: l.binLocation,
    remarks: l.remarks,
  };
}

function toLine(r: OpeningLineRow): OpeningStockLine {
  return {
    id: r.id,
    itemId: r.itemId,
    itemCode: r.itemCode,
    description: r.description,
    uomCode: r.uomCode,
    quantity: r.quantity,
    rate: r.rate || undefined,
    batchNo: r.batchNo || undefined,
    binLocation: r.binLocation || undefined,
    remarks: r.remarks || undefined,
  };
}

function valuesOf(x: OpeningStock): OpeningFormValues {
  return emptyOpening({
    date: x.date,
    basis: x.basis,
    storeSiteId: x.storeSiteId,
    referenceNo: x.referenceNo ?? '',
    preparedBy: x.preparedBy,
    certifiedBy: x.certifiedBy ?? '',
    remarks: x.remarks ?? '',
  });
}

export interface OpeningScreenProps {
  rows: OpeningStock[];
  isLoading: boolean;
  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];
  storeOptions: Option[];
  itemOptions: (Option & { uomCode?: string; gstRate?: number })[];
  employeeOptions: Option[];
  onCreate: (
    values: OpeningFormValues,
    lines: OpeningStockLine[],
    approve: boolean,
  ) => Promise<void>;
  onUpdate: (
    id: string,
    values: OpeningFormValues,
    lines: OpeningStockLine[],
    approve: boolean,
  ) => Promise<void>;
}

export function OpeningScreen({
  rows,
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
  storeOptions,
  itemOptions,
  employeeOptions,
  onCreate,
  onUpdate,
}: OpeningScreenProps) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<OpeningStock | null>(null);
  const [lines, setLines] = React.useState<OpeningLineRow[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  const form = useForm<OpeningFormValues>({
    resolver: zodResolver(openingSchema),
    defaultValues: emptyOpening(),
    mode: 'onBlur',
  });
  const values = form.watch();

  const totals = React.useMemo(() => openingTotals(rows), [rows]);

  const storeName = React.useCallback(
    (siteId: string) => storeOptions.find((o) => o.value === siteId)?.label ?? siteId,
    [storeOptions],
  );

  /** Approved opening stock is history, not a working document (D-153). */
  const frozen = editing ? isFrozen(editing) : false;

  /** A second entry for the same store adds rather than replaces (D-151). */
  const duplicate = React.useMemo(
    () =>
      values.storeSiteId
        ? existingForStore(rows, values.storeSiteId, editing?.id)
        : undefined,
    [rows, values.storeSiteId, editing],
  );

  const openNew = () => {
    setEditing(null);
    setLines([]);
    form.reset(emptyOpening({ storeSiteId: storeOptions[0]?.value ?? '' }));
    setOpen(true);
  };

  const openEdit = (x: OpeningStock) => {
    setEditing(x);
    setLines(x.lines.map(toRow));
    form.reset(valuesOf(x));
    setOpen(true);
  };

  const addRow = () => {
    setLines((prev) => [
      ...prev,
      {
        id: newRowId(),
        itemId: '',
        description: '',
        uomCode: '',
        quantity: 0,
        rate: 0,
      },
    ]);
  };

  const patchRow = (id: string, patch: Partial<OpeningLineRow>) =>
    setLines((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const pickItem = (rowId: string, itemId: string) => {
    const opt = itemOptions.find((o) => o.value === itemId);
    patchRow(rowId, {
      itemId,
      itemCode: typeof opt?.hint === 'string' ? opt.hint : undefined,
      description: opt?.label ?? '',
      uomCode: opt?.uomCode ?? '',
    });
  };

  const valueTotal = lines.reduce((sum, r) => sum + r.quantity * r.rate, 0);
  const unvaluedCount = lines.filter((r) => r.quantity > 0 && !r.rate).length;

  const save = async (asDraft: boolean) => {
    const valid = await form.trigger();
    if (!valid) return;
    const usable = lines.filter((r) => r.itemId && r.quantity > 0);
    if (!usable.length) return;
    setIsSaving(true);
    try {
      const payload = usable.map(toLine);
      if (editing) await onUpdate(editing.id, form.getValues(), payload, !asDraft);
      else await onCreate(form.getValues(), payload, !asDraft);
      setOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const rowActions: RowAction<OpeningStock>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
  ];

  const paged = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <PageHeader
        title={t.inventory.osFull}
        subtitle={t.inventory.osSubtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/home' },
          { label: t.nav.groupInventory },
          { label: t.inventory.osFull },
        ]}
        helpTopic="openingStock"
        primaryAction={{ label: t.inventory.osNew, icon: <Plus />, onClick: openNew }}
      />

      <div className="mb-section grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t.inventory.osKpiStores}
          value={String(totals.storesOpened)}
          comparison={`${totals.total} ${t.common.total.toLowerCase()}`}
        />
        <KpiCard
          label={t.inventory.osKpiValue}
          value={formatAmount(totals.openingValue)}
          comparison={`${totals.itemsCovered} ${t.inventory.osKpiItems.toLowerCase()}`}
        />
        <KpiCard
          label={t.inventory.osKpiUnvalued}
          value={String(totals.unvalued)}
          comparison={t.inventory.osKpiUnvaluedHint}
          trend={totals.unvalued > 0 ? 'UP' : undefined}
          trendIsGood={false}
        />
        <KpiCard
          label={t.inventory.osKpiPending}
          value={String(totals.pendingApproval)}
          comparison={t.inventory.osNotPosted}
        />
      </div>

      <div className="mb-section grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <SelectField
          id="os-project"
          label={t.masters.project}
          options={projectOptions}
          value={projectId}
          onChange={onProjectChange}
        />
      </div>

      <DataTable
        columns={openingColumns(storeName)}
        rows={paged}
        rowKey={(x) => x.id}
        total={rows.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        onRowClick={openEdit}
        rowActions={rowActions}
        isLoading={isLoading}
        emptyHeadline={t.inventory.osEmpty}
        emptyDescription={t.inventory.osEmptyHint}
        cardTitle={(x) => x.documentNo}
        cardSubtitle={(x) => storeName(x.storeSiteId)}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.inventory.osEdit : t.inventory.osNew}</DialogTitle>
          </DialogHeader>

          {frozen && (
            <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              {t.inventory.osFrozen}
            </p>
          )}
          {duplicate && !frozen && (
            <p className="rounded-md border border-warning/40 bg-warning/5 px-3 py-2 text-sm text-warning">
              {t.inventory.osDuplicate} ({duplicate.documentNo}) — {t.inventory.osDuplicateHint}
            </p>
          )}

          <FormLayout
            isDirty={form.formState.isDirty}
            isSaving={isSaving}
            onSaveDraft={() => void save(true)}
            onSubmit={() => void save(false)}
            onCancel={() => setOpen(false)}
          >
            <FormSection title={t.inventory.secOsDocument}>
              <DateField
                id="os-date"
                label={t.inventory.osCutOff}
                required
                helperText={t.inventory.osCutOffHint}
                value={values.date}
                onChange={(v) => form.setValue('date', v, { shouldDirty: true })}
                error={form.formState.errors.date?.message}
              />
              <SelectField
                id="os-basis"
                label={t.inventory.osBasis}
                required
                options={OPENING_BASES.map((v) => ({
                  value: v,
                  label: t.inventory[`ob${v}` as keyof typeof t.inventory] as string,
                }))}
                value={values.basis}
                onChange={(v) =>
                  form.setValue('basis', v as OpeningFormValues['basis'], { shouldDirty: true })
                }
              />
              <SelectField
                id="os-store"
                label={t.inventory.osStore}
                required
                options={storeOptions}
                value={values.storeSiteId}
                onChange={(v) => form.setValue('storeSiteId', v, { shouldDirty: true })}
                error={form.formState.errors.storeSiteId?.message}
              />
              <TextField
                id="os-reference"
                label={t.inventory.osReferenceNo}
                value={values.referenceNo ?? ''}
                onChange={(v) => form.setValue('referenceNo', v, { shouldDirty: true })}
                maxLength={80}
              />
            </FormSection>

            <FormSection title={t.inventory.secOsLines} columns={1}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[66rem] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-2">{t.masters.items}</th>
                      <th className="w-16 py-2 pr-2">{t.masters.uom}</th>
                      <th className="w-28 py-2 pr-2 text-right">{t.inventory.osQuantity}</th>
                      <th className="w-28 py-2 pr-2 text-right">{t.inventory.osRate}</th>
                      <th className="w-28 py-2 pr-2 text-right">{t.inventory.osValue}</th>
                      <th className="w-28 py-2 pr-2">{t.inventory.saBinLocation}</th>
                      <th className="w-28 py-2 pr-2">{t.common.remarks}</th>
                      <th className="w-10 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((r) => {
                      const unvalued = r.quantity > 0 && !r.rate;
                      return (
                        <tr key={r.id} className="border-b border-border/60 align-top">
                          <td className="py-2 pr-2">
                            <SearchableSelectField
                              id={`os-item-${r.id}`}
                              label=""
                              options={itemOptions}
                              value={r.itemId}
                              onChange={(v) => pickItem(r.id, v)}
                            />
                          </td>
                          <td className="py-2 pr-2 text-muted-foreground">{r.uomCode || ''}</td>
                          <td className="py-2 pr-2">
                            <Input
                              type="number"
                              inputMode="decimal"
                              className="text-right"
                              value={r.quantity || ''}
                              onChange={(e) => patchRow(r.id, { quantity: Number(e.target.value) })}
                              disabled={frozen}
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              type="number"
                              inputMode="decimal"
                              className={cn('text-right', unvalued && 'border-warning')}
                              value={r.rate || ''}
                              onChange={(e) => patchRow(r.id, { rate: Number(e.target.value) })}
                              disabled={frozen}
                            />
                            {unvalued && (
                              <p className="mt-1 text-xs text-warning">
                                {t.inventory.osUnvaluedHint}
                              </p>
                            )}
                          </td>
                          <td className="num py-2 pr-2 text-right">
                            {formatAmount(r.quantity * r.rate)}
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              value={r.binLocation ?? ''}
                              onChange={(e) => patchRow(r.id, { binLocation: e.target.value })}
                              maxLength={60}
                              disabled={frozen}
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              value={r.remarks ?? ''}
                              onChange={(e) => patchRow(r.id, { remarks: e.target.value })}
                              maxLength={160}
                              disabled={frozen}
                            />
                          </td>
                          <td className="py-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="iconSm"
                              aria-label={t.common.remove}
                              disabled={frozen}
                              onClick={() => setLines((prev) => prev.filter((x) => x.id !== r.id))}
                            >
                              <Trash2 />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRow}
                  disabled={frozen}
                >
                  <Plus />
                  {t.common.addRow}
                </Button>
                <p className="flex flex-col items-end text-sm">
                  <span className="num font-medium text-foreground">
                    {t.common.total}: {formatAmount(valueTotal)}
                  </span>
                  {unvaluedCount > 0 && (
                    <span className="text-xs text-warning">
                      {unvaluedCount} — {t.inventory.osUnvaluedHint}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{t.inventory.osRateHint}</span>
                </p>
              </div>
            </FormSection>

            <FormSection title={t.inventory.secOsAuthorisation}>
              <SearchableSelectField
                id="os-prepared-by"
                label={t.inventory.osPreparedBy}
                required
                options={employeeOptions}
                value={values.preparedBy}
                onChange={(v) => form.setValue('preparedBy', v, { shouldDirty: true })}
                error={form.formState.errors.preparedBy?.message}
              />
              <SearchableSelectField
                id="os-certified-by"
                label={t.inventory.osCertifiedBy}
                options={employeeOptions}
                value={values.certifiedBy ?? ''}
                onChange={(v) => form.setValue('certifiedBy', v, { shouldDirty: true })}
              />
              <TextareaField
                id="os-remarks"
                label={t.common.remarks}
                rows={2}
                className="md:col-span-2"
                value={values.remarks ?? ''}
                onChange={(v) => form.setValue('remarks', v, { shouldDirty: true })}
                maxLength={600}
              />
            </FormSection>
          </FormLayout>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default OpeningScreen;
