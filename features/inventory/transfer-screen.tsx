'use client';

import * as React from 'react';
import { Pencil, Plus, Trash2, Truck } from 'lucide-react';
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
import type { StockTransfer, StockTransferLine } from '@/lib/data/types';
import {
  exceedsDispatched,
  inTransitQty,
  seedReceipt,
  transferTotals,
} from '@/lib/inventory/stock-transfer';
import { transferColumns } from './transfer-columns';
import { emptyTransfer, transferSchema, type TransferFormValues } from './transfer-schema';

/**
 * A transfer line is dispatched once and received later, possibly short
 * (D-134). The shared LineItemsGrid has no second quantity column, so the
 * grid is local to this screen.
 */
interface TransferLineRow {
  id: string;
  itemId: string;
  itemCode?: string;
  description: string;
  uomCode: string;
  dispatchedQty: number;
  receivedQty: number;
  rate: number;
  fromBinLocation?: string;
  toBinLocation?: string;
  batchNo?: string;
  remarks?: string;
}

let rowSeq = 0;
const newRowId = () => `row-${++rowSeq}`;

function toRow(l: StockTransferLine): TransferLineRow {
  return {
    id: l.id,
    itemId: l.itemId,
    itemCode: l.itemCode,
    description: l.description,
    uomCode: l.uomCode,
    dispatchedQty: l.dispatchedQty,
    receivedQty: l.receivedQty,
    rate: l.rate ?? 0,
    fromBinLocation: l.fromBinLocation,
    toBinLocation: l.toBinLocation,
    batchNo: l.batchNo,
    remarks: l.remarks,
  };
}

function toLine(r: TransferLineRow): StockTransferLine {
  return {
    id: r.id,
    itemId: r.itemId,
    itemCode: r.itemCode,
    description: r.description,
    uomCode: r.uomCode,
    dispatchedQty: r.dispatchedQty,
    receivedQty: r.receivedQty,
    rate: r.rate || undefined,
    fromBinLocation: r.fromBinLocation || undefined,
    toBinLocation: r.toBinLocation || undefined,
    batchNo: r.batchNo || undefined,
    remarks: r.remarks || undefined,
  };
}

function valuesOf(x: StockTransfer): TransferFormValues {
  return emptyTransfer({
    date: x.date,
    fromSiteId: x.fromSiteId,
    toSiteId: x.toSiteId,
    toProjectId: x.toProjectId ?? '',
    challanNo: x.challanNo ?? '',
    vehicleNo: x.vehicleNo ?? '',
    transporterName: x.transporterName ?? '',
    lrNo: x.lrNo ?? '',
    reason: x.reason ?? '',
    dispatchedBy: x.dispatchedBy,
    receivedBy: x.receivedBy ?? '',
    receivedDate: x.receivedDate ?? '',
    remarks: x.remarks ?? '',
  });
}

export interface TransferScreenProps {
  rows: StockTransfer[];
  isLoading: boolean;
  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];
  /** Stores of this project — where material can go out from. */
  storeOptions: Option[];
  /** Every store, including other projects' (D-136). */
  toStoreOptions: Option[];
  itemOptions: (Option & { uomCode?: string; gstRate?: number })[];
  employeeOptions: Option[];
  /** `true` once dispatched; the stage is derived from quantities, not set by hand. */
  onCreate: (
    values: TransferFormValues,
    lines: StockTransferLine[],
    dispatched: boolean,
  ) => Promise<void>;
  onUpdate: (
    id: string,
    values: TransferFormValues,
    lines: StockTransferLine[],
    dispatched: boolean,
  ) => Promise<void>;
}

export function TransferScreen({
  rows,
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
  storeOptions,
  toStoreOptions,
  itemOptions,
  employeeOptions,
  onCreate,
  onUpdate,
}: TransferScreenProps) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<StockTransfer | null>(null);
  const [lines, setLines] = React.useState<TransferLineRow[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: emptyTransfer(),
    mode: 'onBlur',
  });
  const values = form.watch();

  const totals = React.useMemo(() => transferTotals(rows), [rows]);

  /** The register shows store names; the record carries only ids. */
  const storeName = React.useCallback(
    (siteId: string) =>
      toStoreOptions.find((o) => o.value === siteId)?.label ??
      storeOptions.find((o) => o.value === siteId)?.label ??
      siteId,
    [storeOptions, toStoreOptions],
  );

  /** Material not yet dispatched cannot have been received. */
  const isDispatched = editing ? editing.stage !== 'DRAFT' : false;

  const openNew = () => {
    setEditing(null);
    setLines([]);
    form.reset(emptyTransfer({ fromSiteId: storeOptions[0]?.value ?? '' }));
    setOpen(true);
  };

  const openEdit = (x: StockTransfer) => {
    setEditing(x);
    setLines(x.lines.map(toRow));
    form.reset(valuesOf(x));
    setOpen(true);
  };

  /** Opens the transfer with receipt assumed complete — the storekeeper corrects it. */
  const openReceipt = (x: StockTransfer) => {
    setEditing(x);
    setLines(seedReceipt(x).map(toRow));
    form.reset(
      valuesOf({ ...x, receivedDate: x.receivedDate ?? new Date().toISOString().slice(0, 10) }),
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
        dispatchedQty: 0,
        receivedQty: 0,
        rate: 0,
      },
    ]);
  };

  const patchRow = (id: string, patch: Partial<TransferLineRow>) =>
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

  const valueTotal = lines.reduce((sum, r) => sum + r.dispatchedQty * r.rate, 0);
  const transitTotal = lines.reduce(
    (sum, r) => sum + Math.max(0, r.dispatchedQty - r.receivedQty) * r.rate,
    0,
  );

  /**
   * Save Draft leaves a new transfer undispatched; it never pulls a dispatched
   * one back off the road. Submit dispatches it (D-137).
   */
  const save = async (asDraft: boolean) => {
    const valid = await form.trigger();
    if (!valid) return;
    const usable = lines.filter((r) => r.itemId && r.dispatchedQty > 0);
    if (!usable.length) return;
    const dispatched = asDraft ? isDispatched : true;
    setIsSaving(true);
    try {
      const payload = usable.map(toLine);
      if (editing) await onUpdate(editing.id, form.getValues(), payload, dispatched);
      else await onCreate(form.getValues(), payload, dispatched);
      setOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const rowActions: RowAction<StockTransfer>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
    { label: t.inventory.stEnterReceipt, icon: <Truck />, onSelect: openReceipt },
  ];

  const paged = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <PageHeader
        title={t.inventory.stFull}
        subtitle={t.inventory.stSubtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/home' },
          { label: t.nav.groupInventory },
          { label: t.inventory.stFull },
        ]}
        helpTopic="stockTransfer"
        primaryAction={{ label: t.inventory.stNew, icon: <Plus />, onClick: openNew }}
      />

      <div className="mb-section grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t.inventory.stKpiTransfers}
          value={String(totals.thisMonth)}
          comparison={`${totals.total} ${t.common.total.toLowerCase()}`}
        />
        <KpiCard
          label={t.inventory.stKpiInTransit}
          value={String(totals.inTransit)}
          comparison={
            totals.inTransitValue > 0
              ? `${t.inventory.stKpiInTransitHint} — ${formatAmount(totals.inTransitValue)}`
              : t.inventory.stKpiInTransitHint
          }
        />
        <KpiCard
          label={t.inventory.stKpiTransitLoss}
          value={String(totals.withTransitLoss)}
          comparison={
            totals.transitLossValue > 0
              ? `${t.inventory.stKpiTransitLossValue} ${formatAmount(totals.transitLossValue)}`
              : undefined
          }
          trend={totals.transitLossValue > 0 ? 'UP' : undefined}
          trendIsGood={false}
        />
        <KpiCard
          label={t.inventory.stKpiOpen}
          value={String(totals.open)}
          comparison={t.inventory.stKpiOpenHint}
        />
      </div>

      <div className="mb-section grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <SelectField
          id="st-project"
          label={t.masters.project}
          options={projectOptions}
          value={projectId}
          onChange={onProjectChange}
        />
      </div>

      <DataTable
        columns={transferColumns(storeName)}
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
        emptyHeadline={t.inventory.stEmpty}
        emptyDescription={t.inventory.stEmptyHint}
        cardTitle={(x) => x.documentNo}
        cardSubtitle={(x) => `${storeName(x.fromSiteId)} → ${storeName(x.toSiteId)}`}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.inventory.stEdit : t.inventory.stNew}</DialogTitle>
          </DialogHeader>

          <FormLayout
            isDirty={form.formState.isDirty}
            isSaving={isSaving}
            onSaveDraft={() => void save(true)}
            onSubmit={() => void save(false)}
            onCancel={() => setOpen(false)}
          >
            <FormSection title={t.inventory.secStDocument}>
              <DateField
                id="st-date"
                label={t.common.date}
                required
                value={values.date}
                onChange={(v) => form.setValue('date', v, { shouldDirty: true })}
                error={form.formState.errors.date?.message}
              />
              <TextField
                id="st-challan"
                label={t.inventory.stChallanNo}
                value={values.challanNo ?? ''}
                onChange={(v) => form.setValue('challanNo', v, { shouldDirty: true })}
                maxLength={40}
              />
              <TextField
                id="st-reason"
                label={t.inventory.stReason}
                className="md:col-span-2"
                value={values.reason ?? ''}
                onChange={(v) => form.setValue('reason', v, { shouldDirty: true })}
                maxLength={200}
              />
            </FormSection>

            <FormSection title={t.inventory.secStRoute}>
              <SelectField
                id="st-from"
                label={t.inventory.stFromStore}
                required
                options={storeOptions}
                value={values.fromSiteId}
                onChange={(v) => form.setValue('fromSiteId', v, { shouldDirty: true })}
                error={form.formState.errors.fromSiteId?.message}
              />
              <SearchableSelectField
                id="st-to"
                label={t.inventory.stToStore}
                required
                options={toStoreOptions}
                value={values.toSiteId}
                onChange={(v) => form.setValue('toSiteId', v, { shouldDirty: true })}
                error={form.formState.errors.toSiteId?.message}
              />
            </FormSection>

            <FormSection title={t.inventory.secStLines} columns={1}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[68rem] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-2">{t.masters.items}</th>
                      <th className="w-20 py-2 pr-2">{t.masters.uom}</th>
                      <th className="w-24 py-2 pr-2 text-right">{t.inventory.stDispatchedQty}</th>
                      <th className="w-24 py-2 pr-2 text-right">{t.inventory.stReceivedQty}</th>
                      <th className="w-24 py-2 pr-2 text-right">{t.inventory.stInTransitQty}</th>
                      <th className="w-24 py-2 pr-2 text-right">{t.inventory.stRate}</th>
                      <th className="w-28 py-2 pr-2 text-right">{t.common.amount}</th>
                      <th className="w-28 py-2 pr-2">{t.common.remarks}</th>
                      <th className="w-10 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((r) => {
                      const over = exceedsDispatched(toLine(r), r.receivedQty);
                      const transit = inTransitQty(toLine(r));
                      return (
                        <tr key={r.id} className="border-b border-border/60 align-top">
                          <td className="py-2 pr-2">
                            <SearchableSelectField
                              id={`st-item-${r.id}`}
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
                              value={r.dispatchedQty || ''}
                              onChange={(e) =>
                                patchRow(r.id, { dispatchedQty: Number(e.target.value) })
                              }
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              type="number"
                              inputMode="decimal"
                              className={cn('text-right', over && 'border-warning')}
                              value={r.receivedQty || ''}
                              onChange={(e) =>
                                patchRow(r.id, { receivedQty: Number(e.target.value) })
                              }
                              disabled={!isDispatched}
                            />
                            {over && (
                              <p className="mt-1 text-xs text-warning">
                                {t.inventory.stExceedsDispatched}
                              </p>
                            )}
                          </td>
                          <td className="num py-2 pr-2 text-right">
                            {transit > 0 ? (
                              <span className="text-warning">{formatQuantity(transit)}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
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
                            {formatAmount(r.dispatchedQty * r.rate)}
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              value={r.remarks ?? ''}
                              onChange={(e) => patchRow(r.id, { remarks: e.target.value })}
                              maxLength={120}
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
                  <span className="num font-medium text-foreground">
                    {t.common.total}: {formatAmount(valueTotal)}
                  </span>
                  <span className="text-xs text-muted-foreground">{t.inventory.stRateHint}</span>
                  {transitTotal > 0 && (
                    <span className="num text-xs text-warning">
                      {t.inventory.stInTransitQty}: {formatAmount(transitTotal)}
                    </span>
                  )}
                </p>
              </div>
            </FormSection>

            <FormSection title={t.inventory.secStTransport}>
              <TextField
                id="st-vehicle"
                label={t.inventory.stVehicleNo}
                value={values.vehicleNo ?? ''}
                onChange={(v) => form.setValue('vehicleNo', v, { shouldDirty: true })}
                maxLength={20}
              />
              <TextField
                id="st-transporter"
                label={t.inventory.stTransporter}
                value={values.transporterName ?? ''}
                onChange={(v) => form.setValue('transporterName', v, { shouldDirty: true })}
                maxLength={80}
              />
              <TextField
                id="st-lr"
                label={t.inventory.stLrNo}
                value={values.lrNo ?? ''}
                onChange={(v) => form.setValue('lrNo', v, { shouldDirty: true })}
                maxLength={40}
              />
            </FormSection>

            {isDispatched && (
              <FormSection title={t.inventory.secStReceipt}>
                <DateField
                  id="st-received-date"
                  label={t.inventory.stReceivedDate}
                  value={values.receivedDate ?? ''}
                  onChange={(v) => form.setValue('receivedDate', v, { shouldDirty: true })}
                />
                <SearchableSelectField
                  id="st-received-by"
                  label={t.inventory.stReceivedBy}
                  helperText={t.inventory.stReceiptHint}
                  options={employeeOptions}
                  value={values.receivedBy ?? ''}
                  onChange={(v) => form.setValue('receivedBy', v, { shouldDirty: true })}
                />
              </FormSection>
            )}

            <FormSection title={t.inventory.secStAuthorisation}>
              <SearchableSelectField
                id="st-dispatched-by"
                label={t.inventory.stDispatchedBy}
                required
                options={employeeOptions}
                value={values.dispatchedBy}
                onChange={(v) => form.setValue('dispatchedBy', v, { shouldDirty: true })}
                error={form.formState.errors.dispatchedBy?.message}
              />
              <TextareaField
                id="st-remarks"
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

export default TransferScreen;
