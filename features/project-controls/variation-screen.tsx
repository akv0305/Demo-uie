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
  NumberField,
  PageHeader,
  QuantityField,
  SearchableSelectField,
  SelectField,
  TextField,
  TextareaField,
  type Option,
  type RowAction,
} from '@/components/erp';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCrore, formatPercent } from '@/lib/format';
import type { Variation } from '@/lib/data/types';
import { isDecided, variationTotals } from '@/lib/project/variation';
import { variationColumns } from './variation-columns';
import {
  VARIATION_CATEGORIES,
  VARIATION_ORIGINS,
  emptyVariation,
  variationSchema,
  type VariationFormValues,
} from './variation-schema';

export interface VariationScreenProps {
  rows: Variation[];
  isLoading: boolean;
  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];
  /** Agreement value in rupees, for the deviation percentage. */
  contractValue: number;
  siteId: string;
  siteOptions: Option[];
  wbsOptions: Option[];
  uomOptions: Option[];
  activityName: (id?: string) => string;
  onCreate: (values: VariationFormValues) => Promise<void>;
  onUpdate: (id: string, values: VariationFormValues) => Promise<void>;
}

export function VariationScreen({
  rows,
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
  contractValue,
  siteId,
  siteOptions,
  wbsOptions,
  uomOptions,
  activityName,
  onCreate,
  onUpdate,
}: VariationScreenProps) {
  const [editing, setEditing] = React.useState<Variation | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<VariationFormValues>({
    resolver: zodResolver(variationSchema),
    defaultValues: emptyVariation(projectId, siteId),
    mode: 'onBlur',
  });
  const { errors } = form.formState;
  const values = form.watch();

  const totals = React.useMemo(() => variationTotals(rows, contractValue), [rows, contractValue]);
  const columns = React.useMemo(() => variationColumns(activityName), [activityName]);

  // Quantity x rate is a convenience for the claimed value, never a silent override.
  const derived =
    values.quantity !== '' && values.rate !== '' ? Number(values.quantity) * Number(values.rate) : null;

  const openNew = () => {
    setEditing(null);
    form.reset(emptyVariation(projectId, siteId));
    setIsOpen(true);
  };

  const openEdit = (row: Variation) => {
    setEditing(row);
    form.reset({
      projectId: row.projectId,
      siteId: row.siteId,
      date: row.date,
      category: row.category,
      origin: row.origin,
      description: row.description,
      wbsId: row.wbsId ?? '',
      location: row.location ?? '',
      uomCode: row.uomCode ?? '',
      quantity: row.quantity ?? '',
      rate: row.rate ?? '',
      proposedAmount: row.proposedAmount,
      approvedAmount: row.approvedAmount ?? '',
      isDecided: isDecided(row),
      clientRefNo: row.clientRefNo ?? '',
      clientRefDate: row.clientRefDate ?? '',
      needsRateAnalysis: row.needsRateAnalysis,
      timeExtensionDays: row.timeExtensionDays ?? '',
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

  const rowActions: RowAction<Variation>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
  ];

  return (
    <>
      <PageHeader
        title={t.project.variationRegisterFull}
        subtitle={t.project.variationSubtitle}
        helpTopic="variation"
        breadcrumb={[{ label: t.nav.groupProjectControls }, { label: t.project.variationRegister }]}
        primaryAction={{ label: t.project.variationNew, icon: <Plus />, onClick: openNew }}
      />

      <div className="stack-section">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label={t.project.varKpiTotal} value={String(totals.total)} />
          <KpiCard label={t.project.varKpiApproved} value={formatCrore(totals.approvedValue)} />
          <KpiCard
            label={t.project.varKpiPending}
            value={formatCrore(totals.pendingValue)}
            comparison={`${totals.pendingCount} ${t.project.varPendingHint}`}
          />
          <KpiCard
            label={t.project.varKpiDeviation}
            value={formatPercent(totals.deviationPct)}
            comparison={t.project.varDeviationHint}
          />
        </div>

        <div className="max-w-sm">
          <SelectField
            id="var-project"
            label={t.project.selectProject}
            value={projectId}
            onChange={onProjectChange}
            options={projectOptions}
          />
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          isLoading={isLoading}
          onRowClick={openEdit}
          rowActions={rowActions}
          emptyHeadline={t.project.variationEmpty}
          emptyDescription={t.project.variationEmptyHint}
          cardTitle={(r) => r.documentNo}
          cardSubtitle={(r) => r.description}
        />
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.project.variationEdit : t.project.variationNew}</DialogTitle>
          </DialogHeader>

          <FormLayout
            isDirty={form.formState.isDirty}
            isSaving={isSaving}
            onSubmit={submit}
            onCancel={() => setIsOpen(false)}
            submitLabel={t.common.save}
          >
            <FormSection title={t.project.secVarEvent} helpTopic="deviationLimit">
              <DateField
                id="var-date"
                label={t.project.varDate}
                required
                value={values.date}
                onChange={(v) => form.setValue('date', v, { shouldDirty: true })}
                error={errors.date?.message}
              />
              <SelectField
                id="var-site"
                label={t.masters.sitesStores}
                required
                value={values.siteId}
                onChange={(v) => form.setValue('siteId', v, { shouldDirty: true })}
                options={siteOptions}
                error={errors.siteId?.message}
              />
              <SelectField
                id="var-category"
                label={t.project.varCategory}
                required
                value={values.category}
                onChange={(v) =>
                  form.setValue('category', v as VariationFormValues['category'], { shouldDirty: true })
                }
                options={VARIATION_CATEGORIES.map((c) => ({
                  value: c,
                  label: t.project[`vc${c}` as keyof typeof t.project] as string,
                }))}
              />
              <SelectField
                id="var-origin"
                label={t.project.varOrigin}
                required
                value={values.origin}
                onChange={(v) =>
                  form.setValue('origin', v as VariationFormValues['origin'], { shouldDirty: true })
                }
                options={VARIATION_ORIGINS.map((o) => ({
                  value: o,
                  label: t.project[`vo${o}` as keyof typeof t.project] as string,
                }))}
              />
              <TextareaField
                id="var-description"
                label={t.project.varDescription}
                required
                rows={3}
                className="md:col-span-2"
                value={values.description}
                onChange={(v) => form.setValue('description', v, { shouldDirty: true })}
                error={errors.description?.message}
                maxLength={600}
              />
              <SearchableSelectField
                id="var-wbs"
                label={t.project.varActivity}
                value={values.wbsId}
                onChange={(v) => form.setValue('wbsId', v, { shouldDirty: true })}
                options={wbsOptions}
                helperText={t.common.optional}
              />
              <TextField
                id="var-location"
                label={t.project.varLocation}
                value={values.location}
                onChange={(v) => form.setValue('location', v, { shouldDirty: true })}
                maxLength={80}
              />
            </FormSection>

            <FormSection title={t.project.secVarValue}>
              <SelectField
                id="var-uom"
                label={t.project.varUom}
                value={values.uomCode}
                onChange={(v) => form.setValue('uomCode', v, { shouldDirty: true })}
                options={uomOptions}
              />
              <QuantityField
                id="var-qty"
                label={t.project.varQty}
                value={values.quantity === '' ? undefined : Number(values.quantity)}
                onChange={(v) => form.setValue('quantity', v, { shouldDirty: true })}
              />
              <AmountField
                id="var-rate"
                label={t.project.varRate}
                value={values.rate === '' ? undefined : Number(values.rate)}
                onChange={(v) => form.setValue('rate', v, { shouldDirty: true })}
              />
              <AmountField
                id="var-proposed"
                label={t.project.varProposed}
                required
                value={values.proposedAmount}
                onChange={(v) => form.setValue('proposedAmount', v === '' ? 0 : v, { shouldDirty: true })}
                error={errors.proposedAmount?.message}
                helperText={
                  derived !== null && derived !== values.proposedAmount
                    ? `${t.project.varQty} x ${t.project.varRate} = ${formatCrore(derived)}`
                    : undefined
                }
              />
              <NumberField
                id="var-eot"
                label={t.project.varTimeExtension}
                value={values.timeExtensionDays === '' ? undefined : Number(values.timeExtensionDays)}
                onChange={(v) => form.setValue('timeExtensionDays', v, { shouldDirty: true })}
              />
              <CheckboxField
                id="var-analysis"
                label={t.project.varRateAnalysis}
                checked={values.needsRateAnalysis}
                onChange={(v) => form.setValue('needsRateAnalysis', v, { shouldDirty: true })}
              />
            </FormSection>

            <FormSection title={t.project.secVarClient}>
              <TextField
                id="var-ref"
                label={t.project.varClientRef}
                value={values.clientRefNo}
                onChange={(v) => form.setValue('clientRefNo', v, { shouldDirty: true })}
                maxLength={40}
              />
              <DateField
                id="var-ref-date"
                label={t.project.varClientRefDate}
                value={values.clientRefDate}
                onChange={(v) => form.setValue('clientRefDate', v, { shouldDirty: true })}
              />
              <CheckboxField
                id="var-decided"
                label={t.project.varApproved}
                checked={values.isDecided}
                onChange={(v) => form.setValue('isDecided', v, { shouldDirty: true })}
              />
              <AmountField
                id="var-approved"
                label={t.project.varApproved}
                value={values.approvedAmount === '' ? undefined : Number(values.approvedAmount)}
                onChange={(v) => form.setValue('approvedAmount', v, { shouldDirty: true })}
                error={errors.approvedAmount?.message}
                disabled={!values.isDecided}
              />
              <TextareaField
                id="var-remarks"
                label={t.project.varRemarks}
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

export default VariationScreen;
