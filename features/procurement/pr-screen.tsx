'use client';

import * as React from 'react';
import { Pencil, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { terminology as t } from '@/config/terminology.config';
import {
  DataTable,
  DateField,
  FormLayout,
  FormSection,
  KpiCard,
  LineItemsGrid,
  PageHeader,
  SearchableSelectField,
  SelectField,
  TextareaField,
  type LineRow,
  type Option,
  type RowAction,
} from '@/components/erp';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCrore } from '@/lib/format';
import type { PurchaseRequisition } from '@/lib/data/types';
import { prTotals } from '@/lib/procurement/requisition';
import { prColumns } from './pr-columns';
import { PR_PRIORITIES, emptyPr, prSchema, type PrFormValues } from './pr-schema';

export interface PrScreenProps {
  rows: PurchaseRequisition[];
  isLoading: boolean;
  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];
  siteId: string;
  siteOptions: Option[];
  employeeOptions: Option[];
  itemOptions: (Option & { uomCode?: string; gstRate?: number })[];
  wbsOptions: Option[];
  siteName: (id: string) => string;
  onCreate: (values: PrFormValues) => Promise<void>;
  onUpdate: (id: string, values: PrFormValues) => Promise<void>;
}

export function PrScreen({
  rows,
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
  siteId,
  siteOptions,
  employeeOptions,
  itemOptions,
  wbsOptions,
  siteName,
  onCreate,
  onUpdate,
}: PrScreenProps) {
  const [editing, setEditing] = React.useState<PurchaseRequisition | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<PrFormValues>({
    resolver: zodResolver(prSchema),
    defaultValues: emptyPr(projectId, siteId, employeeOptions[0]?.value ?? ''),
    mode: 'onBlur',
  });
  const { errors } = form.formState;
  const values = form.watch();

  const totals = React.useMemo(() => prTotals(rows), [rows]);
  const columns = React.useMemo(() => prColumns(siteName), [siteName]);

  const openNew = () => {
    setEditing(null);
    form.reset(emptyPr(projectId, siteId, employeeOptions[0]?.value ?? ''));
    setIsOpen(true);
  };

  const openEdit = (row: PurchaseRequisition) => {
    setEditing(row);
    form.reset({
      projectId: row.projectId,
      siteId: row.siteId,
      date: row.date,
      priority: row.priority,
      indentedBy: row.indentedBy,
      requiredBy: row.requiredBy,
      deliverySiteId: row.deliverySiteId,
      justification: row.justification ?? '',
      // Domain lines map onto the grid's LineRow shape.
      lines: row.lines.map((l) => ({
        id: l.id,
        itemId: l.itemId,
        description: l.description,
        uomCode: l.uomCode,
        quantity: l.quantity,
        rate: l.estimatedRate ?? '',
        wbsCode: l.wbsId ?? '',
        remarks: l.remarks ?? '',
      })),
      remarks: row.remarks ?? '',
    });
    setIsOpen(true);
  };

  const submit = form.handleSubmit(async (v) => {
    setIsSaving(true);
    try {
      if (editing) await onUpdate(editing.id, v);
      else await onCreate(v);
      setIsOpen(false);
    } finally {
      setIsSaving(false);
    }
  });

  const rowActions: RowAction<PurchaseRequisition>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
  ];

  return (
    <>
      <PageHeader
        title={t.procurement.prFull}
        subtitle={t.procurement.prSubtitle}
        helpTopic="purchaseRequisition"
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupProcurement }]}
        primaryAction={{ label: t.procurement.prNew, icon: <Plus />, onClick: openNew }}
      />

      <section className="mb-section grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t.procurement.prKpiTotal} value={String(totals.total)} />
        <KpiCard label={t.procurement.prKpiPending} value={String(totals.pendingApproval)} />
        <KpiCard
          label={t.procurement.prKpiAwaitingOrder}
          value={formatCrore(totals.awaitingOrderValue)}
          comparison={`${totals.awaitingOrderCount} ${t.procurement.prItems}`}
        />
        <KpiCard
          label={t.procurement.prKpiUrgent}
          value={String(totals.urgentCount)}
          trend={totals.overdueCount > 0 ? 'UP' : 'FLAT'}
          trendIsGood={totals.overdueCount > 0 ? false : undefined}
          comparison={
            totals.overdueCount > 0
              ? `${totals.overdueCount} ${t.procurement.prOverdueWarning}`
              : undefined
          }
        />
      </section>

      <section className="mb-section max-w-sm">
        <SelectField
          id="pr-project"
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
        onRowClick={openEdit}
        rowActions={rowActions}
        emptyHeadline={t.procurement.prEmpty}
        emptyDescription={t.procurement.prEmptyHint}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.procurement.prEdit : t.procurement.prNew}</DialogTitle>
          </DialogHeader>

          <FormLayout
            isDirty={form.formState.isDirty}
            isSaving={isSaving}
            onSubmit={submit}
            onCancel={() => setIsOpen(false)}
            submitLabel={t.common.save}
          >
            <FormSection title={t.procurement.secPrHeader}>
              <DateField
                id="pr-date"
                label={t.procurement.prDate}
                required
                value={values.date}
                onChange={(v) => form.setValue('date', v, { shouldDirty: true })}
                error={errors.date?.message}
              />
              <SearchableSelectField
                id="pr-indented-by"
                label={t.procurement.indentedBy}
                required
                value={values.indentedBy}
                onChange={(v) => form.setValue('indentedBy', v, { shouldDirty: true })}
                options={employeeOptions}
                error={errors.indentedBy?.message}
              />
              <SelectField
                id="pr-priority"
                label={t.procurement.priority}
                required
                value={values.priority}
                onChange={(v) =>
                  form.setValue('priority', v as PrFormValues['priority'], { shouldDirty: true })
                }
                options={PR_PRIORITIES.map((p) => ({
                  value: p,
                  label: t.procurement[`prp${p}` as keyof typeof t.procurement] as string,
                }))}
              />
              <SelectField
                id="pr-site"
                label={t.masters.siteName}
                required
                value={values.siteId}
                onChange={(v) => form.setValue('siteId', v, { shouldDirty: true })}
                options={siteOptions}
                error={errors.siteId?.message}
              />
            </FormSection>

            <FormSection title={t.procurement.secPrRequirement}>
              <DateField
                id="pr-required-by"
                label={t.procurement.requiredBy}
                required
                min={values.date || undefined}
                value={values.requiredBy}
                onChange={(v) => form.setValue('requiredBy', v, { shouldDirty: true })}
                error={errors.requiredBy?.message}
              />
              <SelectField
                id="pr-delivery-site"
                label={t.procurement.deliveryLocation}
                required
                value={values.deliverySiteId}
                onChange={(v) => form.setValue('deliverySiteId', v, { shouldDirty: true })}
                options={siteOptions}
                error={errors.deliverySiteId?.message}
              />
              <TextareaField
                id="pr-justification"
                label={t.procurement.justification}
                rows={2}
                className="md:col-span-2"
                required={values.priority !== 'NORMAL'}
                value={values.justification}
                onChange={(v) => form.setValue('justification', v, { shouldDirty: true })}
                error={errors.justification?.message}
                maxLength={600}
              />
            </FormSection>

            <FormSection title={t.procurement.secPrLines}>
              <div className="md:col-span-2">
                <LineItemsGrid
                  rows={values.lines as LineRow[]}
                  onChange={(next) =>
                    form.setValue('lines', next as PrFormValues['lines'], { shouldDirty: true })
                  }
                  itemOptions={itemOptions}
                  wbsOptions={wbsOptions}
                  showDiscount={false}
                  showTax={false}
                  showWbs
                />
                {errors.lines?.message && (
                  <p role="alert" className="mt-2 text-xs text-danger">
                    {errors.lines.message}
                  </p>
                )}
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {t.procurement.prEstimatedNote}
                </p>
              </div>
            </FormSection>

            <FormSection title={t.procurement.secPrNotes}>
              <TextareaField
                id="pr-remarks"
                label={t.procurement.prRemarks}
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

export default PrScreen;
