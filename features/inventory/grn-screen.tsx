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
import type {
  GoodsReceipt,
  GoodsReceiptLine,
  GrnLineCondition,
  PoLine,
  PurchaseOrder,
} from '@/lib/data/types';
import {
  OVER_RECEIPT_TOLERANCE_PCT,
  grnTotals,
  poLinePending,
  seedLinesFromPo,
} from '@/lib/inventory/grn';
import { grnColumns } from './grn-columns';
import {
  GRN_CONDITIONS,
  GRN_TYPES,
  emptyGrn,
  grnSchema,
  type GrnFormValues,
} from './grn-schema';

/**
 * GRN lines carry three quantities (D-116), which the shared LineItemsGrid
 * cannot express, so the grid is local to this screen.
 */
interface GrnLineRow {
  id: string;
  poLineId?: string;
  itemId: string;
  itemCode?: string;
  description: string;
  specification?: string;
  makeReceived?: string;
  uomCode: string;
  /** Carried from the order for the over-receipt check. Not keyed. */
  orderedQty?: number;
  pendingQty?: number;
  challanQty: number | '';
  receivedQty: number | '';
  acceptedQty: number | '';
  rejectedQty: number | '';
  condition: GrnLineCondition;
  rejectionReason?: string;
  rate?: number | '';
  wbsId?: string;
  binLocation?: string;
  batchNo?: string;
  remarks?: string;
}

function n(v: number | '' | undefined): number {
  return typeof v === 'number' && !Number.isNaN(v) ? v : 0;
}

function validateGrnLine(r: GrnLineRow): Record<string, string> {
  const e: Record<string, string> = {};
  if (!r.description.trim()) e.description = t.common.requiredField;
  if (!r.uomCode) e.uomCode = t.common.requiredField;
  if (n(r.receivedQty) <= 0) e.receivedQty = t.common.requiredField;
  if (n(r.acceptedQty) > n(r.receivedQty)) e.acceptedQty = t.inventory.grnAcceptedExceedsReceived;
  if (n(r.acceptedQty) + n(r.rejectedQty) > n(r.receivedQty)) {
    e.rejectedQty = t.inventory.grnSplitMismatch;
  }
  if (n(r.rejectedQty) > 0 && !r.rejectionReason?.trim()) {
    e.rejectionReason = t.inventory.grnRejectionReasonRequired;
  }
  if (
    r.pendingQty !== undefined &&
    n(r.acceptedQty) > r.pendingQty * (1 + OVER_RECEIPT_TOLERANCE_PCT / 100)
  ) {
    e.acceptedQty = t.inventory.grnOverReceiptHint;
  }
  return e;
}

function newGrnLine(): GrnLineRow {
  return {
    id: `GRNL-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    itemId: '',
    description: '',
    uomCode: '',
    challanQty: '',
    receivedQty: '',
    acceptedQty: '',
    rejectedQty: 0,
    condition: 'ACCEPTED',
  };
}

export interface GrnScreenProps {
  rows: GoodsReceipt[];
  isLoading: boolean;
  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];
  siteId: string;
  siteOptions: Option[];
  storeOptions: Option[];
  itemOptions: (Option & { uomCode?: string; gstRate?: number })[];
  employeeOptions: Option[];
  /** Approved orders with material still outstanding. */
  purchaseOrders: PurchaseOrder[];
  onCreate: (values: GrnFormValues, lines: GoodsReceiptLine[]) => Promise<void>;
  onUpdate: (id: string, values: GrnFormValues, lines: GoodsReceiptLine[]) => Promise<void>;
}

export function GrnScreen({
  rows,
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
  siteId,
  siteOptions,
  storeOptions,
  itemOptions,
  employeeOptions,
  purchaseOrders,
  onCreate,
  onUpdate,
}: GrnScreenProps) {
  const [editing, setEditing] = React.useState<GoodsReceipt | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [lines, setLines] = React.useState<GrnLineRow[]>([]);

  const form = useForm<GrnFormValues>({
    resolver: zodResolver(grnSchema),
    defaultValues: emptyGrn({ storeSiteId: siteId }),
    mode: 'onBlur',
  });
  const { errors } = form.formState;
  const values = form.watch();

  const totals = React.useMemo(() => grnTotals(rows), [rows]);
  const columns = React.useMemo(() => grnColumns(), []);

  const errorsByRow = React.useMemo(
    () => Object.fromEntries(lines.map((l) => [l.id, validateGrnLine(l)])),
    [lines],
  );
  const hasLineErrors = React.useMemo(
    () => Object.values(errorsByRow).some((e) => Object.keys(e).length > 0),
    [errorsByRow],
  );

  const previewValue = React.useMemo(
    () => lines.reduce((sum, l) => sum + n(l.acceptedQty) * n(l.rate), 0),
    [lines],
  );

  const update = (id: string, patch: Partial<GrnLineRow>) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  /**
   * Received quantity drives the split: what is not rejected is accepted,
   * which is how a storekeeper actually fills the register.
   */
  const setReceived = (id: string, received: number | '') =>
    setLines((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, receivedQty: received, acceptedQty: Math.max(0, n(received) - n(l.rejectedQty)) }
          : l,
      ),
    );

  const setRejected = (id: string, rejected: number | '') =>
    setLines((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              rejectedQty: rejected,
              acceptedQty: Math.max(0, n(l.receivedQty) - n(rejected)),
              condition:
                n(rejected) === 0
                  ? l.condition === 'PENDING_TEST'
                    ? 'PENDING_TEST'
                    : 'ACCEPTED'
                  : n(rejected) >= n(l.receivedQty)
                    ? 'REJECTED'
                    : 'PARTIALLY_REJECTED',
            }
          : l,
      ),
    );

  const pullPo = (po: PurchaseOrder) => {
    form.setValue('poId', po.id, { shouldDirty: true });
    form.setValue('grnType', 'AGAINST_PO', { shouldDirty: true });
    form.setValue('vendorId', po.vendorId, { shouldDirty: true });
    form.setValue('storeSiteId', po.deliverySiteId, { shouldDirty: true });
    setLines(
      seedLinesFromPo(po).map((l, i) => {
        const poLine = po.lines.find((p) => p.id === l.poLineId) as PoLine;
        return {
          ...l,
          id: `GRNL-${po.id}-${i + 1}`,
          orderedQty: poLine?.quantity,
          pendingQty: poLine ? poLinePending(poLine) : undefined,
        } as GrnLineRow;
      }),
    );
  };

  const reset = (g: GoodsReceipt | null) => {
    setEditing(g);
    setLines(
      g
        ? g.lines.map((l) => ({
            id: l.id,
            poLineId: l.poLineId,
            itemId: l.itemId,
            itemCode: l.itemCode,
            description: l.description,
            specification: l.specification,
            makeReceived: l.makeReceived,
            uomCode: l.uomCode,
            challanQty: l.challanQty,
            receivedQty: l.receivedQty,
            acceptedQty: l.acceptedQty,
            rejectedQty: l.rejectedQty,
            condition: l.condition,
            rejectionReason: l.rejectionReason,
            rate: l.rate ?? '',
            wbsId: l.wbsId,
            binLocation: l.binLocation,
            batchNo: l.batchNo,
            remarks: l.remarks,
          }))
        : [],
    );
    form.reset(
      g
        ? {
            date: g.date,
            grnType: g.grnType,
            poId: g.poId ?? '',
            vendorId: g.vendorId ?? '',
            challanNo: g.challanNo,
            challanDate: g.challanDate,
            invoiceNo: g.invoiceNo ?? '',
            invoiceDate: g.invoiceDate ?? '',
            lrNo: g.lrNo ?? '',
            lrDate: g.lrDate ?? '',
            vehicleNo: g.vehicleNo ?? '',
            transporterName: g.transporterName ?? '',
            gateEntryNo: g.gateEntryNo ?? '',
            weighbridgeSlipNo: g.weighbridgeSlipNo ?? '',
            grossWeight: g.grossWeight,
            tareWeight: g.tareWeight,
            netWeight: g.netWeight,
            storeSiteId: g.storeSiteId,
            receivedBy: g.receivedBy,
            inspectedBy: g.inspectedBy ?? '',
            testCertificateNo: g.testCertificateNo ?? '',
            remarks: g.remarks ?? '',
          }
        : emptyGrn({ storeSiteId: siteId }),
    );
    setIsOpen(true);
  };

  const submit = form.handleSubmit(async (v) => {
    if (hasLineErrors || lines.length === 0) return;
    setIsSaving(true);
    try {
      const payload: GoodsReceiptLine[] = lines.map((l) => ({
        id: l.id,
        poLineId: l.poLineId,
        itemId: l.itemId,
        itemCode: l.itemCode,
        description: l.description,
        specification: l.specification,
        makeReceived: l.makeReceived,
        uomCode: l.uomCode,
        challanQty: n(l.challanQty),
        receivedQty: n(l.receivedQty),
        acceptedQty: n(l.acceptedQty),
        rejectedQty: n(l.rejectedQty),
        condition: l.condition,
        rejectionReason: l.rejectionReason,
        rate: typeof l.rate === 'number' ? l.rate : undefined,
        wbsId: l.wbsId,
        binLocation: l.binLocation,
        batchNo: l.batchNo,
        remarks: l.remarks,
      }));
      if (editing) await onUpdate(editing.id, v, payload);
      else await onCreate(v, payload);
      setIsOpen(false);
    } finally {
      setIsSaving(false);
    }
  });

  const rowActions: RowAction<GoodsReceipt>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: reset },
  ];

  const openPos = purchaseOrders.filter(
    (p) => p.status === 'APPROVED' && p.lines.some((l) => poLinePending(l) > 0),
  );

  const cellInput = 'h-8 rounded-sm border-input px-2 text-sm shadow-none focus-visible:ring-1';

  return (
    <>
      <PageHeader
        title={t.inventory.grnFull}
        subtitle={t.inventory.grnSubtitle}
        helpTopic="grn"
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupInventory }]}
        primaryAction={{ label: t.inventory.grnNew, icon: <Plus />, onClick: () => reset(null) }}
      />

      <section className="mb-section grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t.inventory.grnKpiReceipts}
          value={String(totals.thisMonth)}
          comparison={`${totals.total} ${t.common.total.toLowerCase()}`}
        />
        <KpiCard label={t.inventory.grnKpiValue} value={formatAmount(totals.receiptValue)} />
        <KpiCard
          label={t.inventory.grnKpiRejection}
          value={String(totals.withRejection)}
          comparison={
            totals.rejectedValue > 0
              ? `${t.inventory.grnKpiRejectionHint}: ${formatAmount(totals.rejectedValue)}`
              : undefined
          }
          trend={totals.withRejection > 0 ? 'UP' : 'FLAT'}
          trendIsGood={totals.withRejection === 0}
        />
        <KpiCard
          label={t.inventory.grnKpiInvoiceAwaited}
          value={String(totals.invoiceAwaited)}
          comparison={t.inventory.grnKpiInvoiceAwaitedHint}
        />
      </section>

      <section className="mb-section max-w-sm">
        <SelectField
          id="grn-project"
          label={t.nav.project}
          value={projectId}
          onChange={onProjectChange}
          options={projectOptions}
        />
      </section>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(g) => g.id}
        isLoading={isLoading}
        onRowClick={reset}
        rowActions={rowActions}
        emptyHeadline={t.inventory.grnEmpty}
        emptyDescription={t.inventory.grnEmptyHint}
        cardTitle={(g) => g.documentNo}
        cardSubtitle={(g) => g.vendorName ?? g.challanNo}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.inventory.grnEdit : t.inventory.grnNew}</DialogTitle>
          </DialogHeader>

          <FormLayout
            isDirty={form.formState.isDirty || lines.length > 0}
            isSaving={isSaving}
            onSubmit={submit}
            onCancel={() => setIsOpen(false)}
            submitLabel={t.common.save}
          >
            <FormSection title={t.inventory.secGrnDocument}>
              {!editing && openPos.length > 0 && (
                <div className="md:col-span-2 rounded-lg border border-border bg-surface-muted p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.inventory.grnPullFromPo}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.inventory.grnPullHint}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {openPos.map((p) => (
                      <Button
                        key={p.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => pullPo(p)}
                      >
                        <Plus />
                        {p.documentNo} · {p.vendorName}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <SelectField
                id="grn-type"
                label={t.inventory.grnType}
                value={values.grnType}
                onChange={(v) =>
                  form.setValue('grnType', v as GrnFormValues['grnType'], { shouldDirty: true })
                }
                options={GRN_TYPES.map((g) => ({
                  value: g,
                  label: t.inventory[`gt${g}` as keyof typeof t.inventory] as string,
                }))}
              />
              <DateField
                id="grn-date"
                label={t.common.date}
                required
                value={values.date}
                onChange={(v) => form.setValue('date', v, { shouldDirty: true })}
                error={errors.date?.message}
              />
              <TextField
                id="grn-challan"
                label={t.inventory.grnChallanNo}
                required
                value={values.challanNo}
                onChange={(v) => form.setValue('challanNo', v, { shouldDirty: true })}
                error={errors.challanNo?.message}
                maxLength={40}
              />
              <DateField
                id="grn-challan-date"
                label={t.inventory.grnChallanDate}
                required
                value={values.challanDate}
                onChange={(v) => form.setValue('challanDate', v, { shouldDirty: true })}
                error={errors.challanDate?.message}
              />
              <TextField
                id="grn-invoice"
                label={t.inventory.grnInvoiceNo}
                value={values.invoiceNo}
                onChange={(v) => form.setValue('invoiceNo', v, { shouldDirty: true })}
                helperText={t.inventory.grnKpiInvoiceAwaitedHint}
                maxLength={40}
              />
              <DateField
                id="grn-invoice-date"
                label={t.inventory.grnInvoiceDate}
                value={values.invoiceDate}
                onChange={(v) => form.setValue('invoiceDate', v, { shouldDirty: true })}
              />
            </FormSection>

            <FormSection title={t.inventory.secGrnTransport}>
              <TextField
                id="grn-vehicle"
                label={t.inventory.grnVehicleNo}
                value={values.vehicleNo}
                onChange={(v) => form.setValue('vehicleNo', v.toUpperCase(), { shouldDirty: true })}
                maxLength={20}
              />
              <TextField
                id="grn-transporter"
                label={t.inventory.grnTransporter}
                value={values.transporterName}
                onChange={(v) => form.setValue('transporterName', v, { shouldDirty: true })}
                maxLength={80}
              />
              <TextField
                id="grn-lr"
                label={t.inventory.grnLrNo}
                value={values.lrNo}
                onChange={(v) => form.setValue('lrNo', v, { shouldDirty: true })}
                maxLength={40}
              />
              <TextField
                id="grn-gate"
                label={t.inventory.grnGateEntryNo}
                value={values.gateEntryNo}
                onChange={(v) => form.setValue('gateEntryNo', v, { shouldDirty: true })}
                maxLength={40}
              />
            </FormSection>

            <FormSection title={t.inventory.secGrnWeighbridge}>
              <TextField
                id="grn-wb"
                label={t.inventory.grnWeighbridge}
                value={values.weighbridgeSlipNo}
                onChange={(v) => form.setValue('weighbridgeSlipNo', v, { shouldDirty: true })}
                helperText={t.inventory.grnWeighbridgeHint}
                maxLength={40}
              />
              <NumberField
                id="grn-gross"
                label={t.inventory.grnGrossWeight}
                value={values.grossWeight ?? ''}
                onChange={(v) =>
                  form.setValue('grossWeight', v === '' ? undefined : v, { shouldDirty: true })
                }
              />
              <NumberField
                id="grn-tare"
                label={t.inventory.grnTareWeight}
                value={values.tareWeight ?? ''}
                onChange={(v) =>
                  form.setValue('tareWeight', v === '' ? undefined : v, { shouldDirty: true })
                }
              />
              <NumberField
                id="grn-net"
                label={t.inventory.grnNetWeight}
                value={values.netWeight ?? ''}
                onChange={(v) =>
                  form.setValue('netWeight', v === '' ? undefined : v, { shouldDirty: true })
                }
                helperText={
                  values.grossWeight !== undefined &&
                  values.tareWeight !== undefined &&
                  values.netWeight !== undefined &&
                  Math.abs(values.netWeight - (values.grossWeight - values.tareWeight)) > 0.001
                    ? t.inventory.grnWeighbridgeVariance
                    : undefined
                }
              />
            </FormSection>

            <FormSection title={t.inventory.secGrnLines}>
              <div className="md:col-span-2 flex flex-col gap-3">
                <div className="overflow-x-auto rounded-lg border border-border bg-surface">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-muted">
                      <tr className="border-b border-border">
                        <th className="min-w-[200px] px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t.common.description}
                        </th>
                        <th className="w-20 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t.common.uom}
                        </th>
                        <th className="w-24 px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t.inventory.grnPendingQty}
                        </th>
                        <th className="w-24 px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t.inventory.grnChallanQty}
                        </th>
                        <th className="w-24 px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t.inventory.grnReceivedQty}
                        </th>
                        <th className="w-24 px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t.inventory.grnRejectedQty}
                        </th>
                        <th className="w-24 px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t.inventory.grnAcceptedQty}
                        </th>
                        <th className="w-28 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t.inventory.grnBatchNo}
                        </th>
                        <th className="w-10 px-2 py-2" />
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                      {lines.map((l) => {
                        const e = errorsByRow[l.id] ?? {};
                        const short = Math.max(0, n(l.challanQty) - n(l.receivedQty));
                        return (
                          <React.Fragment key={l.id}>
                            <tr className="align-top">
                              <td className="px-2 py-2">
                                {l.poLineId ? (
                                  <>
                                    <span className="text-foreground">{l.description}</span>
                                    {l.makeReceived && (
                                      <p className="text-xs text-muted-foreground">
                                        {l.makeReceived}
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <SearchableSelectField
                                    id={`grn-item-${l.id}`}
                                    label=""
                                    value={l.itemId}
                                    onChange={(v) => {
                                      const item = itemOptions.find((o) => o.value === v);
                                      update(l.id, {
                                        itemId: v,
                                        description: item?.label ?? '',
                                        itemCode: item?.hint,
                                        uomCode: item?.uomCode ?? '',
                                      });
                                    }}
                                    options={itemOptions}
                                    error={e.description}
                                    className="[&_label]:hidden"
                                  />
                                )}
                              </td>
                              <td className="px-2 py-2">
                                <Input
                                  value={l.uomCode}
                                  onChange={(ev) =>
                                    update(l.id, { uomCode: ev.target.value.toUpperCase() })
                                  }
                                  aria-label={t.common.uom}
                                  className={cn(cellInput, e.uomCode && 'border-danger')}
                                />
                              </td>
                              <td className="num px-2 py-2 text-right text-xs text-muted-foreground">
                                {l.pendingQty === undefined ? '—' : formatQuantity(l.pendingQty)}
                              </td>
                              <td className="px-2 py-2">
                                <Input
                                  type="number"
                                  step="0.001"
                                  value={l.challanQty}
                                  onChange={(ev) =>
                                    update(l.id, {
                                      challanQty: ev.target.value === '' ? '' : Number(ev.target.value),
                                    })
                                  }
                                  aria-label={t.inventory.grnChallanQty}
                                  className={cn(cellInput, 'num')}
                                />
                              </td>
                              <td className="px-2 py-2">
                                <Input
                                  type="number"
                                  step="0.001"
                                  value={l.receivedQty}
                                  onChange={(ev) =>
                                    setReceived(
                                      l.id,
                                      ev.target.value === '' ? '' : Number(ev.target.value),
                                    )
                                  }
                                  aria-label={t.inventory.grnReceivedQty}
                                  className={cn(cellInput, 'num', e.receivedQty && 'border-danger')}
                                />
                                {short > 0 && (
                                  <p className="mt-1 text-xs text-warning">
                                    {t.inventory.grnShortQty} {formatQuantity(short)}
                                  </p>
                                )}
                              </td>
                              <td className="px-2 py-2">
                                <Input
                                  type="number"
                                  step="0.001"
                                  value={l.rejectedQty}
                                  onChange={(ev) =>
                                    setRejected(
                                      l.id,
                                      ev.target.value === '' ? '' : Number(ev.target.value),
                                    )
                                  }
                                  aria-label={t.inventory.grnRejectedQty}
                                  className={cn(cellInput, 'num', e.rejectedQty && 'border-danger')}
                                />
                              </td>
                              <td className="px-2 py-2">
                                <Input
                                  type="number"
                                  step="0.001"
                                  value={l.acceptedQty}
                                  onChange={(ev) =>
                                    update(l.id, {
                                      acceptedQty:
                                        ev.target.value === '' ? '' : Number(ev.target.value),
                                    })
                                  }
                                  aria-label={t.inventory.grnAcceptedQty}
                                  className={cn(cellInput, 'num', e.acceptedQty && 'border-danger')}
                                />
                                {e.acceptedQty && (
                                  <p role="alert" className="mt-1 text-xs text-danger">
                                    {e.acceptedQty}
                                  </p>
                                )}
                              </td>
                              <td className="px-2 py-2">
                                <Input
                                  value={l.batchNo ?? ''}
                                  onChange={(ev) => update(l.id, { batchNo: ev.target.value })}
                                  aria-label={t.inventory.grnBatchNo}
                                  className={cellInput}
                                />
                              </td>
                              <td className="px-2 py-2 text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="iconSm"
                                  aria-label={t.common.deleteRow}
                                  className="text-danger"
                                  onClick={() =>
                                    setLines((prev) => prev.filter((x) => x.id !== l.id))
                                  }
                                >
                                  <Trash2 />
                                </Button>
                              </td>
                            </tr>

                            {/* Condition and rejection reason sit under the row they belong to. */}
                            <tr className="bg-surface-muted/40">
                              <td colSpan={9} className="px-2 pb-2">
                                <div className="flex flex-wrap items-start gap-3">
                                  <SelectField
                                    id={`grn-cond-${l.id}`}
                                    label={t.inventory.grnCondition}
                                    value={l.condition}
                                    onChange={(v) =>
                                      update(l.id, { condition: v as GrnLineCondition })
                                    }
                                    options={GRN_CONDITIONS.map((c) => ({
                                      value: c,
                                      label: t.inventory[
                                        `gc${c}` as keyof typeof t.inventory
                                      ] as string,
                                    }))}
                                    className="w-48"
                                  />
                                  <TextField
                                    id={`grn-bin-${l.id}`}
                                    label={t.inventory.grnBin}
                                    value={l.binLocation ?? ''}
                                    onChange={(v) => update(l.id, { binLocation: v })}
                                    className="w-56"
                                    maxLength={60}
                                  />
                                  {n(l.rejectedQty) > 0 && (
                                    <TextField
                                      id={`grn-rej-${l.id}`}
                                      label={t.inventory.grnRejectionReason}
                                      required
                                      value={l.rejectionReason ?? ''}
                                      onChange={(v) => update(l.id, { rejectionReason: v })}
                                      error={e.rejectionReason}
                                      className="min-w-[18rem] flex-1"
                                      maxLength={200}
                                    />
                                  )}
                                </div>
                              </td>
                            </tr>
                          </React.Fragment>
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
                    onClick={() => setLines((prev) => [...prev, newGrnLine()])}
                  >
                    <Plus />
                    {t.common.addRow}
                  </Button>
                  <p className="flex items-baseline gap-3">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t.inventory.grnKpiValue}
                    </span>
                    <span className="num text-base font-heading text-foreground">
                      {formatAmount(previewValue)}
                    </span>
                  </p>
                </div>
              </div>
            </FormSection>

            <FormSection title={t.inventory.secGrnStore}>
              <SelectField
                id="grn-store"
                label={t.inventory.grnStore}
                required
                value={values.storeSiteId}
                onChange={(v) => form.setValue('storeSiteId', v, { shouldDirty: true })}
                options={storeOptions.length ? storeOptions : siteOptions}
                error={errors.storeSiteId?.message}
              />
              <SearchableSelectField
                id="grn-received-by"
                label={t.inventory.grnReceivedBy}
                required
                value={values.receivedBy}
                onChange={(v) => form.setValue('receivedBy', v, { shouldDirty: true })}
                options={employeeOptions}
                error={errors.receivedBy?.message}
              />
              <SearchableSelectField
                id="grn-inspected-by"
                label={t.inventory.grnInspectedBy}
                value={values.inspectedBy}
                onChange={(v) => form.setValue('inspectedBy', v, { shouldDirty: true })}
                options={employeeOptions}
              />
              <TextField
                id="grn-mtc"
                label={t.inventory.grnTestCertificate}
                value={values.testCertificateNo}
                onChange={(v) => form.setValue('testCertificateNo', v, { shouldDirty: true })}
                maxLength={60}
              />
              <TextareaField
                id="grn-remarks"
                label={t.common.remarks}
                rows={2}
                className="md:col-span-2"
                value={values.remarks}
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

export default GrnScreen;
