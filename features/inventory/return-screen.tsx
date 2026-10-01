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
import type {
  MaterialIssue,
  MaterialReturn,
  MaterialReturnLine,
  ReturnCondition,
} from '@/lib/data/types';
import {
  issueLinePending,
  returnTotals,
  seedLinesFromIssue,
} from '@/lib/inventory/material-return';
import { returnColumns } from './return-columns';
import {
  RETURN_CONDITIONS,
  RETURN_TYPES,
  emptyReturn,
  returnSchema,
  type ReturnFormValues,
} from './return-schema';

/**
 * Return lines split the returned quantity into restocked and damaged
 * (D-129), which the shared LineItemsGrid cannot express, so the grid is
 * local to this screen.
 */
interface ReturnLineRow {
  id: string;
  issueLineId?: string;
  itemId: string;
  itemCode?: string;
  description: string;
  uomCode: string;
  returnedQty: number;
  restockedQty: number;
  damagedQty: number;
  condition: ReturnCondition;
  rate: number;
  wbsId?: string;
  binLocation?: string;
  remarks?: string;
  /** Still out against the issue line, carried for the inline warning. */
  pendingQty?: number;
}

let rowSeq = 0;
const newRowId = () => `row-${++rowSeq}`;

function toRow(l: MaterialReturnLine): ReturnLineRow {
  return {
    id: l.id,
    issueLineId: l.issueLineId,
    itemId: l.itemId,
    itemCode: l.itemCode,
    description: l.description,
    uomCode: l.uomCode,
    returnedQty: l.returnedQty,
    restockedQty: l.restockedQty,
    damagedQty: l.damagedQty,
    condition: l.condition,
    rate: l.rate ?? 0,
    wbsId: l.wbsId,
    binLocation: l.binLocation,
    remarks: l.remarks,
  };
}

function toLine(r: ReturnLineRow): MaterialReturnLine {
  return {
    id: r.id,
    issueLineId: r.issueLineId,
    itemId: r.itemId,
    itemCode: r.itemCode,
    description: r.description,
    uomCode: r.uomCode,
    returnedQty: r.returnedQty,
    restockedQty: r.restockedQty,
    damagedQty: r.damagedQty,
    condition: r.condition,
    rate: r.rate || undefined,
    wbsId: r.wbsId || undefined,
    binLocation: r.binLocation || undefined,
    remarks: r.remarks || undefined,
  };
}

export interface ReturnScreenProps {
  rows: MaterialReturn[];
  isLoading: boolean;
  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];
  siteId: string;
  siteOptions: Option[];
  storeOptions: Option[];
  itemOptions: (Option & { uomCode?: string; gstRate?: number })[];
  wbsOptions: Option[];
  employeeOptions: Option[];
  subcontractorOptions: Option[];
  /** Issues with material still out against them. */
  issues: MaterialIssue[];
  onCreate: (values: ReturnFormValues, lines: MaterialReturnLine[]) => Promise<void>;
  onUpdate: (id: string, values: ReturnFormValues, lines: MaterialReturnLine[]) => Promise<void>;
}

export function ReturnScreen({
  rows,
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
  siteId,
  siteOptions,
  storeOptions,
  itemOptions,
  wbsOptions,
  employeeOptions,
  subcontractorOptions,
  issues,
  onCreate,
  onUpdate,
}: ReturnScreenProps) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MaterialReturn | null>(null);
  const [lines, setLines] = React.useState<ReturnLineRow[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnSchema),
    defaultValues: emptyReturn(),
    mode: 'onBlur',
  });
  const values = form.watch();

  const totals = React.useMemo(() => returnTotals(rows), [rows]);

  const openNew = () => {
    setEditing(null);
    setLines([]);
    form.reset(emptyReturn({ storeSiteId: siteId }));
    setOpen(true);
  };

  const openEdit = (r: MaterialReturn) => {
    setEditing(r);
    setLines(r.lines.map(toRow));
    form.reset(
      emptyReturn({
        date: r.date,
        returnType: r.returnType,
        storeSiteId: r.storeSiteId,
        issueId: r.issueId ?? '',
        subcontractorId: r.subcontractorId ?? '',
        wbsId: r.wbsId ?? '',
        reason: r.reason ?? '',
        gatePassNo: r.gatePassNo ?? '',
        vehicleNo: r.vehicleNo ?? '',
        returnedBy: r.returnedBy,
        receivedBy: r.receivedBy,
        inspectedBy: r.inspectedBy ?? '',
        remarks: r.remarks ?? '',
      }),
    );
    setOpen(true);
  };

  /** Picking an issue pulls the lines still out against it. */
  const pickIssue = (issueId: string) => {
    form.setValue('issueId', issueId, { shouldDirty: true });
    const issue = issues.find((m) => m.id === issueId);
    if (!issue) return;
    form.setValue('storeSiteId', issue.storeSiteId, { shouldDirty: true });
    if (issue.subcontractorId) {
      form.setValue('subcontractorId', issue.subcontractorId, { shouldDirty: true });
    }
    setLines(
      seedLinesFromIssue(issue).map((l) => {
        const il = issue.lines.find((x) => x.id === l.issueLineId);
        return {
          ...toRow({ ...l, id: newRowId() }),
          pendingQty: il ? issueLinePending(il) : undefined,
        };
      }),
    );
  };

  const addRow = () => {
    setLines((prev) => [
      ...prev,
      {
        id: newRowId(),
        itemId: '',
        description: '',
        uomCode: '',
        returnedQty: 0,
        restockedQty: 0,
        damagedQty: 0,
        condition: 'GOOD',
        rate: 0,
      },
    ]);
  };

  const patchRow = (id: string, patch: Partial<ReturnLineRow>) =>
    setLines((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  /** A free-entry line has no issue to inherit the rate from (Q-95). */
  const pickItem = (rowId: string, itemId: string) => {
    const opt = itemOptions.find((o) => o.value === itemId);
    patchRow(rowId, {
      itemId,
      itemCode: typeof opt?.hint === 'string' ? opt.hint : undefined,
      description: opt?.label ?? '',
      uomCode: opt?.uomCode ?? '',
    });
  };

  /** Typing the returned quantity assumes all of it is good until told otherwise. */
  const setReturnedQty = (r: ReturnLineRow, qty: number) =>
    patchRow(r.id, {
      returnedQty: qty,
      restockedQty: Math.max(0, qty - r.damagedQty),
    });

  const setDamagedQty = (r: ReturnLineRow, qty: number) =>
    patchRow(r.id, {
      damagedQty: qty,
      restockedQty: Math.max(0, r.returnedQty - qty),
      condition: qty <= 0 ? 'GOOD' : qty >= r.returnedQty ? 'SCRAP' : 'DAMAGED',
    });

  const creditTotal = lines.reduce((sum, r) => sum + r.restockedQty * r.rate, 0);
  const lossTotal = lines.reduce((sum, r) => sum + r.damagedQty * r.rate, 0);

  const save = async (asDraft: boolean) => {
    const valid = await form.trigger();
    if (!valid) return;
    const usable = lines.filter((r) => r.itemId && r.returnedQty > 0);
    if (!usable.length) return;
    setIsSaving(true);
    try {
      const payload = usable.map(toLine);
      if (editing) await onUpdate(editing.id, form.getValues(), payload);
      else await onCreate(form.getValues(), payload);
      setOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const rowActions: RowAction<MaterialReturn>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
  ];

  const paged = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <PageHeader
        title={t.inventory.mrFull}
        subtitle={t.inventory.mrSubtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/home' },
          { label: t.nav.groupInventory },
          { label: t.inventory.mrFull },
        ]}
        helpTopic="materialReturn"
        primaryAction={{ label: t.inventory.mrNew, icon: <Plus />, onClick: openNew }}
      />

      <div className="mb-section grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t.inventory.mrKpiReturns}
          value={String(totals.thisMonth)}
          comparison={`${totals.total} ${t.common.total.toLowerCase()}`}
        />
        <KpiCard
          label={t.inventory.mrKpiRestockValue}
          value={formatAmount(totals.restockValue)}
        />
        <KpiCard
          label={t.inventory.mrKpiDamage}
          value={String(totals.withDamage)}
          comparison={
            totals.damagedValue > 0
              ? `${t.inventory.mrKpiDamageValue} ${formatAmount(totals.damagedValue)}`
              : undefined
          }
          trend={totals.damagedValue > 0 ? 'UP' : undefined}
          trendIsGood={false}
        />
        <KpiCard
          label={t.inventory.mrKpiWithoutIssue}
          value={String(totals.withoutIssue)}
          comparison={t.inventory.mrKpiWithoutIssueHint}
        />
      </div>

      <div className="mb-section grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <SelectField
          id="mr-project"
          label={t.masters.project}
          options={projectOptions}
          value={projectId}
          onChange={onProjectChange}
        />
      </div>

      <DataTable
        columns={returnColumns()}
        rows={paged}
        rowKey={(r) => r.id}
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
        emptyHeadline={t.inventory.mrEmpty}
        emptyDescription={t.inventory.mrEmptyHint}
        cardTitle={(r) => r.documentNo}
        cardSubtitle={(r) => r.reason ?? r.subcontractorName ?? ''}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.inventory.mrEdit : t.inventory.mrNew}</DialogTitle>
          </DialogHeader>

          <FormLayout
            isDirty={form.formState.isDirty}
            isSaving={isSaving}
            onSaveDraft={() => void save(true)}
            onSubmit={() => void save(false)}
            onCancel={() => setOpen(false)}
          >
            <FormSection title={t.inventory.secMrDocument}>
              <DateField
                id="mr-date"
                label={t.common.date}
                required
                value={values.date}
                onChange={(v) => form.setValue('date', v, { shouldDirty: true })}
                error={form.formState.errors.date?.message}
              />
              <SelectField
                id="mr-type"
                label={t.inventory.mrType}
                required
                options={RETURN_TYPES.map((v) => ({
                  value: v,
                  label: t.inventory[`rt${v}` as keyof typeof t.inventory] as string,
                }))}
                value={values.returnType}
                onChange={(v) =>
                  form.setValue('returnType', v as ReturnFormValues['returnType'], {
                    shouldDirty: true,
                  })
                }
              />
              <SelectField
                id="mr-store"
                label={t.inventory.mrStore}
                required
                options={storeOptions}
                value={values.storeSiteId}
                onChange={(v) => form.setValue('storeSiteId', v, { shouldDirty: true })}
                error={form.formState.errors.storeSiteId?.message}
              />
              <SearchableSelectField
                id="mr-wbs"
                label={t.inventory.mrCostCode}
                options={wbsOptions}
                value={values.wbsId ?? ''}
                onChange={(v) => form.setValue('wbsId', v, { shouldDirty: true })}
              />
              <TextField
                id="mr-reason"
                label={t.inventory.mrReason}
                className="md:col-span-2"
                value={values.reason ?? ''}
                onChange={(v) => form.setValue('reason', v, { shouldDirty: true })}
                maxLength={200}
              />
            </FormSection>

            <FormSection title={t.inventory.secMrReference}>
              <SearchableSelectField
                id="mr-issue"
                label={t.inventory.mrIssueRef}
                helperText={t.inventory.mrIssueRefHint}
                options={issues.map((m) => ({
                  value: m.id,
                  label: m.documentNo,
                  hint: m.purpose,
                }))}
                value={values.issueId ?? ''}
                onChange={pickIssue}
              />
              {values.returnType === 'FROM_SUBCONTRACTOR' && (
                <SearchableSelectField
                  id="mr-sub"
                  label={t.inventory.mrSubcontractor}
                  required
                  options={subcontractorOptions}
                  value={values.subcontractorId ?? ''}
                  onChange={(v) => form.setValue('subcontractorId', v, { shouldDirty: true })}
                  error={form.formState.errors.subcontractorId?.message}
                />
              )}
            </FormSection>

            <FormSection title={t.inventory.secMrLines} columns={1}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[64rem] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-2">{t.masters.items}</th>
                      <th className="w-20 py-2 pr-2">{t.masters.uom}</th>
                      <th className="w-24 py-2 pr-2 text-right">{t.inventory.mrPendingQty}</th>
                      <th className="w-24 py-2 pr-2 text-right">{t.inventory.mrReturnedQty}</th>
                      <th className="w-24 py-2 pr-2 text-right">{t.inventory.mrDamagedQty}</th>
                      <th className="w-24 py-2 pr-2 text-right">{t.inventory.mrRestockedQty}</th>
                      <th className="w-32 py-2 pr-2">{t.inventory.mrCondition}</th>
                      <th className="w-24 py-2 pr-2 text-right">{t.inventory.mrRate}</th>
                      <th className="w-28 py-2 pr-2 text-right">{t.common.amount}</th>
                      <th className="w-10 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((r) => {
                      const over = r.pendingQty !== undefined && r.returnedQty > r.pendingQty;
                      const unbalanced =
                        Math.abs(r.restockedQty + r.damagedQty - r.returnedQty) > 0.001;
                      return (
                        <tr key={r.id} className="border-b border-border/60 align-top">
                          <td className="py-2 pr-2">
                            {r.issueLineId ? (
                              <span className="flex flex-col">
                                <span className="text-foreground">{r.description}</span>
                                {r.itemCode ? (
                                  <span className="text-xs text-muted-foreground">
                                    {r.itemCode}
                                  </span>
                                ) : null}
                              </span>
                            ) : (
                              <SearchableSelectField
                                id={`mr-item-${r.id}`}
                                label=""
                                options={itemOptions}
                                value={r.itemId}
                                onChange={(v) => pickItem(r.id, v)}
                              />
                            )}
                            {unbalanced && (
                              <p className="mt-1 text-xs text-warning">
                                {t.inventory.mrUnbalanced}
                              </p>
                            )}
                          </td>
                          <td className="py-2 pr-2 text-muted-foreground">{r.uomCode || '—'}</td>
                          <td className="num py-2 pr-2 text-right text-muted-foreground">
                            {r.pendingQty !== undefined ? formatQuantity(r.pendingQty) : '—'}
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              type="number"
                              inputMode="decimal"
                              className={cn('text-right', over && 'border-warning')}
                              value={r.returnedQty || ''}
                              onChange={(e) => setReturnedQty(r, Number(e.target.value))}
                            />
                            {over && (
                              <p className="mt-1 text-xs text-warning">
                                {t.inventory.mrExceedsIssued}
                              </p>
                            )}
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              type="number"
                              inputMode="decimal"
                              className="text-right"
                              value={r.damagedQty || ''}
                              onChange={(e) => setDamagedQty(r, Number(e.target.value))}
                            />
                          </td>
                          <td className="num py-2 pr-2 text-right">
                            {formatQuantity(r.restockedQty)}
                          </td>
                          <td className="py-2 pr-2">
                            <SelectField
                              id={`mr-cond-${r.id}`}
                              label=""
                              options={RETURN_CONDITIONS.map((c) => ({
                                value: c,
                                label: t.inventory[`rc${c}` as keyof typeof t.inventory] as string,
                              }))}
                              value={r.condition}
                              onChange={(v) =>
                                patchRow(r.id, { condition: v as ReturnCondition })
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
                              disabled={!!r.issueLineId}
                            />
                          </td>
                          <td className="num py-2 pr-2 text-right">
                            {formatAmount(r.restockedQty * r.rate)}
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
                  <span className="num font-medium text-foreground">
                    {t.inventory.mrKpiRestockValue}: {formatAmount(creditTotal)}
                  </span>
                  {lossTotal > 0 && (
                    <span className="num text-xs text-danger">
                      {t.inventory.mrKpiDamageValue}: {formatAmount(lossTotal)}
                    </span>
                  )}
                </p>
              </div>
            </FormSection>

            <FormSection title={t.inventory.secMrGatePass}>
              <TextField
                id="mr-gate-pass"
                label={t.inventory.mrGatePassNo}
                value={values.gatePassNo ?? ''}
                onChange={(v) => form.setValue('gatePassNo', v, { shouldDirty: true })}
                maxLength={40}
              />
              <TextField
                id="mr-vehicle"
                label={t.inventory.mrVehicleNo}
                value={values.vehicleNo ?? ''}
                onChange={(v) => form.setValue('vehicleNo', v, { shouldDirty: true })}
                maxLength={20}
              />
            </FormSection>

            <FormSection title={t.inventory.secMrAuthorisation}>
              <SearchableSelectField
                id="mr-returned-by"
                label={t.inventory.mrReturnedBy}
                required
                options={employeeOptions}
                value={values.returnedBy}
                onChange={(v) => form.setValue('returnedBy', v, { shouldDirty: true })}
                error={form.formState.errors.returnedBy?.message}
              />
              <SearchableSelectField
                id="mr-received-by"
                label={t.inventory.mrReceivedBy}
                required
                options={employeeOptions}
                value={values.receivedBy}
                onChange={(v) => form.setValue('receivedBy', v, { shouldDirty: true })}
                error={form.formState.errors.receivedBy?.message}
              />
              <SearchableSelectField
                id="mr-inspected-by"
                label={t.inventory.mrInspectedBy}
                options={employeeOptions}
                value={values.inspectedBy ?? ''}
                onChange={(v) => form.setValue('inspectedBy', v, { shouldDirty: true })}
              />
              <TextareaField
                id="mr-remarks"
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

export default ReturnScreen;
