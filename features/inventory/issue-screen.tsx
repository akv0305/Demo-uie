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
  NumberField,
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
import type { MaterialIssue, MaterialIssueLine } from '@/lib/data/types';
import { issueTotals, lineValue, shortQty } from '@/lib/inventory/issue';
import { issueColumns } from './issue-columns';
import { ISSUE_TYPES, emptyIssue, issueSchema, type IssueFormValues } from './issue-schema';

/**
 * Issue lines carry requested against issued (D-124), which the shared
 * LineItemsGrid cannot express, so the grid is local to this screen.
 */
interface IssueLineRow {
  id: string;
  itemId: string;
  itemCode?: string;
  description: string;
  uomCode: string;
  requestedQty: number;
  issuedQty: number;
  rate: number;
  wbsId?: string;
  binLocation?: string;
  batchNo?: string;
  isReturnable: boolean;
  expectedReturnDate?: string;
  returnedQty?: number;
  remarks?: string;
}

let rowSeq = 0;
const newRowId = () => `row-${++rowSeq}`;

function toRow(l: MaterialIssueLine): IssueLineRow {
  return {
    id: l.id,
    itemId: l.itemId,
    itemCode: l.itemCode,
    description: l.description,
    uomCode: l.uomCode,
    requestedQty: l.requestedQty,
    issuedQty: l.issuedQty,
    rate: l.rate ?? 0,
    wbsId: l.wbsId,
    binLocation: l.binLocation,
    batchNo: l.batchNo,
    isReturnable: !!l.isReturnable,
    expectedReturnDate: l.expectedReturnDate,
    returnedQty: l.returnedQty,
    remarks: l.remarks,
  };
}

function toLine(r: IssueLineRow): MaterialIssueLine {
  return {
    id: r.id,
    itemId: r.itemId,
    itemCode: r.itemCode,
    description: r.description,
    uomCode: r.uomCode,
    requestedQty: r.requestedQty,
    issuedQty: r.issuedQty,
    rate: r.rate || undefined,
    wbsId: r.wbsId || undefined,
    binLocation: r.binLocation || undefined,
    batchNo: r.batchNo || undefined,
    isReturnable: r.isReturnable || undefined,
    expectedReturnDate: r.isReturnable ? r.expectedReturnDate || undefined : undefined,
    returnedQty: r.returnedQty,
    remarks: r.remarks || undefined,
  };
}

export interface IssueScreenProps {
  rows: MaterialIssue[];
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
  equipmentOptions: Option[];
  /**
   * Stock position at a store, supplied by the container. Returns undefined
   * where the position is not known, in which case no stock check is shown.
   */
  stockAt?: (itemId: string, storeSiteId: string) => { quantity: number; rate: number } | undefined;
  onCreate: (values: IssueFormValues, lines: MaterialIssueLine[]) => Promise<void>;
  onUpdate: (id: string, values: IssueFormValues, lines: MaterialIssueLine[]) => Promise<void>;
}

export function IssueScreen({
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
  equipmentOptions,
  stockAt,
  onCreate,
  onUpdate,
}: IssueScreenProps) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MaterialIssue | null>(null);
  const [lines, setLines] = React.useState<IssueLineRow[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: emptyIssue(),
    mode: 'onBlur',
  });
  const values = form.watch();

  const totals = React.useMemo(() => issueTotals(rows), [rows]);

  const openNew = () => {
    setEditing(null);
    setLines([]);
    form.reset(emptyIssue({ storeSiteId: siteId, issuedBy: '', receivedBy: '' }));
    setOpen(true);
  };

  const openEdit = (m: MaterialIssue) => {
    setEditing(m);
    setLines(m.lines.map(toRow));
    form.reset(
      emptyIssue({
        date: m.date,
        issueType: m.issueType,
        storeSiteId: m.storeSiteId,
        requisitionNo: m.requisitionNo ?? '',
        requisitionDate: m.requisitionDate ?? '',
        subcontractorId: m.subcontractorId ?? '',
        equipmentId: m.equipmentId ?? '',
        equipmentHmr: m.equipmentHmr,
        wbsId: m.wbsId ?? '',
        purpose: m.purpose ?? '',
        gatePassNo: m.gatePassNo ?? '',
        vehicleNo: m.vehicleNo ?? '',
        issuedBy: m.issuedBy,
        receivedBy: m.receivedBy,
        remarks: m.remarks ?? '',
      }),
    );
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
        requestedQty: 0,
        issuedQty: 0,
        rate: 0,
        isReturnable: values.issueType === 'RETURNABLE',
      },
    ]);
  };

  const patchRow = (id: string, patch: Partial<IssueLineRow>) =>
    setLines((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  /** Picking an item pulls its UOM and the store's stock rate (D-123). */
  const pickItem = (rowId: string, itemId: string) => {
    const opt = itemOptions.find((o) => o.value === itemId);
    const stock = stockAt?.(itemId, values.storeSiteId);
    patchRow(rowId, {
      itemId,
      itemCode: typeof opt?.hint === 'string' ? opt.hint : undefined,
      description: opt?.label ?? '',
      uomCode: opt?.uomCode ?? '',
      rate: stock?.rate ?? 0,
    });
  };

  const gridTotal = lines.reduce(
    (sum, r) => sum + lineValue({ ...toLine(r) } as MaterialIssueLine),
    0,
  );

  const save = async (asDraft: boolean) => {
    const valid = await form.trigger();
    if (!valid) return;
    const usable = lines.filter((r) => r.itemId && r.issuedQty > 0);
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

  const rowActions: RowAction<MaterialIssue>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
  ];

  const paged = rows.slice((page - 1) * pageSize, page * pageSize);
  const needsParty = values.issueType === 'SUBCONTRACTOR' || values.issueType === 'EQUIPMENT';

  return (
    <>
      <PageHeader
        title={t.inventory.miFull}
        subtitle={t.inventory.miSubtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/home' },
          { label: t.nav.groupInventory },
          { label: t.inventory.miFull },
        ]}
        helpTopic="materialIssue"
        primaryAction={{ label: t.inventory.miNew, icon: <Plus />, onClick: openNew }}
      />

      <div className="mb-section grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t.inventory.miKpiIssues}
          value={String(totals.thisMonth)}
          comparison={`${totals.total} ${t.common.total.toLowerCase()}`}
        />
        <KpiCard label={t.inventory.miKpiValue} value={formatAmount(totals.issueValue)} />
        <KpiCard
          label={t.inventory.miKpiShort}
          value={String(totals.withShortIssue)}
          comparison={t.inventory.miKpiShortHint}
        />
        <KpiCard
          label={t.inventory.miKpiReturnPending}
          value={String(totals.returnPending)}
          comparison={
            totals.returnOverdue > 0
              ? `${totals.returnOverdue} ${t.inventory.miKpiReturnOverdue.toLowerCase()}`
              : undefined
          }
          trend={totals.returnOverdue > 0 ? 'UP' : undefined}
          trendIsGood={false}
        />
      </div>

      <div className="mb-section grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <SelectField
          id="mi-project"
          label={t.masters.project}
          options={projectOptions}
          value={projectId}
          onChange={onProjectChange}
        />
      </div>

      <DataTable
        columns={issueColumns()}
        rows={paged}
        rowKey={(m) => m.id}
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
        emptyHeadline={t.inventory.miEmpty}
        emptyDescription={t.inventory.miEmptyHint}
        cardTitle={(m) => m.documentNo}
        cardSubtitle={(m) => m.purpose ?? m.subcontractorName ?? ''}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.inventory.miEdit : t.inventory.miNew}</DialogTitle>
          </DialogHeader>

          <FormLayout
            isDirty={form.formState.isDirty}
            isSaving={isSaving}
            onSaveDraft={() => void save(true)}
            onSubmit={() => void save(false)}
            onCancel={() => setOpen(false)}
          >
            <FormSection title={t.inventory.secMiDocument}>
              <DateField
                id="mi-date"
                label={t.common.date}
                required
                value={values.date}
                onChange={(v) => form.setValue('date', v, { shouldDirty: true })}
                error={form.formState.errors.date?.message}
              />
              <SelectField
                id="mi-type"
                label={t.inventory.miType}
                required
                options={ISSUE_TYPES.map((v) => ({
                  value: v,
                  label: t.inventory[`it${v}` as keyof typeof t.inventory] as string,
                }))}
                value={values.issueType}
                onChange={(v) =>
                  form.setValue('issueType', v as IssueFormValues['issueType'], {
                    shouldDirty: true,
                  })
                }
              />
              <SelectField
                id="mi-store"
                label={t.inventory.miStore}
                required
                options={storeOptions}
                value={values.storeSiteId}
                onChange={(v) => form.setValue('storeSiteId', v, { shouldDirty: true })}
                error={form.formState.errors.storeSiteId?.message}
              />
              <TextField
                id="mi-req-no"
                label={t.inventory.miRequisitionNo}
                value={values.requisitionNo ?? ''}
                onChange={(v) => form.setValue('requisitionNo', v, { shouldDirty: true })}
                maxLength={40}
              />
              <DateField
                id="mi-req-date"
                label={t.inventory.miRequisitionDate}
                value={values.requisitionDate ?? ''}
                onChange={(v) => form.setValue('requisitionDate', v, { shouldDirty: true })}
              />
              <SearchableSelectField
                id="mi-wbs"
                label={t.inventory.miCostCode}
                options={wbsOptions}
                value={values.wbsId ?? ''}
                onChange={(v) => form.setValue('wbsId', v, { shouldDirty: true })}
              />
              <TextField
                id="mi-purpose"
                label={t.inventory.miPurpose}
                className="md:col-span-2"
                value={values.purpose ?? ''}
                onChange={(v) => form.setValue('purpose', v, { shouldDirty: true })}
                maxLength={200}
              />
            </FormSection>

            {needsParty && (
              <FormSection title={t.inventory.secMiParty}>
                {values.issueType === 'SUBCONTRACTOR' && (
                  <SearchableSelectField
                    id="mi-sub"
                    label={t.inventory.miSubcontractor}
                    required
                    options={subcontractorOptions}
                    value={values.subcontractorId ?? ''}
                    onChange={(v) => form.setValue('subcontractorId', v, { shouldDirty: true })}
                    error={form.formState.errors.subcontractorId?.message}
                  />
                )}
                {values.issueType === 'EQUIPMENT' && (
                  <>
                    <SearchableSelectField
                      id="mi-eqp"
                      label={t.inventory.miEquipment}
                      required
                      options={equipmentOptions}
                      value={values.equipmentId ?? ''}
                      onChange={(v) => form.setValue('equipmentId', v, { shouldDirty: true })}
                      error={form.formState.errors.equipmentId?.message}
                    />
                    <NumberField
                      id="mi-hmr"
                      label={t.inventory.miEquipmentHmr}
                      value={values.equipmentHmr}
                      onChange={(v) =>
                        form.setValue('equipmentHmr', v === '' ? undefined : v, {
                          shouldDirty: true,
                        })
                      }
                    />
                  </>
                )}
              </FormSection>
            )}

            <FormSection title={t.inventory.secMiLines} columns={1}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[60rem] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-2">{t.masters.items}</th>
                      <th className="w-20 py-2 pr-2">{t.masters.uom}</th>
                      <th className="w-24 py-2 pr-2 text-right">{t.inventory.miRequestedQty}</th>
                      <th className="w-24 py-2 pr-2 text-right">{t.inventory.miIssuedQty}</th>
                      <th className="w-24 py-2 pr-2 text-right">{t.inventory.miAvailableQty}</th>
                      <th className="w-24 py-2 pr-2 text-right">{t.inventory.miRate}</th>
                      <th className="w-28 py-2 pr-2 text-right">{t.common.amount}</th>
                      <th className="w-10 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((r) => {
                      const stock = stockAt?.(r.itemId, values.storeSiteId);
                      const over = !!stock && r.issuedQty > stock.quantity;
                      const short = shortQty(toLine(r));
                      return (
                        <tr key={r.id} className="border-b border-border/60 align-top">
                          <td className="py-2 pr-2">
                            <SearchableSelectField
                              id={`mi-item-${r.id}`}
                              label=""
                              options={itemOptions}
                              value={r.itemId}
                              onChange={(v) => pickItem(r.id, v)}
                            />
                            {short > 0 && (
                              <p className="mt-1 text-xs text-warning">
                                {t.inventory.miShortQty} {formatQuantity(short)}
                              </p>
                            )}
                          </td>
                          <td className="py-2 pr-2 text-muted-foreground">{r.uomCode || '—'}</td>
                          <td className="py-2 pr-2">
                            <Input
                              type="number"
                              inputMode="decimal"
                              className="text-right"
                              value={r.requestedQty || ''}
                              onChange={(e) =>
                                patchRow(r.id, { requestedQty: Number(e.target.value) })
                              }
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              type="number"
                              inputMode="decimal"
                              className={cn('text-right', over && 'border-warning')}
                              value={r.issuedQty || ''}
                              onChange={(e) => patchRow(r.id, { issuedQty: Number(e.target.value) })}
                            />
                            {over && (
                              <p className="mt-1 text-xs text-warning">
                                {t.inventory.miExceedsStock}
                              </p>
                            )}
                          </td>
                          <td className="num py-2 pr-2 text-right text-muted-foreground">
                            {stock ? formatQuantity(stock.quantity) : '—'}
                          </td>
                          <td className="num py-2 pr-2 text-right text-muted-foreground">
                            {formatAmount(r.rate)}
                          </td>
                          <td className="num py-2 pr-2 text-right">
                            {formatAmount(r.issuedQty * r.rate)}
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

              <div className="flex items-center justify-between gap-3">
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                  <Plus />
                  {t.common.addRow}
                </Button>
                <p className="num text-sm font-medium text-foreground">{formatAmount(gridTotal)}</p>
              </div>
            </FormSection>

            <FormSection title={t.inventory.secMiGatePass}>
              <TextField
                id="mi-gate-pass"
                label={t.inventory.miGatePassNo}
                value={values.gatePassNo ?? ''}
                onChange={(v) => form.setValue('gatePassNo', v, { shouldDirty: true })}
                maxLength={40}
              />
              <TextField
                id="mi-vehicle"
                label={t.inventory.miVehicleNo}
                value={values.vehicleNo ?? ''}
                onChange={(v) => form.setValue('vehicleNo', v, { shouldDirty: true })}
                maxLength={20}
              />
            </FormSection>

            <FormSection title={t.inventory.secMiAuthorisation}>
              <SearchableSelectField
                id="mi-issued-by"
                label={t.inventory.miIssuedBy}
                required
                options={employeeOptions}
                value={values.issuedBy}
                onChange={(v) => form.setValue('issuedBy', v, { shouldDirty: true })}
                error={form.formState.errors.issuedBy?.message}
              />
              <SearchableSelectField
                id="mi-received-by"
                label={t.inventory.miReceivedBy}
                required
                options={employeeOptions}
                value={values.receivedBy}
                onChange={(v) => form.setValue('receivedBy', v, { shouldDirty: true })}
                error={form.formState.errors.receivedBy?.message}
              />
              <TextareaField
                id="mi-remarks"
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

export default IssueScreen;
