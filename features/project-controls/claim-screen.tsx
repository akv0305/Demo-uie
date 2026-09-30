'use client';

import * as React from 'react';
import { Pencil, Plus } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCrore } from '@/lib/format';
import type { Claim } from '@/lib/data/types';
import { claimTotals, isClosed, particularsLag } from '@/lib/project/claim';
import { claimColumns } from './claim-columns';
import { CLAIM_STAGES, CLAIM_TYPES, claimSchema, emptyClaim, type ClaimFormValues } from './claim-schema';

export interface ClaimScreenProps {
  rows: Claim[];
  isLoading: boolean;
  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];
  siteId: string;
  siteOptions: Option[];
  hindranceOptions: Option[];
  variationOptions: Option[];
  onCreate: (values: ClaimFormValues) => Promise<void>;
  onUpdate: (id: string, values: ClaimFormValues) => Promise<void>;
}

export function ClaimScreen({
  rows,
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
  siteId,
  siteOptions,
  hindranceOptions,
  variationOptions,
  onCreate,
  onUpdate,
}: ClaimScreenProps) {
  const [editing, setEditing] = React.useState<Claim | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: emptyClaim(projectId, siteId),
    mode: 'onBlur',
  });
  const { errors } = form.formState;
  const values = form.watch();

  const totals = React.useMemo(() => claimTotals(rows), [rows]);
  const columns = React.useMemo(() => claimColumns(), []);

  const closed = values.stage === 'SETTLED' || values.stage === 'WITHDRAWN';

  // Shown live so the user sees how long the particulars took to follow the notice.
  const lag =
    values.noticeDate && values.particularsDate && values.particularsDate >= values.noticeDate
      ? Math.round(
          (new Date(values.particularsDate).getTime() - new Date(values.noticeDate).getTime()) / 86400000,
        )
      : null;

  const openNew = () => {
    setEditing(null);
    form.reset(emptyClaim(projectId, siteId));
    setIsOpen(true);
  };

  const openEdit = (row: Claim) => {
    setEditing(row);
    form.reset({
      projectId: row.projectId,
      siteId: row.siteId,
      date: row.date,
      type: row.type,
      stage: row.stage,
      title: row.title,
      description: row.description,
      hindranceId: row.hindranceId ?? '',
      variationId: row.variationId ?? '',
      noticeDate: row.noticeDate ?? '',
      noticeRefNo: row.noticeRefNo ?? '',
      particularsDate: row.particularsDate ?? '',
      claimedAmount: row.claimedAmount,
      claimedDays: row.claimedDays ?? '',
      settledAmount: row.settledAmount ?? '',
      settledDays: row.settledDays ?? '',
      settledDate: row.settledDate ?? '',
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

  const rowActions: RowAction<Claim>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
  ];

  return (
    <>
      <PageHeader
        title={t.project.claimRegisterFull}
        subtitle={t.project.claimSubtitle}
        helpTopic="claim"
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupProjectControls }]}
        primaryAction={{ label: t.project.claimNew, icon: <Plus />, onClick: openNew }}
      />

      <section className="mb-section grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t.project.clmKpiTotal} value={String(totals.total)} />
        <KpiCard
          label={t.project.clmKpiLive}
          value={formatCrore(totals.liveValue)}
          comparison={t.project.clmLiveHint}
        />
        <KpiCard label={t.project.clmKpiSettled} value={formatCrore(totals.settledValue)} />
        <KpiCard
          label={t.project.clmKpiDispute}
          value={String(totals.disputeCount)}
          comparison={`${totals.daysSought} ${t.project.clmDays} — ${t.project.clmDaysHint}`}
        />
      </section>

      <section className="mb-section max-w-sm">
        <SelectField
          id="clm-project"
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
        emptyHeadline={t.project.claimEmpty}
        emptyDescription={t.project.claimEmptyHint}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.project.claimEdit : t.project.claimNew}</DialogTitle>
          </DialogHeader>

          <FormLayout
            isDirty={form.formState.isDirty}
            isSaving={isSaving}
            onSubmit={submit}
            onCancel={() => setIsOpen(false)}
            submitLabel={t.common.save}
          >
            <FormSection title={t.project.secClmEvent}>
              <DateField
                id="clm-date"
                label={t.project.clmDate}
                required
                value={values.date}
                onChange={(v) => form.setValue('date', v, { shouldDirty: true })}
                error={errors.date?.message}
              />
              <SelectField
                id="clm-site"
                label={t.masters.siteName}
                required
                value={values.siteId}
                onChange={(v) => form.setValue('siteId', v, { shouldDirty: true })}
                options={siteOptions}
                error={errors.siteId?.message}
              />
              <SelectField
                id="clm-type"
                label={t.project.clmType}
                required
                value={values.type}
                onChange={(v) => form.setValue('type', v as ClaimFormValues['type'], { shouldDirty: true })}
                options={CLAIM_TYPES.map((c) => ({
                  value: c,
                  label: t.project[`ct${c}` as keyof typeof t.project] as string,
                }))}
              />
              <SelectField
                id="clm-stage"
                label={t.project.clmStage}
                required
                value={values.stage}
                onChange={(v) => form.setValue('stage', v as ClaimFormValues['stage'], { shouldDirty: true })}
                options={CLAIM_STAGES.map((c) => ({
                  value: c,
                  label: t.project[`cs${c}` as keyof typeof t.project] as string,
                }))}
              />
              <TextField
                id="clm-title"
                label={t.project.clmTitle}
                required
                className="md:col-span-2"
                value={values.title}
                onChange={(v) => form.setValue('title', v, { shouldDirty: true })}
                error={errors.title?.message}
                maxLength={120}
              />
              <TextareaField
                id="clm-description"
                label={t.project.clmDescription}
                required
                rows={4}
                className="md:col-span-2"
                value={values.description}
                onChange={(v) => form.setValue('description', v, { shouldDirty: true })}
                error={errors.description?.message}
                maxLength={800}
              />
              <SearchableSelectField
                id="clm-hindrance"
                label={t.project.clmHindrance}
                value={values.hindranceId}
                onChange={(v) => form.setValue('hindranceId', v, { shouldDirty: true })}
                options={hindranceOptions}
                helperText={t.common.optional}
              />
              <SearchableSelectField
                id="clm-variation"
                label={t.project.clmVariation}
                value={values.variationId}
                onChange={(v) => form.setValue('variationId', v, { shouldDirty: true })}
                options={variationOptions}
                helperText={t.common.optional}
              />
            </FormSection>

            <FormSection title={t.project.secClmNotice} helpTopic="claimNotice">
              <DateField
                id="clm-notice-date"
                label={t.project.clmNoticeDate}
                value={values.noticeDate}
                onChange={(v) => form.setValue('noticeDate', v, { shouldDirty: true })}
              />
              <TextField
                id="clm-notice-ref"
                label={t.project.clmNoticeRef}
                value={values.noticeRefNo}
                onChange={(v) => form.setValue('noticeRefNo', v, { shouldDirty: true })}
                maxLength={40}
              />
              <DateField
                id="clm-particulars-date"
                label={t.project.clmParticularsDate}
                value={values.particularsDate}
                onChange={(v) => form.setValue('particularsDate', v, { shouldDirty: true })}
                error={errors.particularsDate?.message}
                helperText={
                  lag !== null ? `${t.project.clmParticularsLag}: ${lag} ${t.project.clmDays}` : undefined
                }
              />
            </FormSection>

            <FormSection title={t.project.secClmValue}>
              <AmountField
                id="clm-claimed"
                label={t.project.clmClaimed}
                value={values.claimedAmount}
                onChange={(v) => form.setValue('claimedAmount', v, { shouldDirty: true })}
              />
              <NumberField
                id="clm-claimed-days"
                label={t.project.clmClaimedDays}
                value={values.claimedDays}
                onChange={(v) => form.setValue('claimedDays', v, { shouldDirty: true })}
              />
            </FormSection>

            <FormSection title={t.project.secClmOutcome}>
              <AmountField
                id="clm-settled"
                label={t.project.clmSettled}
                value={values.settledAmount}
                onChange={(v) => form.setValue('settledAmount', v, { shouldDirty: true })}
                error={errors.settledAmount?.message}
                disabled={!closed}
                helperText={!closed ? t.project.clmSettledWithoutStage : undefined}
              />
              <NumberField
                id="clm-settled-days"
                label={t.project.clmSettledDays}
                value={values.settledDays}
                onChange={(v) => form.setValue('settledDays', v, { shouldDirty: true })}
                disabled={!closed}
              />
              <DateField
                id="clm-settled-date"
                label={t.project.clmSettledDate}
                value={values.settledDate}
                onChange={(v) => form.setValue('settledDate', v, { shouldDirty: true })}
                disabled={!closed}
              />
              <TextareaField
                id="clm-remarks"
                label={t.project.clmRemarks}
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

export default ClaimScreen;
