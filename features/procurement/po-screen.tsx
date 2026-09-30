'use client';

import * as React from 'react';
import { Pencil, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { terminology as t } from '@/config/terminology.config';
import {
  AmountField,
  CheckboxField,
  DataTable,
  DateField,
  FormLayout,
  FormSection,
  KpiCard,
  LineItemsGrid,
  NumberField,
  PageHeader,
  SearchableSelectField,
  SelectField,
  TextField,
  TextareaField,
  type LineRow,
  type Option,
  type RowAction,
} from '@/components/erp';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatAmount } from '@/lib/format';
import type { PoLine, PurchaseOrder, Quotation } from '@/lib/data/types';
import { netRate } from '@/lib/procurement/quotation';
import { poTotals } from '@/lib/procurement/purchase-order';
import { poColumns } from './po-columns';
import {
  PO_BASES,
  PO_DELIVERY_TERMS,
  emptyPo,
  poSchema,
  type PoFormValues,
} from './po-schema';

export interface PoScreenProps {
  rows: PurchaseOrder[];
  isLoading: boolean;
  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];
  siteId: string;
  siteOptions: Option[];
  itemOptions: (Option & { uomCode?: string; gstRate?: number })[];
  wbsOptions: Option[];
  vendorOptions: Option[];
  /** Accepted offers available to raise an order from. */
  quotations: Quotation[];
  onCreate: (values: PoFormValues, lines: PoLine[]) => Promise<void>;
  onUpdate: (id: string, values: PoFormValues, lines: PoLine[]) => Promise<void>;
}

/** PO lines reuse the shared grid; received quantity is held aside from it. */
function toGridRows(lines: PoLine[]): LineRow[] {
  return lines.map((l) => ({
    id: l.id,
    itemId: l.itemId,
    itemCode: l.itemCode,
    description: l.description,
    uomCode: l.uomCode,
    quantity: l.quantity,
    rate: l.rate,
    discountPct: l.discountPct ?? 0,
    gstRate: l.gstRate,
    wbsCode: l.wbsId,
  }));
}

export function PoScreen({
  rows,
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
  siteId,
  siteOptions,
  itemOptions,
  wbsOptions,
  vendorOptions,
  quotations,
  onCreate,
  onUpdate,
}: PoScreenProps) {
  const [editing, setEditing] = React.useState<PurchaseOrder | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [lines, setLines] = React.useState<LineRow[]>([]);
  /** Preserved across edits so the grid never loses GRN progress. */
  const [meta, setMeta] = React.useState<Record<string, Partial<PoLine>>>({});

  const form = useForm<PoFormValues>({
    resolver: zodResolver(poSchema),
    defaultValues: emptyPo(projectId, siteId),
    mode: 'onBlur',
  });
  const { errors } = form.formState;
  const values = form.watch();

  const totals = React.useMemo(() => poTotals(rows), [rows]);
  const columns = React.useMemo(() => poColumns(), []);

  const preview = React.useMemo(() => {
    const basic = lines.reduce((sum, l) => {
      const q = typeof l.quantity === 'number' ? l.quantity : 0;
      const r = typeof l.rate === 'number' ? l.rate : 0;
      return sum + q * r * (1 - (typeof l.discountPct === 'number' ? l.discountPct : 0) / 100);
    }, 0);
    const tax = lines.reduce((sum, l) => {
      const q = typeof l.quantity === 'number' ? l.quantity : 0;
      const r = typeof l.rate === 'number' ? l.rate : 0;
      const net = q * r * (1 - (typeof l.discountPct === 'number' ? l.discountPct : 0) / 100);
      return sum + net * ((typeof l.gstRate === 'number' ? l.gstRate : 0) / 100);
    }, 0);
    const charges =
      (values.freightAmount === '' ? 0 : values.freightAmount) +
      (values.loadingAmount === '' ? 0 : values.loadingAmount) +
      (values.packingAmount === '' ? 0 : values.packingAmount);
    const chargeTax = charges * ((values.chargesGstRate === '' ? 0 : values.chargesGstRate) / 100);
    return basic + tax + charges + chargeTax;
  }, [lines, values]);

  /** Raising from an offer carries the vendor, rates and charges across. */
  const pullQuotation = (q: Quotation) => {
    form.setValue('quotationId', q.id, { shouldDirty: true });
    form.setValue('vendorId', q.vendorId, { shouldDirty: true });
    form.setValue('basis', 'COMPARATIVE', { shouldDirty: true });
    form.setValue('projectId', q.projectId, { shouldDirty: true });
    form.setValue('siteId', q.siteId, { shouldDirty: true });
    form.setValue('deliverySiteId', q.siteId, { shouldDirty: true });
    if (q.paymentTerms) form.setValue('paymentTerms', q.paymentTerms, { shouldDirty: true });
    if (q.warrantyTerms) form.setValue('warrantyTerms', q.warrantyTerms, { shouldDirty: true });
    form.setValue('freightAmount', q.charges.freightAmount ?? '', { shouldDirty: true });
    form.setValue('loadingAmount', q.charges.loadingAmount ?? '', { shouldDirty: true });
    form.setValue('packingAmount', q.charges.packingAmount ?? '', { shouldDirty: true });
    form.setValue('chargesGstRate', q.charges.chargesGstRate ?? '', { shouldDirty: true });

    const quoted = q.lines.filter((l) => !l.notQuoted);
    setLines(
      quoted.map((l) => ({
        id: `POL-${q.id}-${l.id}`,
        itemId: l.itemId,
        itemCode: l.itemCode,
        description: l.description,
        uomCode: l.uomCode,
        quantity: l.quantity,
        rate: l.basicRate,
        discountPct: l.discountPct ?? 0,
        gstRate: l.gstRate,
      })),
    );
    setMeta(
      Object.fromEntries(
        quoted.map((l) => [
          `POL-${q.id}-${l.id}`,
          { quotationLineId: l.id, rfqLineId: l.rfqLineId, makeApproved: l.makeOffered },
        ]),
      ),
    );
  };

  const reset = (po: PurchaseOrder | null) => {
    setEditing(po);
    setLines(po ? toGridRows(po.lines) : []);
    setMeta(
      po
        ? Object.fromEntries(
            po.lines.map((l) => [
              l.id,
              {
                quotationLineId: l.quotationLineId,
                rfqLineId: l.rfqLineId,
                prId: l.prId,
                makeApproved: l.makeApproved,
                specification: l.specification,
                receivedQty: l.receivedQty,
                scheduledDate: l.scheduledDate,
              },
            ]),
          )
        : {},
    );
    form.reset(
      po
        ? {
            projectId: po.projectId,
            siteId: po.siteId,
            date: po.date,
            vendorId: po.vendorId,
            basis: po.basis,
            quotationId: po.quotationId ?? '',
            deliveryTerms: po.deliveryTerms,
            deliverySiteId: po.deliverySiteId,
            deliveryAddress: po.deliveryAddress ?? '',
            deliveryByDate: po.deliveryByDate ?? '',
            paymentTerms: po.paymentTerms ?? '',
            warrantyTerms: po.warrantyTerms ?? '',
            advanceAmount: po.advanceAmount ?? '',
            retentionPct: po.retentionPct ?? '',
            ldClause: po.ldClause ?? '',
            awardJustification: po.awardJustification ?? '',
            inspectionRequired: po.inspectionRequired ?? false,
            freightAmount: po.charges.freightAmount ?? '',
            loadingAmount: po.charges.loadingAmount ?? '',
            packingAmount: po.charges.packingAmount ?? '',
            chargesGstRate: po.charges.chargesGstRate ?? '',
            amendmentReason: po.amendmentReason ?? '',
            remarks: po.remarks ?? '',
          }
        : emptyPo(projectId, siteId),
    );
    setIsOpen(true);
  };

  const submit = form.handleSubmit(async (v) => {
    setIsSaving(true);
    try {
      const payload: PoLine[] = lines.map((l) => ({
        id: l.id,
        itemId: l.itemId ?? '',
        itemCode: l.itemCode,
        description: l.description,
        uomCode: l.uomCode,
        quantity: typeof l.quantity === 'number' ? l.quantity : 0,
        rate: typeof l.rate === 'number' ? l.rate : 0,
        discountPct: typeof l.discountPct === 'number' ? l.discountPct : undefined,
        gstRate: typeof l.gstRate === 'number' ? l.gstRate : 0,
        wbsId: l.wbsCode,
        ...meta[l.id],
      }));
      if (editing) await onUpdate(editing.id, v, payload);
      else await onCreate(v, payload);
      setIsOpen(false);
    } finally {
      setIsSaving(false);
    }
  });

  const rowActions: RowAction<PurchaseOrder>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: reset },
  ];

  const availableQuotations = quotations.filter(
    (q) => q.isTechnicallyQualified !== false && !rows.some((p) => p.quotationId === q.id),
  );

  return (
    <>
      <PageHeader
        title={t.procurement.purchaseOrders}
        subtitle={t.procurement.poSubtitle}
        helpTopic="purchaseOrder"
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupProcurement }]}
        primaryAction={{ label: t.procurement.poNew, icon: <Plus />, onClick: () => reset(null) }}
      />

      <section className="mb-section grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t.procurement.poKpiLive}
          value={String(totals.live)}
          comparison={`${totals.draft} ${t.status.DRAFT.toLowerCase()}`}
        />
        <KpiCard label={t.procurement.poKpiValue} value={formatAmount(totals.orderValue)} />
        <KpiCard
          label={t.procurement.poKpiPending}
          value={formatAmount(totals.pendingValue)}
          comparison={`${totals.partlyReceived} ${t.procurement.poPartlyReceived.toLowerCase()}`}
        />
        <KpiCard
          label={t.procurement.poKpiOverdue}
          value={String(totals.overdue)}
          comparison={totals.overdue > 0 ? t.procurement.poLdApplicable : undefined}
          trend={totals.overdue > 0 ? 'UP' : 'FLAT'}
          trendIsGood={totals.overdue === 0}
        />
      </section>

      <section className="mb-section max-w-sm">
        <SelectField
          id="po-project"
          label={t.nav.project}
          value={projectId}
          onChange={onProjectChange}
          options={projectOptions}
        />
      </section>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        onRowClick={reset}
        rowActions={rowActions}
        emptyHeadline={t.procurement.poEmpty}
        emptyDescription={t.procurement.poEmptyHint}
        cardTitle={(p) => p.documentNo}
        cardSubtitle={(p) => p.vendorName}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.procurement.poEdit : t.procurement.poNew}</DialogTitle>
          </DialogHeader>

          <FormLayout
            isDirty={form.formState.isDirty || lines.length > 0}
            isSaving={isSaving}
            onSubmit={submit}
            onCancel={() => setIsOpen(false)}
            submitLabel={t.common.save}
          >
            <FormSection title={t.procurement.secPoHeader}>
              {/* Raising from an accepted offer is the normal route. */}
              {!editing && availableQuotations.length > 0 && (
                <div className="md:col-span-2 rounded-lg border border-border bg-surface-muted p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.procurement.poFromQuotation}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.procurement.poFromQuotationHint}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableQuotations.map((q) => (
                      <Button
                        key={q.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => pullQuotation(q)}
                      >
                        <Plus />
                        {q.vendorName} — {q.documentNo}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <DateField
                id="po-date"
                label={t.procurement.poDate}
                required
                value={values.date}
                onChange={(v) => form.setValue('date', v, { shouldDirty: true })}
                error={errors.date?.message}
              />
              <SearchableSelectField
                id="po-vendor"
                label={t.procurement.poVendor}
                required
                value={values.vendorId}
                onChange={(v) => form.setValue('vendorId', v, { shouldDirty: true })}
                options={vendorOptions}
                error={errors.vendorId?.message}
              />
              <SelectField
                id="po-basis"
                label={t.procurement.poBasis}
                value={values.basis}
                onChange={(v) => form.setValue('basis', v as PoFormValues['basis'], { shouldDirty: true })}
                options={PO_BASES.map((b) => ({
                  value: b,
                  label: t.procurement[`pb${b}` as keyof typeof t.procurement] as string,
                }))}
              />
              <SelectField
                id="po-site"
                label={t.masters.siteName}
                required
                value={values.siteId}
                onChange={(v) => form.setValue('siteId', v, { shouldDirty: true })}
                options={siteOptions}
                error={errors.siteId?.message}
              />
              {values.basis !== 'COMPARATIVE' && (
                <TextareaField
                  id="po-justification"
                  label={t.procurement.poJustification}
                  required
                  rows={3}
                  className="md:col-span-2"
                  value={values.awardJustification}
                  onChange={(v) => form.setValue('awardJustification', v, { shouldDirty: true })}
                  error={errors.awardJustification?.message}
                  maxLength={600}
                />
              )}
            </FormSection>

            <FormSection title={t.procurement.secPoLines}>
              <div className="md:col-span-2 flex flex-col gap-3">
                <LineItemsGrid
                  rows={lines}
                  onChange={setLines}
                  itemOptions={itemOptions}
                  wbsOptions={wbsOptions}
                  showDiscount
                  showTax
                  showWbs
                />
                <p className="flex items-baseline justify-between rounded-lg border border-border bg-surface px-3 py-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t.procurement.poOrderValue}
                  </span>
                  <span className="num text-base font-heading text-foreground">
                    {formatAmount(preview)}
                  </span>
                </p>
              </div>
            </FormSection>

            <FormSection title={t.procurement.secPoCharges}>
              <AmountField
                id="po-freight"
                label={t.procurement.qtnFreight}
                value={values.freightAmount}
                onChange={(v) => form.setValue('freightAmount', v, { shouldDirty: true })}
              />
              <AmountField
                id="po-loading"
                label={t.procurement.qtnLoading}
                value={values.loadingAmount}
                onChange={(v) => form.setValue('loadingAmount', v, { shouldDirty: true })}
              />
              <AmountField
                id="po-packing"
                label={t.procurement.qtnPacking}
                value={values.packingAmount}
                onChange={(v) => form.setValue('packingAmount', v, { shouldDirty: true })}
              />
              <NumberField
                id="po-charges-gst"
                label={t.procurement.qtnChargesGst}
                value={values.chargesGstRate}
                onChange={(v) => form.setValue('chargesGstRate', v, { shouldDirty: true })}
              />
            </FormSection>

            <FormSection title={t.procurement.secPoTerms}>
              <SelectField
                id="po-delivery-terms"
                label={t.procurement.poDeliveryTerms}
                value={values.deliveryTerms}
                onChange={(v) =>
                  form.setValue('deliveryTerms', v as PoFormValues['deliveryTerms'], { shouldDirty: true })
                }
                options={PO_DELIVERY_TERMS.map((d) => ({
                  value: d,
                  label: t.procurement[`dt${d}` as keyof typeof t.procurement] as string,
                }))}
              />
              <SelectField
                id="po-delivery-site"
                label={t.procurement.poDeliverySite}
                required
                value={values.deliverySiteId}
                onChange={(v) => form.setValue('deliverySiteId', v, { shouldDirty: true })}
                options={siteOptions}
                error={errors.deliverySiteId?.message}
              />
              <DateField
                id="po-delivery-by"
                label={t.procurement.poDeliveryBy}
                value={values.deliveryByDate}
                onChange={(v) => form.setValue('deliveryByDate', v, { shouldDirty: true })}
              />
              <CheckboxField
                id="po-inspection"
                label={t.procurement.poInspection}
                checked={values.inspectionRequired}
                onChange={(v) => form.setValue('inspectionRequired', v, { shouldDirty: true })}
              />
              <AmountField
                id="po-advance"
                label={t.procurement.poAdvance}
                value={values.advanceAmount}
                onChange={(v) => form.setValue('advanceAmount', v, { shouldDirty: true })}
              />
              <NumberField
                id="po-retention"
                label={t.procurement.poRetentionPct}
                value={values.retentionPct}
                onChange={(v) => form.setValue('retentionPct', v, { shouldDirty: true })}
              />
              <TextField
                id="po-payment"
                label={t.procurement.poPaymentTerms}
                className="md:col-span-2"
                value={values.paymentTerms}
                onChange={(v) => form.setValue('paymentTerms', v, { shouldDirty: true })}
                maxLength={200}
              />
              <TextareaField
                id="po-warranty"
                label={t.procurement.poWarranty}
                rows={2}
                className="md:col-span-2"
                value={values.warrantyTerms}
                onChange={(v) => form.setValue('warrantyTerms', v, { shouldDirty: true })}
                maxLength={300}
              />
              <TextareaField
                id="po-ld"
                label={t.procurement.poLd}
                rows={2}
                className="md:col-span-2"
                value={values.ldClause}
                onChange={(v) => form.setValue('ldClause', v, { shouldDirty: true })}
                maxLength={400}
              />
              <TextareaField
                id="po-address"
                label={t.procurement.poDeliveryAddress}
                rows={2}
                className="md:col-span-2"
                value={values.deliveryAddress}
                onChange={(v) => form.setValue('deliveryAddress', v, { shouldDirty: true })}
                maxLength={300}
              />
              {editing && (
                <TextareaField
                  id="po-amendment"
                  label={t.procurement.poAmendmentReason}
                  rows={2}
                  className="md:col-span-2"
                  value={values.amendmentReason}
                  onChange={(v) => form.setValue('amendmentReason', v, { shouldDirty: true })}
                  maxLength={400}
                />
              )}
              <TextareaField
                id="po-remarks"
                label={t.procurement.poRemarks}
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

export default PoScreen;
