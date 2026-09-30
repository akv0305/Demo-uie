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
  SelectField,
  TextField,
  TextareaField,
  type Option,
  type RowAction,
} from '@/components/erp';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCrore } from '@/lib/format';
import type { BankGuarantee, RetentionEntry } from '@/lib/data/types';
import { bgTotals, retentionTotals, withRunningBalance } from '@/lib/project/bg-retention';
import { bgColumns, retentionColumns } from './bg-columns';
import { BG_STATUSES, BG_TYPES, bgSchema, emptyBg, type BgFormValues } from './bg-schema';

export interface BgRetentionScreenProps {
  guarantees: BankGuarantee[];
  retention: RetentionEntry[];
  isLoading: boolean;
  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];
  siteId: string;
  siteOptions: Option[];
  onCreate: (values: BgFormValues) => Promise<void>;
  onUpdate: (id: string, values: BgFormValues) => Promise<void>;
}

export function BgRetentionScreen({
  guarantees,
  retention,
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
  siteId,
  siteOptions,
  onCreate,
  onUpdate,
}: BgRetentionScreenProps) {
  const [editing, setEditing] = React.useState<BankGuarantee | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<BgFormValues>({
    resolver: zodResolver(bgSchema),
    defaultValues: emptyBg(projectId, siteId),
    mode: 'onBlur',
  });
  const { errors } = form.formState;
  const values = form.watch();

  const bgt = React.useMemo(() => bgTotals(guarantees), [guarantees]);
  const rett = React.useMemo(() => retentionTotals(retention), [retention]);
  const ledger = React.useMemo(() => withRunningBalance(retention), [retention]);

  const columns = React.useMemo(() => bgColumns(), []);
  const retColumns = React.useMemo(() => retentionColumns(), []);

  const isReleased = values.bgStatus === 'RELEASED';

  const openNew = () => {
    setEditing(null);
    form.reset(emptyBg(projectId, siteId));
    setIsOpen(true);
  };

  const openEdit = (row: BankGuarantee) => {
    setEditing(row);
    form.reset({
      projectId: row.projectId,
      siteId: row.siteId,
      bgNumber: row.bgNumber,
      date: row.date,
      type: row.type,
      bgStatus: row.bgStatus,
      bankName: row.bankName,
      branch: row.branch ?? '',
      beneficiary: row.beneficiary,
      amount: row.amount,
      validUpto: row.validUpto,
      claimPeriodUpto: row.claimPeriodUpto ?? '',
      marginPct: row.marginPct ?? '',
      marginAmount: row.marginAmount ?? '',
      fdrNo: row.fdrNo ?? '',
      commissionPct: row.commissionPct ?? '',
      purpose: row.purpose ?? '',
      releasedOn: row.releasedOn ?? '',
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

  const rowActions: RowAction<BankGuarantee>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
  ];

  return (
    <>
      <PageHeader
        title={t.project.bgRetentionFull}
        subtitle={t.project.bgRetentionSubtitle}
        helpTopic="bankGuarantee"
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupProjectControls }]}
        primaryAction={{ label: t.project.bgNew, icon: <Plus />, onClick: openNew }}
      />

      <section className="mb-section grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t.project.bgKpiValue}
          value={formatCrore(bgt.liveValue)}
          comparison={`${bgt.liveCount} ${t.project.bgKpiLive.toLowerCase()}`}
        />
        <KpiCard
          label={t.project.bgKpiExpiring}
          value={String(bgt.expiringCount)}
          trend={bgt.lapsedCount > 0 ? 'UP' : 'FLAT'}
          trendIsGood={bgt.lapsedCount > 0 ? false : undefined}
          comparison={
            bgt.lapsedCount > 0
              ? `${bgt.lapsedCount} ${t.project.bgLapsedWarning}`
              : t.project.bgKpiExpiringHint
          }
        />
        <KpiCard
          label={t.project.bgKpiMargin}
          value={formatCrore(bgt.marginLocked)}
          comparison={t.project.bgKpiMarginHint}
        />
        <KpiCard
          label={t.project.retKpiBalance}
          value={formatCrore(rett.balance)}
          comparison={t.project.retKpiBalanceHint}
        />
      </section>

      <section className="mb-section max-w-sm">
        <SelectField
          id="bg-project"
          label={t.nav.project}
          value={projectId}
          onChange={onProjectChange}
          options={projectOptions}
        />
      </section>

      <Tabs defaultValue="guarantees">
        <TabsList className="mb-4">
          <TabsTrigger value="guarantees">{t.project.bgTabGuarantees}</TabsTrigger>
          <TabsTrigger value="retention">{t.project.bgTabRetention}</TabsTrigger>
        </TabsList>

        <TabsContent value="guarantees">
          <DataTable
            columns={columns}
            rows={guarantees}
            rowKey={(r) => r.id}
            isLoading={isLoading}
            onRowClick={openEdit}
            rowActions={rowActions}
            emptyHeadline={t.project.bgEmpty}
            emptyDescription={t.project.bgEmptyHint}
          />
        </TabsContent>

        <TabsContent value="retention">
          <section className="mb-section grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label={t.project.retKpiDeducted} value={formatCrore(rett.deducted)} />
            <KpiCard label={t.project.retKpiReleased} value={formatCrore(rett.released)} />
            <KpiCard label={t.project.retKpiSubstituted} value={formatCrore(rett.substituted)} />
            <KpiCard label={t.project.retKpiBalance} value={formatCrore(rett.balance)} />
          </section>

          <p className="mb-3 text-sm text-muted-foreground">{t.project.retReadOnlyNote}</p>

          <DataTable
            columns={retColumns}
            rows={ledger}
            rowKey={(r) => r.id}
            isLoading={isLoading}
            emptyHeadline={t.project.retEmpty}
            emptyDescription={t.project.retEmptyHint}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.project.bgEdit : t.project.bgNew}</DialogTitle>
          </DialogHeader>

          <FormLayout
            isDirty={form.formState.isDirty}
            isSaving={isSaving}
            onSubmit={submit}
            onCancel={() => setIsOpen(false)}
            submitLabel={t.common.save}
          >
            <FormSection title={t.project.secBgInstrument}>
              <TextField
                id="bg-number"
                label={t.project.bgNumber}
                required
                value={values.bgNumber}
                onChange={(v) => form.setValue('bgNumber', v, { shouldDirty: true })}
                error={errors.bgNumber?.message}
                maxLength={40}
              />
              <DateField
                id="bg-date"
                label={t.project.bgIssueDate}
                required
                value={values.date}
                onChange={(v) => form.setValue('date', v, { shouldDirty: true })}
                error={errors.date?.message}
              />
              <SelectField
                id="bg-type"
                label={t.project.bgType}
                required
                value={values.type}
                onChange={(v) => form.setValue('type', v as BgFormValues['type'], { shouldDirty: true })}
                options={BG_TYPES.map((c) => ({
                  value: c,
                  label: t.project[`bgt${c}` as keyof typeof t.project] as string,
                }))}
              />
              <SelectField
                id="bg-status"
                label={t.project.bgStatusLabel}
                required
                value={values.bgStatus}
                onChange={(v) =>
                  form.setValue('bgStatus', v as BgFormValues['bgStatus'], { shouldDirty: true })
                }
                options={BG_STATUSES.map((c) => ({
                  value: c,
                  label: t.project[`bgs${c}` as keyof typeof t.project] as string,
                }))}
              />
              <SelectField
                id="bg-site"
                label={t.masters.siteName}
                required
                value={values.siteId}
                onChange={(v) => form.setValue('siteId', v, { shouldDirty: true })}
                options={siteOptions}
                error={errors.siteId?.message}
              />
              <AmountField
                id="bg-amount"
                label={t.project.bgAmount}
                required
                value={values.amount}
                onChange={(v) => form.setValue('amount', v === '' ? 0 : v, { shouldDirty: true })}
                error={errors.amount?.message}
              />
              <TextField
                id="bg-bank"
                label={t.project.bgBank}
                required
                value={values.bankName}
                onChange={(v) => form.setValue('bankName', v, { shouldDirty: true })}
                error={errors.bankName?.message}
                maxLength={80}
              />
              <TextField
                id="bg-branch"
                label={t.project.bgBranch}
                value={values.branch}
                onChange={(v) => form.setValue('branch', v, { shouldDirty: true })}
                maxLength={60}
              />
              <TextField
                id="bg-beneficiary"
                label={t.project.bgBeneficiary}
                required
                className="md:col-span-2"
                value={values.beneficiary}
                onChange={(v) => form.setValue('beneficiary', v, { shouldDirty: true })}
                error={errors.beneficiary?.message}
                maxLength={120}
              />
              <TextareaField
                id="bg-purpose"
                label={t.project.bgPurpose}
                rows={2}
                className="md:col-span-2"
                value={values.purpose}
                onChange={(v) => form.setValue('purpose', v, { shouldDirty: true })}
                maxLength={300}
              />
            </FormSection>

            <FormSection title={t.project.secBgValidity} helpTopic="bankGuarantee">
              <DateField
                id="bg-valid"
                label={t.project.validUpto}
                required
                value={values.validUpto}
                onChange={(v) => form.setValue('validUpto', v, { shouldDirty: true })}
                error={errors.validUpto?.message}
              />
              <DateField
                id="bg-claim"
                label={t.project.bgClaimPeriod}
                value={values.claimPeriodUpto}
                onChange={(v) => form.setValue('claimPeriodUpto', v, { shouldDirty: true })}
                error={errors.claimPeriodUpto?.message}
                helperText={t.common.optional}
              />
            </FormSection>

            <FormSection title={t.project.secBgBankTerms}>
              <NumberField
                id="bg-margin-pct"
                label={t.project.bgMarginPct}
                value={values.marginPct}
                onChange={(v) => form.setValue('marginPct', v, { shouldDirty: true })}
              />
              <AmountField
                id="bg-margin-amount"
                label={t.project.bgMarginAmount}
                value={values.marginAmount}
                onChange={(v) => form.setValue('marginAmount', v, { shouldDirty: true })}
              />
              <TextField
                id="bg-fdr"
                label={t.project.bgFdrNo}
                value={values.fdrNo}
                onChange={(v) => form.setValue('fdrNo', v, { shouldDirty: true })}
                maxLength={40}
              />
              <NumberField
                id="bg-commission"
                label={t.project.bgCommission}
                value={values.commissionPct}
                onChange={(v) => form.setValue('commissionPct', v, { shouldDirty: true })}
              />
            </FormSection>

            <FormSection title={t.project.secBgOutcome}>
              <DateField
                id="bg-released"
                label={t.project.bgReleasedOn}
                value={values.releasedOn}
                onChange={(v) => form.setValue('releasedOn', v, { shouldDirty: true })}
                error={errors.releasedOn?.message}
                disabled={!isReleased}
                helperText={!isReleased ? t.project.bgReleasedWithoutStatus : undefined}
              />
              <TextareaField
                id="bg-remarks"
                label={t.project.bgRemarks}
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

export default BgRetentionScreen;
