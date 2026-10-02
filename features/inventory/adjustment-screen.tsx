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
import { formatAmount, formatQuantity } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { StockAdjustment, StockAdjustmentLine } from '@/lib/data/types';
import {
  adjustmentTotals,
  isWithinTolerance,
  lineValue,
  needsReason,
  variancePct,
  varianceQty,
} from '@/lib/inventory/adjustment';
import { adjustmentColumns } from './adjustment-columns';
import {
  ADJUSTMENT_TYPES,
  adjustmentSchema,
  emptyAdjustment,
  type AdjustmentFormValues,
} from './adjustment-schema';

/**
 * The count sheet carries two quantities per line and derives the third. No
 * shared grid can express that, so the grid is local to this screen (D-139).
 */
interface AdjustmentLineRow {
  id: string;
  itemId: string;
  itemCode?: string;
  description: string;
  uomCode: string;
  systemQty: number;
  physicalQty: number;
  rate: number;
  tolerancePct: number;
  reason?: string;
  batchNo?: string;
  binLocation?: string;
  remarks?: string;
}

let rowSeq = 0;
const newRowId = () => `row-${++rowSeq}`;

function toRow(l: StockAdjustmentLine): AdjustmentLineRow {
  return {
    id: l.id,
    itemId: l.itemId,
    itemCode: l.itemCode,
    description: l.description,
    uomCode: l.uomCode,
    systemQty: l.systemQty,
    physicalQty: l.physicalQty,
    rate: l.rate ?? 0,
    tolerancePct: l.tolerancePct ?? 0,
    reason: l.reason,
    batchNo: l.batchNo,
    binLocation: l.binLocation,
    remarks: l.remarks,
  };
}

function toLine(r: AdjustmentLineRow): StockAdjustmentLine {
  return {
    id: r.id,
    itemId: r.itemId,
    itemCode: r.itemCode,
    description: r.description,
    uomCode: r.uomCode,
    systemQty: r.systemQty,
    physicalQty: r.physicalQty,
    rate: r.rate || undefined,
    tolerancePct: r.tolerancePct || undefined,
    reason: r.reason || undefined,
    batchNo: r.batchNo || undefined,
    binLocation: r.binLocation || undefined,
    remarks: r.remarks || undefined,
  };
}

function valuesOf(x: StockAdjustment): AdjustmentFormValues {
  return emptyAdjustment({
    date: x.date,
    adjustmentType: x.adjustmentType,
    storeSiteId: x.storeSiteId,
    countSheetNo: x.countSheetNo ?? '',
    reason: x.reason ?? '',
    countedBy: x.countedBy,
    verifiedBy: x.verifiedBy ?? '',
    remarks: x.remarks ?? '',
  });
}

export interface AdjustmentScreenProps {
  rows: StockAdjustment[];
  isLoading: boolean;
  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];
  storeOptions: Option[];
  itemOptions: (Option & { uomCode?: string; gstRate?: number })[];
  employeeOptions: Option[];
  /** `true` posts the adjustment to stock; a draft is only a count sheet (D-143). */
  onCreate: (
    values: AdjustmentFormValues,
    lines: StockAdjustmentLine[],
    approve: boolean,
  ) => Promise<void>;
  onUpdate: (
    id: string,
    values: AdjustmentFormValues,
    lines: StockAdjustmentLine[],
    approve: boolean,
  ) => Promise<void>;
}

export function AdjustmentScreen({
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
}: AdjustmentScreenProps) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<StockAdjustment | null>(null);
  const [lines, setLines] = React.useState<AdjustmentLineRow[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  const form = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: emptyAdjustment(),
    mode: 'onBlur',
  });
  const values = form.watch();

  const totals = React.useMemo(() => adjustmentTotals(rows), [rows]);

  const storeName = React.useCallback(
    (siteId: string) => storeOptions.find((o) => o.value === siteId)?.label ?? siteId,
    [storeOptions],
  );

  const openNew = () => {
    setEditing(null);
    setLines([]);
    form.reset(emptyAdjustment({ storeSiteId: storeOptions[0]?.value ?? '' }));
    setOpen(true);
  };

  const openEdit = (x: StockAdjustment) => {
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
        systemQty: 0,
        physicalQty: 0,
        rate: 0,
        tolerancePct: 0,
      },
    ]);
  };

  const patchRow = (id: string, patch: Partial<AdjustmentLineRow>) =>
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

  const shortageTotal = lines
    .map(toLine)
    .filter((l) => !isWithinTolerance(l) && varianceQty(l) < 0)
    .reduce((sum, l) => sum + Math.abs(lineValue(l)), 0);
  const excessTotal = lines
    .map(toLine)
    .filter((l) => !isWithinTolerance(l) && varianceQty(l) > 0)
    .reduce((sum, l) => sum + lineValue(l), 0);
  const netTotal = excessTotal - shortageTotal;

  /** A line with no item is not a count; a zero-against-zero line is noise. */
  const usableLines = () => lines.filter((r) => r.itemId && (r.systemQty > 0 || r.physicalQty > 0));

  const save = async (asDraft: boolean) => {
    const valid = await form.trigger();
    if (!valid) return;
    const usable = usableLines();
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

  const rowActions: RowAction<StockAdjustment>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
  ];

  const paged = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <PageHeader
        title={t.inventory.saFull}
        subtitle={t.inventory.saSubtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/home' },
          { label: t.nav.groupInventory },
          { label: t.inventory.saFull },
        ]}
        helpTopic="stockAdjustment"
        primaryAction={{ label: t.inventory.saNew, icon: <Plus />, onClick: openNew }}
      />

      <div className="mb-section grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t.inventory.saKpiCounts}
          value={String(totals.thisMonth)}
          comparison={`${totals.total} ${t.common.total.toLowerCase()}`}
        />
        <KpiCard
          label={t.inventory.saKpiShortage}
          value={formatAmount(totals.shortageValue)}
          comparison={`${totals.withVariance} ${t.inventory.saKpiVarianceHint.toLowerCase()}`}
          trend={totals.shortageValue > 0 ? 'UP' : undefined}
          trendIsGood={false}
        />
        <KpiCard
          label={t.inventory.saKpiWriteOff}
          value={String(totals.writeOffs)}
          comparison={
            totals.writeOffValue > 0
              ? `${t.inventory.saKpiWriteOffHint} — ${formatAmount(totals.writeOffValue)}`
              : t.inventory.saKpiWriteOffHint
          }
        />
        <KpiCard
          label={t.inventory.saKpiPending}
          value={String(totals.pendingApproval)}
          comparison={t.inventory.saKpiPendingHint}
        />
      </div>

      <div className="mb-section grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <SelectField
          id="sa-project"
          label={t.masters.project}
          options={projectOptions}
          value={projectId}
          onChange={onProjectChange}
        />
      </div>

      <DataTable
        columns={adjustmentColumns(storeName)}
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
        emptyHeadline={t.inventory.saEmpty}
        emptyDescription={t.inventory.saEmptyHint}
        cardTitle={(x) => x.documentNo}
        cardSubtitle={(x) => storeName(x.storeSiteId)}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.inventory.saEdit : t.inventory.saNew}</DialogTitle>
          </DialogHeader>

          <FormLayout
            isDirty={form.formState.isDirty}
            isSaving={isSaving}
            onSaveDraft={() => void save(true)}
            onSubmit={() => void save(false)}
            onCancel={() => setOpen(false)}
          >
            <FormSection title={t.inventory.secSaDocument}>
              <DateField
                id="sa-date"
                label={t.common.date}
                required
                value={values.date}
                onChange={(v) => form.setValue('date', v, { shouldDirty: true })}
                error={form.formState.errors.date?.message}
              />
              <SelectField
                id="sa-type"
                label={t.inventory.saType}
                required
                options={ADJUSTMENT_TYPES.map((v) => ({
                  value: v,
                  label: t.inventory[`at${v}` as keyof typeof t.inventory] as string,
                }))}
                value={values.adjustmentType}
                onChange={(v) =>
                  form.setValue('adjustmentType', v as AdjustmentFormValues['adjustmentType'], {
                    shouldDirty: true,
                  })
                }
              />
              <SelectField
                id="sa-store"
                label={t.inventory.saStore}
                required
                options={storeOptions}
                value={values.storeSiteId}
                onChange={(v) => form.setValue('storeSiteId', v, { shouldDirty: true })}
                error={form.formState.errors.storeSiteId?.message}
              />
              <TextField
                id="sa-count-sheet"
                label={t.inventory.saCountSheetNo}
                value={values.countSheetNo ?? ''}
                onChange={(v) => form.setValue('countSheetNo', v, { shouldDirty: true })}
                maxLength={40}
              />
              <TextareaField
                id="sa-reason"
                label={t.inventory.saReason}
                rows={2}
                className="md:col-span-2"
                required={needsReason(values.adjustmentType)}
                value={values.reason ?? ''}
                onChange={(v) => form.setValue('reason', v, { shouldDirty: true })}
                error={form.formState.errors.reason?.message}
                maxLength={400}
              />
            </FormSection>

            <FormSection title={t.inventory.secSaLines} columns={1}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[76rem] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-2">{t.masters.items}</th>
                      <th className="w-16 py-2 pr-2">{t.masters.uom}</th>
                      <th className="w-24 py-2 pr-2 text-right">{t.inventory.saSystemQty}</th>
                      <th className="w-24 py-2 pr-2 text-right">{t.inventory.saPhysicalQty}</th>
                      <th className="w-24 py-2 pr-2 text-right">{t.inventory.saVarianceQty}</th>
                      <th className="w-20 py-2 pr-2 text-right">{t.inventory.saTolerancePct}</th>
                      <th className="w-24 py-2 pr-2 text-right">{t.inventory.saRate}</th>
                      <th className="w-28 py-2 pr-2 text-right">{t.common.amount}</th>
                      <th className="w-32 py-2 pr-2">{t.inventory.saReason}</th>
                      <th className="w-10 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((r) => {
                      const line = toLine(r);
                      const diff = varianceQty(line);
                      const ok = isWithinTolerance(line);
                      const pct = variancePct(line);
                      return (
                        <tr key={r.id} className="border-b border-border/60 align-top">
                          <td className="py-2 pr-2">
                            <SearchableSelectField
                              id={`sa-item-${r.id}`}
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
                              value={r.systemQty || ''}
                              onChange={(e) => patchRow(r.id, { systemQty: Number(e.target.value) })}
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              type="number"
                              inputMode="decimal"
                              className="text-right"
                              value={r.physicalQty || ''}
                              onChange={(e) =>
                                patchRow(r.id, { physicalQty: Number(e.target.value) })
                              }
                            />
                          </td>
                          {/* Derived, never entered — there is no direction to choose (D-139). */}
                          <td className="num py-2 pr-2 text-right">
                            {diff === 0 ? (
                              <span className="text-muted-foreground">—</span>
                            ) : (
                              <span
                                className={cn(
                                  ok
                                    ? 'text-muted-foreground'
                                    : diff < 0
                                      ? 'text-danger'
                                      : 'text-success',
                                )}
                              >
                                {formatQuantity(diff)}
                                <span className="ml-1 text-xs">({pct.toFixed(1)}%)</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              type="number"
                              inputMode="decimal"
                              className="text-right"
                              value={r.tolerancePct || ''}
                              onChange={(e) =>
                                patchRow(r.id, { tolerancePct: Number(e.target.value) })
                              }
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              type="number"
                              inputMode="decimal"
                              className="text-right"
                              value={r.rate || ''}
                              onChange={(e) => patchRow(r.id, { rate: Number(e.target.value) })}
                            />
                          </td>
                          <td className="num py-2 pr-2 text-right">
                            {ok ? (
                              <span className="text-xs text-muted-foreground">
                                {t.inventory.saReconciled}
                              </span>
                            ) : (
                              <span className={diff < 0 ? 'text-danger' : 'text-success'}>
                                {formatAmount(lineValue(line))}
                              </span>
                            )}
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              value={r.reason ?? ''}
                              onChange={(e) => patchRow(r.id, { reason: e.target.value })}
                              maxLength={200}
                            />
                          </td>
                          <td className="py-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="iconSm"
                              aria-label={t.common.remove}
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
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                  <Plus />
                  {t.common.addRow}
                </Button>
                <p className="flex flex-col items-end text-sm">
                  <span
                    className={cn(
                      'num font-medium',
                      netTotal < 0 ? 'text-danger' : netTotal > 0 ? 'text-success' : 'text-foreground',
                    )}
                  >
                    {t.inventory.saNetEffect}: {formatAmount(netTotal)}
                  </span>
                  {shortageTotal > 0 && (
                    <span className="num text-xs text-danger">
                      {t.inventory.saShortage}: {formatAmount(shortageTotal)}
                    </span>
                  )}
                  {excessTotal > 0 && (
                    <span className="num text-xs text-success">
                      {t.inventory.saExcess}: {formatAmount(excessTotal)}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{t.inventory.saRateHint}</span>
                </p>
              </div>
            </FormSection>

            <FormSection title={t.inventory.secSaAuthorisation}>
              <SearchableSelectField
                id="sa-counted-by"
                label={t.inventory.saCountedBy}
                required
                options={employeeOptions}
                value={values.countedBy}
                onChange={(v) => form.setValue('countedBy', v, { shouldDirty: true })}
                error={form.formState.errors.countedBy?.message}
              />
              <SearchableSelectField
                id="sa-verified-by"
                label={t.inventory.saVerifiedBy}
                helperText={t.inventory.saToleranceHint}
                options={employeeOptions}
                value={values.verifiedBy ?? ''}
                onChange={(v) => form.setValue('verifiedBy', v, { shouldDirty: true })}
              />
              <TextareaField
                id="sa-remarks"
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

export default AdjustmentScreen;
