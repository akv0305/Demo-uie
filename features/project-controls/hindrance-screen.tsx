'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { terminology as t } from '@/config/terminology.config';
import {
  CheckboxField,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Hindrance } from '@/lib/data/types';
import { hindranceTotals } from '@/lib/project/hindrance';
import { hindranceColumns } from './hindrance-columns';
import {
  HINDRANCE_CATEGORIES,
  RESPONSIBILITIES,
  emptyHindrance,
  hindranceSchema,
  type HindranceFormValues,
} from './hindrance-schema';

export interface HindranceScreenProps {
  rows: Hindrance[];
  isLoading: boolean;
  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];
  siteId: string;
  siteOptions: Option[];
  wbsOptions: Option[];
  activityName: (id?: string) => string;
  onCreate: (values: HindranceFormValues) => Promise<void>;
  onUpdate: (id: string, values: HindranceFormValues) => Promise<void>;
}

export function HindranceScreen({
  rows,
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
  siteId,
  siteOptions,
  wbsOptions,
  activityName,
  onCreate,
  onUpdate,
}: HindranceScreenProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Hindrance | null>(null);
  const [saving, setSaving] = React.useState(false);

  const form = useForm<HindranceFormValues>({
    resolver: zodResolver(hindranceSchema),
    defaultValues: emptyHindrance(projectId, siteId),
    mode: 'onBlur',
  });
  const { errors, isDirty } = form.formState;
  const claimable = form.watch('isEotClaimable');

  const columns = React.useMemo(() => hindranceColumns(activityName), [activityName]);
  const totals = React.useMemo(() => hindranceTotals(rows), [rows]);

  const categoryOptions: Option[] = HINDRANCE_CATEGORIES.map((c) => ({
    value: c,
    label: t.project[`hc${c}` as keyof typeof t.project] as string,
  }));

  const responsibilityOptions: Option[] = RESPONSIBILITIES.map((r) => ({
    value: r,
    label: t.project[`hr${r}` as keyof typeof t.project] as string,
  }));

  const openNew = () => {
    setEditing(null);
    form.reset(emptyHindrance(projectId, siteId));
    setFormOpen(true);
  };

  const openEdit = (row: Hindrance) => {
    setEditing(row);
    form.reset({
      projectId: row.projectId,
      siteId: row.siteId,
      fromDate: row.fromDate,
      toDate: row.toDate ?? '',
      category: row.category,
      responsibility: row.responsibility,
      description: row.description,
      wbsId: row.wbsId ?? '',
      location: row.location ?? '',
      isWorkStopped: row.isWorkStopped,
      isEotClaimable: row.isEotClaimable,
      eotClaimDays: row.eotClaimDays ?? '',
      actionTaken: row.actionTaken ?? '',
      resolvedRemarks: row.resolvedRemarks ?? '',
    });
    setFormOpen(true);
  };

  const submit = form.handleSubmit(async (values) => {
    setSaving(true);
    try {
      if (editing) await onUpdate(editing.id, values);
      else await onCreate(values);
      setFormOpen(false);
    } finally {
      setSaving(false);
    }
  });

  const rowActions: RowAction<Hindrance>[] = [
    { label: t.common.edit, onSelect: (row) => openEdit(row) },
  ];

  return (
    <>
      <PageHeader
        title={t.project.hindranceRegister}
        subtitle={t.project.hindranceSubtitle}
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupProjectControls }]}
        helpTopic="hindrance"
        primaryAction={{ label: t.project.hindranceNew, icon: <Plus />, onClick: openNew }}
      />

      <section className="mb-section grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t.project.hinKpiTotal} value={String(totals.total)} />
        <KpiCard label={t.project.hinKpiOpen} value={String(totals.open)} />
        <KpiCard label={t.project.hinKpiDaysOpen} value={String(totals.daysOpen)} />
        <KpiCard
          label={t.project.hinKpiEot}
          value={String(totals.eotDays)}
          comparison={t.project.hinEotHint}
        />
      </section>

      <section className="mb-section flex flex-col gap-2 rounded-lg border border-border bg-surface p-card sm:flex-row sm:items-end">
        <SelectField
          id="hin-project"
          label={t.nav.project}
          value={projectId}
          onChange={onProjectChange}
          options={projectOptions}
          className="w-full sm:w-96"
        />
      </section>

      <DataTable<Hindrance>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        rowActions={rowActions}
        onRowClick={(r) => openEdit(r)}
        emptyHeadline={t.project.hindranceEmpty}
        emptyDescription={t.project.hindranceEmptyHint}
        cardTitle={(r) => r.description}
        cardSubtitle={(r) => r.documentNo}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? t.project.hindranceEdit : t.project.hindranceNew}
            </DialogTitle>
          </DialogHeader>

          <FormLayout
            isDirty={isDirty}
            isSaving={saving}
            onSubmit={submit}
            onCancel={() => setFormOpen(false)}
          >
            <FormSection title={t.project.secHinEvent} columns={2}>
              <Controller
                control={form.control}
                name="fromDate"
                render={({ field }) => (
                  <DateField
                    id="hin-from"
                    label={t.project.hinFrom}
                    required
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.fromDate?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="toDate"
                render={({ field }) => (
                  <DateField
                    id="hin-to"
                    label={t.project.hinTo}
                    value={field.value}
                    onChange={field.onChange}
                    min={form.watch('fromDate') || undefined}
                    error={errors.toDate?.message}
                    helperText={t.project.hinOngoing}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <SelectField
                    id="hin-category"
                    label={t.project.hinCategory}
                    required
                    value={field.value}
                    onChange={field.onChange}
                    options={categoryOptions}
                    error={errors.category?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="responsibility"
                render={({ field }) => (
                  <SelectField
                    id="hin-resp"
                    label={t.project.hinResponsibility}
                    required
                    value={field.value}
                    onChange={field.onChange}
                    options={responsibilityOptions}
                    error={errors.responsibility?.message}
                  />
                )}
              />
              <TextareaField
                id="hin-description"
                label={t.project.hinDescription}
                required
                rows={3}
                value={form.watch('description')}
                onChange={(v) => form.setValue('description', v, { shouldDirty: true })}
                error={errors.description?.message}
                maxLength={600}
                className="sm:col-span-2"
              />
            </FormSection>

            <FormSection title={t.project.secHinImpact} columns={2}>
              <Controller
                control={form.control}
                name="wbsId"
                render={({ field }) => (
                  <SearchableSelectField
                    id="hin-wbs"
                    label={t.project.hinActivity}
                    value={field.value}
                    onChange={field.onChange}
                    options={wbsOptions}
                    error={errors.wbsId?.message}
                  />
                )}
              />
              <TextField
                id="hin-location"
                label={t.project.hinLocation}
                value={form.watch('location')}
                onChange={(v) => form.setValue('location', v, { shouldDirty: true })}
                error={errors.location?.message}
                maxLength={80}
              />
              <Controller
                control={form.control}
                name="isWorkStopped"
                render={({ field }) => (
                  <CheckboxField
                    id="hin-stopped"
                    label={t.project.hinWorkStopped}
                    checked={field.value}
                    onChange={field.onChange}
                    description={t.project.hinWorkSlowed}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="isEotClaimable"
                render={({ field }) => (
                  <CheckboxField
                    id="hin-eot"
                    label={t.project.hinEotClaimable}
                    checked={field.value}
                    onChange={field.onChange}
                    helpTopic="eot"
                  />
                )}
              />
              <Controller
                control={form.control}
                name="eotClaimDays"
                render={({ field }) => (
                  <NumberField
                    id="hin-eot-days"
                    label={t.project.hinEotDays}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!claimable}
                    error={errors.eotClaimDays?.message}
                  />
                )}
              />
            </FormSection>

            <FormSection title={t.project.secHinFollowUp} columns={1}>
              <TextareaField
                id="hin-action"
                label={t.project.hinActionTaken}
                rows={2}
                value={form.watch('actionTaken')}
                onChange={(v) => form.setValue('actionTaken', v, { shouldDirty: true })}
                error={errors.actionTaken?.message}
                maxLength={600}
              />
              <TextareaField
                id="hin-resolved"
                label={t.project.hinResolved}
                rows={2}
                value={form.watch('resolvedRemarks')}
                onChange={(v) => form.setValue('resolvedRemarks', v, { shouldDirty: true })}
                error={errors.resolvedRemarks?.message}
                maxLength={600}
              />
            </FormSection>
          </FormLayout>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default HindranceScreen;
