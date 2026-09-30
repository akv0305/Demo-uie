'use client';

import * as React from 'react';
import { Pencil, Plus, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { terminology as t } from '@/config/terminology.config';
import {
  CheckboxField,
  DataTable,
  DateField,
  FormLayout,
  FormSection,
  KpiCard,
  LineItemsGrid,
  NumberField,
  PageHeader,
  SelectField,
  TextField,
  TextareaField,
  type LineRow,
  type Option,
  type RowAction,
} from '@/components/erp';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatAmount, formatDate } from '@/lib/format';
import type { PurchaseRequisition, Rfq, RfqLine, RfqVendor, Vendor } from '@/lib/data/types';
import { pendingQty } from '@/lib/procurement/requisition';
import { estimatedValue, rfqTotals } from '@/lib/procurement/rfq';
import { rfqColumns } from './rfq-columns';
import {
  FREIGHT_TERMS,
  RFQ_RESPONSES,
  RFQ_SENT_MODES,
  emptyRfq,
  rfqSchema,
  type RfqFormValues,
} from './rfq-schema';

export interface RfqScreenProps {
  rows: Rfq[];
  isLoading: boolean;
  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];
  siteId: string;
  siteOptions: Option[];
  itemOptions: (Option & { uomCode?: string; gstRate?: number })[];
  wbsOptions: Option[];
  employeeOptions: Option[];
  vendors: Vendor[];
  /** Approved indents still awaiting an order — the source of enquiry lines. */
  openPrs: PurchaseRequisition[];
  onCreate: (values: RfqFormValues, lines: RfqLine[], vendors: RfqVendor[]) => Promise<void>;
  onUpdate: (id: string, values: RfqFormValues, lines: RfqLine[], vendors: RfqVendor[]) => Promise<void>;
}

/** Enquiry lines reuse the shared grid. Rate carries the internal estimate (D-102). */
function toGridRows(lines: RfqLine[]): LineRow[] {
  return lines.map((l) => ({
    id: l.id,
    itemId: l.itemId,
    itemCode: l.itemCode,
    description: l.description,
    uomCode: l.uomCode,
    quantity: l.quantity,
    rate: l.estimatedRate ?? '',
    wbsCode: l.wbsId,
  }));
}

function fromGridRows(rows: LineRow[]): RfqLine[] {
  return rows.map((r) => ({
    id: r.id,
    itemId: r.itemId ?? '',
    itemCode: r.itemCode ?? '',
    description: r.description,
    uomCode: r.uomCode,
    quantity: typeof r.quantity === 'number' ? r.quantity : 0,
    estimatedRate: typeof r.rate === 'number' ? r.rate : undefined,
    wbsId: r.wbsCode,
  }));
}

export function RfqScreen({
  rows,
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
  siteId,
  siteOptions,
  itemOptions,
  wbsOptions,
  employeeOptions,
  vendors,
  openPrs,
  onCreate,
  onUpdate,
}: RfqScreenProps) {
  const [editing, setEditing] = React.useState<Rfq | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [lines, setLines] = React.useState<LineRow[]>([]);
  const [invited, setInvited] = React.useState<RfqVendor[]>([]);
  const [pulledPrs, setPulledPrs] = React.useState<string[]>([]);

  const form = useForm<RfqFormValues>({
    resolver: zodResolver(rfqSchema),
    defaultValues: emptyRfq(projectId, siteId),
    mode: 'onBlur',
  });
  const { errors } = form.formState;
  const values = form.watch();

  const totals = React.useMemo(() => rfqTotals(rows), [rows]);
  const columns = React.useMemo(() => rfqColumns(), []);
  const estimate = React.useMemo(
    () =>
      lines.reduce(
        (sum, l) =>
          sum + (typeof l.quantity === 'number' ? l.quantity : 0) * (typeof l.rate === 'number' ? l.rate : 0),
        0,
      ),
    [lines],
  );

  const reset = (rfq: Rfq | null) => {
    setEditing(rfq);
    setLines(rfq ? toGridRows(rfq.lines) : []);
    setInvited(rfq ? [...rfq.vendors] : []);
    setPulledPrs(rfq ? [...rfq.prIds] : []);
    form.reset(
      rfq
        ? {
            projectId: rfq.projectId,
            siteId: rfq.siteId,
            date: rfq.date,
            title: rfq.title,
            dueDate: rfq.dueDate,
            quoteValidityDays: rfq.quoteValidityDays ?? '',
            deliveryLocationSiteId: rfq.deliveryLocationSiteId ?? '',
            deliverySchedule: rfq.deliverySchedule ?? '',
            paymentTermsExpected: rfq.paymentTermsExpected ?? '',
            freightTerms: rfq.freightTerms ?? 'FOR_SITE',
            inspectionRequired: rfq.inspectionRequired ?? false,
            scopeNotes: rfq.scopeNotes ?? '',
            remarks: rfq.remarks ?? '',
            preparedBy: rfq.preparedBy ?? '',
          }
        : emptyRfq(projectId, siteId),
    );
    setIsOpen(true);
  };

  /** Indent lines carry only the item id, so the code comes from the master. */
  const itemCodeOf = React.useCallback(
    (itemId: string) => itemOptions.find((o) => o.value === itemId)?.hint,
    [itemOptions],
  );

  /** Pulls the pending quantity of every line on an approved indent. */
  const pullIndent = (pr: PurchaseRequisition) => {
    if (pulledPrs.includes(pr.id)) return;
    const added: LineRow[] = pr.lines
      .filter((l) => pendingQty(l) > 0)
      .map((l) => ({
        id: `RFQL-${pr.id}-${l.id}`,
        itemId: l.itemId,
        itemCode: itemCodeOf(l.itemId),
        description: l.description,
        uomCode: l.uomCode,
        quantity: pendingQty(l),
        rate: l.estimatedRate ?? '',
        wbsCode: l.wbsId,
      }));
    setLines((prev) => [...prev, ...added]);
    setPulledPrs((prev) => [...prev, pr.id]);
    // First indent pulled sets the subject and the delivery point.
    if (!form.getValues('title')) {
      form.setValue('title', pr.documentNo, { shouldDirty: true });
    }
    if (pr.deliverySiteId && !form.getValues('deliveryLocationSiteId')) {
      form.setValue('deliveryLocationSiteId', pr.deliverySiteId, { shouldDirty: true });
    }
  };

  const toggleVendor = (v: Vendor) => {
    setInvited((prev) =>
      prev.some((x) => x.vendorId === v.id)
        ? prev.filter((x) => x.vendorId !== v.id)
        : [...prev, { vendorId: v.id, vendorName: v.name, sentMode: 'EMAIL', response: 'AWAITED' }],
    );
  };

  const patchVendor = (vendorId: string, patch: Partial<RfqVendor>) =>
    setInvited((prev) => prev.map((x) => (x.vendorId === vendorId ? { ...x, ...patch } : x)));

  const submit = form.handleSubmit(async (v) => {
    setIsSaving(true);
    try {
      const payload = fromGridRows(lines);
      if (editing) await onUpdate(editing.id, v, payload, invited);
      else await onCreate(v, payload, invited);
      setIsOpen(false);
    } finally {
      setIsSaving(false);
    }
  });

  const rowActions: RowAction<Rfq>[] = [{ label: t.common.edit, icon: <Pencil />, onSelect: reset }];
  const availablePrs = openPrs.filter((p) => !pulledPrs.includes(p.id));

  return (
    <>
      <PageHeader
        title={t.procurement.rfqFull}
        subtitle={t.procurement.rfqSubtitle}
        helpTopic="rfq"
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupProcurement }]}
        primaryAction={{ label: t.procurement.rfqNew, icon: <Plus />, onClick: () => reset(null) }}
      />

      <section className="mb-section grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t.procurement.rfqKpiFloated} value={String(totals.floated)} />
        <KpiCard
          label={t.procurement.rfqKpiOpen}
          value={String(totals.open)}
          comparison={`${totals.closingSoon} ${t.procurement.rfqClosingHint.toLowerCase()}`}
        />
        <KpiCard label={t.procurement.rfqKpiAwaiting} value={String(totals.awaiting)} />
        <KpiCard
          label={t.procurement.rfqKpiReceived}
          value={String(totals.received)}
          comparison={`${totals.undersubscribed} ${t.procurement.rfqThinHint.toLowerCase()}`}
        />
      </section>

      <section className="mb-section max-w-sm">
        <SelectField
          id="rfq-project"
          label={t.nav.project}
          value={projectId}
          onChange={onProjectChange}
          options={projectOptions}
        />
      </section>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        onRowClick={reset}
        rowActions={rowActions}
        emptyHeadline={t.procurement.rfqEmpty}
        emptyDescription={t.procurement.rfqEmptyHint}
        cardTitle={(r) => r.documentNo}
        cardSubtitle={(r) => r.title}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.procurement.rfqEdit : t.procurement.rfqNew}</DialogTitle>
          </DialogHeader>

          <FormLayout
            isDirty={form.formState.isDirty || lines.length > 0}
            isSaving={isSaving}
            onSubmit={submit}
            onCancel={() => setIsOpen(false)}
            submitLabel={t.common.save}
          >
            <FormSection title={t.procurement.secRfqHeader}>
              <DateField
                id="rfq-date"
                label={t.procurement.rfqDate}
                required
                value={values.date}
                onChange={(v) => form.setValue('date', v, { shouldDirty: true })}
                error={errors.date?.message}
              />
              <DateField
                id="rfq-due"
                label={t.procurement.rfqDueDate}
                required
                value={values.dueDate}
                onChange={(v) => form.setValue('dueDate', v, { shouldDirty: true })}
                error={errors.dueDate?.message}
              />
              <TextField
                id="rfq-title"
                label={t.procurement.rfqSubject}
                required
                className="md:col-span-2"
                value={values.title}
                onChange={(v) => form.setValue('title', v, { shouldDirty: true })}
                error={errors.title?.message}
                maxLength={140}
              />
              <SelectField
                id="rfq-site"
                label={t.masters.siteName}
                required
                value={values.siteId}
                onChange={(v) => form.setValue('siteId', v, { shouldDirty: true })}
                options={siteOptions}
                error={errors.siteId?.message}
              />
              <SelectField
                id="rfq-prepared-by"
                label={t.procurement.rfqPreparedBy}
                value={values.preparedBy}
                onChange={(v) => form.setValue('preparedBy', v, { shouldDirty: true })}
                options={employeeOptions}
              />
            </FormSection>

            <FormSection title={t.procurement.secRfqItems}>
              <div className="md:col-span-2 flex flex-col gap-3">
                {/* Pull from approved indents — the normal way an enquiry is raised. */}
                <div className="rounded-lg border border-border bg-surface-muted p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.procurement.rfqPickPr}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.procurement.rfqPickPrHint}</p>
                  {availablePrs.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">{t.procurement.rfqNoIndents}</p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {availablePrs.map((pr) => (
                        <Button
                          key={pr.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => pullIndent(pr)}
                        >
                          <Plus />
                          {pr.documentNo}
                        </Button>
                      ))}
                    </div>
                  )}
                  {pulledPrs.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t.procurement.rfqSourceIndents}: {pulledPrs.join(', ')}
                    </p>
                  )}
                </div>

                <LineItemsGrid
                  rows={lines}
                  onChange={setLines}
                  itemOptions={itemOptions}
                  wbsOptions={wbsOptions}
                  showDiscount={false}
                  showTax={false}
                  showWbs
                />

                <p className="flex items-baseline justify-between rounded-lg border border-border bg-surface px-3 py-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t.procurement.rfqEstimatedValue}
                  </span>
                  <span className="num text-base font-heading text-foreground">
                    {formatAmount(estimate)}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{t.procurement.rfqEstimateNote}</p>
              </div>
            </FormSection>

            <FormSection title={t.procurement.secRfqTerms}>
              <SelectField
                id="rfq-delivery-site"
                label={t.procurement.rfqDeliveryLocation}
                value={values.deliveryLocationSiteId}
                onChange={(v) => form.setValue('deliveryLocationSiteId', v, { shouldDirty: true })}
                options={siteOptions}
              />
              <SelectField
                id="rfq-freight"
                label={t.procurement.rfqFreight}
                value={values.freightTerms}
                onChange={(v) =>
                  form.setValue('freightTerms', v as RfqFormValues['freightTerms'], { shouldDirty: true })
                }
                options={FREIGHT_TERMS.map((f) => ({
                  value: f,
                  label: t.procurement[`ft${f}` as keyof typeof t.procurement] as string,
                }))}
              />
              <NumberField
                id="rfq-validity"
                label={t.procurement.rfqValidity}
                value={values.quoteValidityDays}
                onChange={(v) => form.setValue('quoteValidityDays', v, { shouldDirty: true })}
              />
              <CheckboxField
                id="rfq-inspection"
                label={t.procurement.rfqInspection}
                checked={values.inspectionRequired}
                onChange={(v) => form.setValue('inspectionRequired', v, { shouldDirty: true })}
              />
              <TextField
                id="rfq-payment"
                label={t.procurement.rfqPaymentExpected}
                className="md:col-span-2"
                value={values.paymentTermsExpected}
                onChange={(v) => form.setValue('paymentTermsExpected', v, { shouldDirty: true })}
                maxLength={200}
              />
              <TextareaField
                id="rfq-schedule"
                label={t.procurement.rfqDeliverySchedule}
                rows={2}
                className="md:col-span-2"
                value={values.deliverySchedule}
                onChange={(v) => form.setValue('deliverySchedule', v, { shouldDirty: true })}
                maxLength={300}
              />
              <TextareaField
                id="rfq-scope"
                label={t.procurement.rfqScope}
                rows={4}
                className="md:col-span-2"
                value={values.scopeNotes}
                onChange={(v) => form.setValue('scopeNotes', v, { shouldDirty: true })}
                maxLength={1000}
              />
              <TextareaField
                id="rfq-remarks"
                label={t.procurement.rfqRemarks}
                rows={2}
                className="md:col-span-2"
                value={values.remarks}
                onChange={(v) => form.setValue('remarks', v, { shouldDirty: true })}
                maxLength={600}
              />
            </FormSection>

            <FormSection title={t.procurement.secRfqVendors}>
              <div className="md:col-span-2 flex flex-col gap-3">
                {invited.length > 0 && invited.length < 3 && (
                  <p className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-foreground">
                    {t.procurement.rfqUnderSubscribedHint}
                  </p>
                )}

                <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {vendors.map((v) => {
                    const row = invited.find((x) => x.vendorId === v.id);
                    return (
                      <li
                        key={v.id}
                        className="rounded-lg border border-border bg-surface p-3"
                      >
                        <label className="flex items-start gap-2">
                          <Checkbox
                            checked={!!row}
                            onCheckedChange={() => toggleVendor(v)}
                            aria-label={v.name}
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-foreground">
                              {v.name}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {v.code} · {v.city}
                            </span>
                          </span>
                        </label>

                        {row && (
                          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-2">
                            <SelectField
                              id={`rfq-mode-${v.id}`}
                              label={t.procurement.rfqMode}
                              value={row.sentMode}
                              onChange={(m) =>
                                patchVendor(v.id, { sentMode: m as RfqVendor['sentMode'] })
                              }
                              options={RFQ_SENT_MODES.map((m) => ({
                                value: m,
                                label: t.procurement[`rm${m}` as keyof typeof t.procurement] as string,
                              }))}
                            />
                            <SelectField
                              id={`rfq-resp-${v.id}`}
                              label={t.procurement.rfqResponse}
                              value={row.response}
                              onChange={(rp) =>
                                patchVendor(v.id, { response: rp as RfqVendor['response'] })
                              }
                              options={RFQ_RESPONSES.map((rp) => ({
                                value: rp,
                                label: t.procurement[`rr${rp}` as keyof typeof t.procurement] as string,
                              }))}
                            />
                            <DateField
                              id={`rfq-sent-${v.id}`}
                              label={t.procurement.rfqSentOn}
                              value={row.sentOn ?? ''}
                              onChange={(d) => patchVendor(v.id, { sentOn: d })}
                            />
                            {row.response !== 'AWAITED' && (
                              <DateField
                                id={`rfq-respdate-${v.id}`}
                                label={t.common.date}
                                value={row.respondedOn ?? ''}
                                onChange={(d) => patchVendor(v.id, { respondedOn: d })}
                              />
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </FormSection>
          </FormLayout>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default RfqScreen;
