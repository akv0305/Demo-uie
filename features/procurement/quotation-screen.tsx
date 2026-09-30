'use client';

import * as React from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { terminology as t } from '@/config/terminology.config';
import {
  AmountField,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { formatAmount } from '@/lib/format';
import type { Quotation, QuotationLine, Rfq } from '@/lib/data/types';
import { landedValue, lowestLanded, quotationTotals } from '@/lib/procurement/quotation';
import { quotationColumns } from './quotation-columns';
import {
  QUOTATION_CHARGES,
  emptyQuotation,
  quotationSchema,
  type QuotationFormValues,
} from './quotation-schema';

export interface QuotationScreenProps {
  rows: Quotation[];
  isLoading: boolean;
  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];
  siteId: string;
  siteOptions: Option[];
  /** Floated enquiries, the only ones an offer may answer. */
  rfqs: Rfq[];
  vendorOptions: Option[];
  onCreate: (values: QuotationFormValues, lines: QuotationLine[]) => Promise<void>;
  onUpdate: (id: string, values: QuotationFormValues, lines: QuotationLine[]) => Promise<void>;
}

export function QuotationScreen({
  rows,
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
  siteId,
  siteOptions,
  rfqs,
  vendorOptions,
  onCreate,
  onUpdate,
}: QuotationScreenProps) {
  const [editing, setEditing] = React.useState<Quotation | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [lines, setLines] = React.useState<QuotationLine[]>([]);

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: emptyQuotation(projectId, siteId),
    mode: 'onBlur',
  });
  const { errors } = form.formState;
  const values = form.watch();

  const rfqNo = React.useCallback(
    (id: string) => rfqs.find((r) => r.id === id)?.documentNo ?? id,
    [rfqs],
  );
  const totals = React.useMemo(() => quotationTotals(rows), [rows]);
  const lowest = React.useMemo(() => lowestLanded(rows), [rows]);
  const columns = React.useMemo(() => quotationColumns(rfqNo, lowest?.id), [rfqNo, lowest]);

  /** Live preview of the landed figure as charges are typed. */
  const preview = React.useMemo(() => {
    const draft: Quotation = {
      ...(editing ?? ({} as Quotation)),
      lines,
      charges: {
        freightBasis: values.freightBasis,
        freightAmount: values.freightAmount === '' ? undefined : values.freightAmount,
        loadingBasis: values.loadingBasis,
        loadingAmount: values.loadingAmount === '' ? undefined : values.loadingAmount,
        packingBasis: values.packingBasis,
        packingAmount: values.packingAmount === '' ? undefined : values.packingAmount,
        chargesGstRate: values.chargesGstRate === '' ? undefined : values.chargesGstRate,
      },
    };
    return landedValue(draft);
  }, [editing, lines, values]);

  /** Selecting an enquiry seeds one line per enquiry item, rates blank. */
  const seedFromRfq = (rfqId: string) => {
    form.setValue('rfqId', rfqId, { shouldDirty: true });
    const rfq = rfqs.find((r) => r.id === rfqId);
    if (!rfq) return;
    form.setValue('projectId', rfq.projectId, { shouldDirty: true });
    form.setValue('siteId', rfq.siteId, { shouldDirty: true });
    setLines(
      rfq.lines.map((l) => ({
        id: `QTL-${rfqId}-${l.id}`,
        rfqLineId: l.id,
        itemId: l.itemId,
        itemCode: l.itemCode,
        description: l.description,
        uomCode: l.uomCode,
        quantity: l.quantity,
        basicRate: 0,
        gstRate: 18,
      })),
    );
  };

  const patchLine = (id: string, patch: Partial<QuotationLine>) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const reset = (q: Quotation | null) => {
    setEditing(q);
    setLines(q ? q.lines.map((l) => ({ ...l })) : []);
    form.reset(
      q
        ? {
            projectId: q.projectId,
            siteId: q.siteId,
            rfqId: q.rfqId,
            vendorId: q.vendorId,
            date: q.date,
            vendorRefNo: q.vendorRefNo ?? '',
            vendorRefDate: q.vendorRefDate ?? '',
            validUntil: q.validUntil ?? '',
            receivedOn: q.receivedOn ?? '',
            paymentTerms: q.paymentTerms ?? '',
            deliveryPeriodDays: q.deliveryPeriodDays ?? '',
            warrantyTerms: q.warrantyTerms ?? '',
            freightBasis: q.charges.freightBasis,
            freightAmount: q.charges.freightAmount ?? '',
            loadingBasis: q.charges.loadingBasis,
            loadingAmount: q.charges.loadingAmount ?? '',
            packingBasis: q.charges.packingBasis,
            packingAmount: q.charges.packingAmount ?? '',
            chargesGstRate: q.charges.chargesGstRate ?? '',
            isTechnicallyQualified:
              q.isTechnicallyQualified === true ? 'YES' : q.isTechnicallyQualified === false ? 'NO' : 'PENDING',
            deviations: q.deviations ?? '',
            remarks: q.remarks ?? '',
          }
        : emptyQuotation(projectId, siteId),
    );
    setIsOpen(true);
  };

  const submit = form.handleSubmit(async (v) => {
    setIsSaving(true);
    try {
      if (editing) await onUpdate(editing.id, v, lines);
      else await onCreate(v, lines);
      setIsOpen(false);
    } finally {
      setIsSaving(false);
    }
  });

  const rowActions: RowAction<Quotation>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: reset },
  ];

  const chargeOptions = QUOTATION_CHARGES.map((c) => ({
    value: c,
    label: t.procurement[`ch${c}` as keyof typeof t.procurement] as string,
  }));

  const rfqOptions: Option[] = rfqs
    .filter((r) => r.status === 'SUBMITTED' || r.status === 'CLOSED')
    .map((r) => ({ value: r.id, label: r.documentNo, hint: r.title }));

  return (
    <>
      <PageHeader
        title={t.procurement.vendorQuotations}
        subtitle={t.procurement.qtnSubtitle}
        helpTopic="quotation"
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupProcurement }]}
        primaryAction={{ label: t.procurement.qtnNew, icon: <Plus />, onClick: () => reset(null) }}
      />

      <section className="mb-section grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t.procurement.qtnKpiLive}
          value={String(totals.live)}
          comparison={`${totals.expired} ${t.procurement.qtnExpired.toLowerCase()}`}
        />
        <KpiCard label={t.procurement.qtnKpiQualified} value={String(totals.qualified)} />
        <KpiCard
          label={t.procurement.qtnKpiPending}
          value={String(totals.pendingScrutiny)}
          comparison={`${totals.partial} ${t.procurement.qtnPartial.toLowerCase()}`}
        />
        <KpiCard label={t.procurement.qtnKpiValue} value={formatAmount(totals.landedValue)} />
      </section>

      <section className="mb-section max-w-sm">
        <SelectField
          id="qtn-project"
          label={t.nav.project}
          value={projectId}
          onChange={onProjectChange}
          options={projectOptions}
        />
      </section>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(q) => q.id}
        isLoading={isLoading}
        onRowClick={reset}
        rowActions={rowActions}
        emptyHeadline={t.procurement.qtnEmpty}
        emptyDescription={t.procurement.qtnEmptyHint}
        cardTitle={(q) => q.vendorName}
        cardSubtitle={(q) => q.documentNo}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.procurement.qtnEdit : t.procurement.qtnNew}</DialogTitle>
          </DialogHeader>

          <FormLayout
            isDirty={form.formState.isDirty}
            isSaving={isSaving}
            onSubmit={submit}
            onCancel={() => setIsOpen(false)}
            submitLabel={t.common.save}
          >
            <FormSection title={t.procurement.secQtnHeader}>
              <SearchableSelectField
                id="qtn-rfq"
                label={t.procurement.qtnRfq}
                required
                value={values.rfqId}
                onChange={seedFromRfq}
                options={rfqOptions}
                error={errors.rfqId?.message}
                placeholder={t.procurement.qtnPickRfq}
              />
              <SearchableSelectField
                id="qtn-vendor"
                label={t.procurement.qtnVendor}
                required
                value={values.vendorId}
                onChange={(v) => form.setValue('vendorId', v, { shouldDirty: true })}
                options={vendorOptions}
                error={errors.vendorId?.message}
                placeholder={t.procurement.qtnPickVendor}
              />
              <DateField
                id="qtn-date"
                label={t.procurement.qtnDate}
                required
                value={values.date}
                onChange={(v) => form.setValue('date', v, { shouldDirty: true })}
                error={errors.date?.message}
              />
              <DateField
                id="qtn-received"
                label={t.procurement.qtnReceivedOn}
                value={values.receivedOn}
                onChange={(v) => form.setValue('receivedOn', v, { shouldDirty: true })}
              />
              <TextField
                id="qtn-ref"
                label={t.procurement.qtnVendorRef}
                value={values.vendorRefNo}
                onChange={(v) => form.setValue('vendorRefNo', v, { shouldDirty: true })}
                maxLength={40}
              />
              <DateField
                id="qtn-ref-date"
                label={t.procurement.qtnVendorRefDate}
                value={values.vendorRefDate}
                onChange={(v) => form.setValue('vendorRefDate', v, { shouldDirty: true })}
              />
              <DateField
                id="qtn-valid"
                label={t.procurement.qtnValidUntil}
                value={values.validUntil}
                onChange={(v) => form.setValue('validUntil', v, { shouldDirty: true })}
                error={errors.validUntil?.message}
              />
              <SelectField
                id="qtn-site"
                label={t.masters.siteName}
                required
                value={values.siteId}
                onChange={(v) => form.setValue('siteId', v, { shouldDirty: true })}
                options={siteOptions}
                error={errors.siteId?.message}
              />
            </FormSection>

            {/* Rates are captured against the enquiry lines, so quantity and
                description are fixed and only the vendor's figures are typed. */}
            <FormSection title={t.procurement.secQtnLines}>
              <div className="md:col-span-2">
                {lines.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                    {t.procurement.qtnPickRfq}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {lines.map((l) => (
                      <li key={l.id} className="rounded-lg border border-border bg-surface p-3">
                        <div className="flex items-start justify-between gap-3">
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-foreground">{l.description}</span>
                            <span className="block text-xs text-muted-foreground">
                              {l.quantity} {l.uomCode}
                            </span>
                          </span>
                          <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                            <Checkbox
                              checked={!!l.notQuoted}
                              onCheckedChange={(c) => patchLine(l.id, { notQuoted: !!c })}
                              aria-label={t.procurement.qtnNotQuoted}
                            />
                            {t.procurement.qtnNotQuoted}
                          </label>
                        </div>

                        {!l.notQuoted && (
                          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-2 md:grid-cols-4">
                            <AmountField
                              id={`qtn-rate-${l.id}`}
                              label={t.procurement.qtnBasicRate}
                              value={l.basicRate}
                              onChange={(v) => patchLine(l.id, { basicRate: typeof v === 'number' ? v : 0 })}
                            />
                            <NumberField
                              id={`qtn-disc-${l.id}`}
                              label={t.procurement.discount}
                              value={l.discountPct ?? ''}
                              onChange={(v) =>
                                patchLine(l.id, { discountPct: typeof v === 'number' ? v : undefined })
                              }
                            />
                            <NumberField
                              id={`qtn-gst-${l.id}`}
                              label={t.masters.gstRate}
                              value={l.gstRate}
                              onChange={(v) => patchLine(l.id, { gstRate: typeof v === 'number' ? v : 0 })}
                            />
                            <TextField
                              id={`qtn-make-${l.id}`}
                              label={t.procurement.qtnMake}
                              value={l.makeOffered ?? ''}
                              onChange={(v) => patchLine(l.id, { makeOffered: v })}
                              maxLength={60}
                            />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </FormSection>

            <FormSection title={t.procurement.secQtnCharges}>
              <SelectField
                id="qtn-freight-basis"
                label={t.procurement.qtnFreight}
                value={values.freightBasis}
                onChange={(v) =>
                  form.setValue('freightBasis', v as QuotationFormValues['freightBasis'], { shouldDirty: true })
                }
                options={chargeOptions}
              />
              <AmountField
                id="qtn-freight-amt"
                label={t.common.amount}
                value={values.freightAmount}
                onChange={(v) => form.setValue('freightAmount', v, { shouldDirty: true })}
                disabled={values.freightBasis !== 'EXTRA'}
              />
              <SelectField
                id="qtn-loading-basis"
                label={t.procurement.qtnLoading}
                value={values.loadingBasis}
                onChange={(v) =>
                  form.setValue('loadingBasis', v as QuotationFormValues['loadingBasis'], { shouldDirty: true })
                }
                options={chargeOptions}
              />
              <AmountField
                id="qtn-loading-amt"
                label={t.common.amount}
                value={values.loadingAmount}
                onChange={(v) => form.setValue('loadingAmount', v, { shouldDirty: true })}
                disabled={values.loadingBasis !== 'EXTRA'}
              />
              <SelectField
                id="qtn-packing-basis"
                label={t.procurement.qtnPacking}
                value={values.packingBasis}
                onChange={(v) =>
                  form.setValue('packingBasis', v as QuotationFormValues['packingBasis'], { shouldDirty: true })
                }
                options={chargeOptions}
              />
              <AmountField
                id="qtn-packing-amt"
                label={t.common.amount}
                value={values.packingAmount}
                onChange={(v) => form.setValue('packingAmount', v, { shouldDirty: true })}
                disabled={values.packingBasis !== 'EXTRA'}
              />
              <NumberField
                id="qtn-charges-gst"
                label={t.procurement.qtnChargesGst}
                value={values.chargesGstRate}
                onChange={(v) => form.setValue('chargesGstRate', v, { shouldDirty: true })}
              />

              <div className="md:col-span-2">
                <p className="flex items-baseline justify-between rounded-lg border border-border bg-surface-muted px-3 py-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t.procurement.qtnLandedValue}
                  </span>
                  <span className="num text-base font-heading text-foreground">{formatAmount(preview)}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{t.procurement.qtnLandedNote}</p>
              </div>
            </FormSection>

            <FormSection title={t.procurement.secQtnTerms}>
              <SelectField
                id="qtn-technical"
                label={t.procurement.qtnTechnical}
                value={values.isTechnicallyQualified}
                onChange={(v) =>
                  form.setValue('isTechnicallyQualified', v as QuotationFormValues['isTechnicallyQualified'], {
                    shouldDirty: true,
                  })
                }
                options={[
                  { value: 'PENDING', label: t.procurement.qtnPendingScrutiny },
                  { value: 'YES', label: t.procurement.qtnQualified },
                  { value: 'NO', label: t.procurement.qtnDisqualified },
                ]}
                helpTopic="quotation"
              />
              <NumberField
                id="qtn-delivery"
                label={t.procurement.qtnDeliveryDays}
                value={values.deliveryPeriodDays}
                onChange={(v) => form.setValue('deliveryPeriodDays', v, { shouldDirty: true })}
              />
              <TextField
                id="qtn-payment"
                label={t.procurement.qtnPaymentTerms}
                className="md:col-span-2"
                value={values.paymentTerms}
                onChange={(v) => form.setValue('paymentTerms', v, { shouldDirty: true })}
                maxLength={200}
              />
              <TextareaField
                id="qtn-warranty"
                label={t.procurement.qtnWarranty}
                rows={2}
                className="md:col-span-2"
                value={values.warrantyTerms}
                onChange={(v) => form.setValue('warrantyTerms', v, { shouldDirty: true })}
                maxLength={300}
              />
              <TextareaField
                id="qtn-deviations"
                label={t.procurement.qtnDeviations}
                rows={2}
                className="md:col-span-2"
                value={values.deviations}
                onChange={(v) => form.setValue('deviations', v, { shouldDirty: true })}
                maxLength={600}
              />
              <TextareaField
                id="qtn-remarks"
                label={t.procurement.qtnRemarks}
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

export default QuotationScreen;
