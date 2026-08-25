'use client';

import * as React from 'react';
import { Pencil, Plus } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { terminology as t } from '@/config/terminology.config';
import {
  ConfirmDialog,
  DataTable,
  DateField,
  FormLayout,
  FormSection,
  NumberField,
  PageHeader,
  SearchableSelectField,
  SelectField,
  TextField,
  TextareaField,
  type Option,
  type RowAction,
} from '@/components/erp';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Project } from '@/lib/data/types';
import { formatCrore } from '@/lib/format';
import { projectColumns, projectStatusLabel, projectTypeLabel, type ProjectLookups } from './project-columns';
import {
  LINEAR_TYPES,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  emptyProject,
  projectSchema,
  type ProjectFormValues,
} from './project-schema';

export interface ProjectScreenProps {
  rows: Project[];
  allRows: Project[];
  isLoading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  companyFilter: string;
  onCompanyFilterChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  companyOptions: Option[];
  /** Active employees eligible to manage a project, with their company. */
  managerOptions: (Option & { companyId: string })[];
  lookups: ProjectLookups;
  onCreate: (values: ProjectFormValues) => Promise<void>;
  onUpdate: (id: string, values: ProjectFormValues) => Promise<void>;
}

export function ProjectScreen({
  rows,
  allRows,
  isLoading,
  search,
  onSearchChange,
  companyFilter,
  onCompanyFilterChange,
  statusFilter,
  onStatusFilterChange,
  companyOptions,
  managerOptions,
  lookups,
  onCreate,
  onUpdate,
}: ProjectScreenProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Project | null>(null);
  const [saving, setSaving] = React.useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: emptyProject,
    mode: 'onBlur',
  });
  const { errors, isDirty } = form.formState;
  const projectType = form.watch('type');
  const companyId = form.watch('companyId');
  const managerId = form.watch('projectManagerId');
  const valueCrore = form.watch('contractValueCrore');

  const isLinear = LINEAR_TYPES.includes(projectType);

  const columns = React.useMemo(() => projectColumns(lookups), [lookups]);

  const typeOptions: Option[] = PROJECT_TYPES.map((pt) => ({ value: pt, label: projectTypeLabel(pt) }));
  const statusOptions: Option[] = PROJECT_STATUSES.map((s) => ({ value: s, label: projectStatusLabel(s) }));
  const companyFilterOptions: Option[] = [{ value: 'ALL', label: t.common.all }, ...companyOptions];
  const statusFilterOptions: Option[] = [{ value: 'ALL', label: t.common.all }, ...statusOptions];

  /** Cross-company management is allowed but worth surfacing (cf. D-056). */
  const managerNote = React.useMemo(() => {
    if (!managerId || !companyId) return undefined;
    const mgr = managerOptions.find((m) => m.value === managerId);
    if (!mgr || mgr.companyId === companyId) return undefined;
    return t.masters.prjManagerOtherCompany.replace('{company}', lookups.companyCode(mgr.companyId));
  }, [managerId, companyId, managerOptions, lookups]);

  /** Echo the stored rupee figure so the crore input is unambiguous. */
  const valuePreview = React.useMemo(
    () => (valueCrore > 0 ? formatCrore(Math.round(valueCrore * 10_000_000)) : undefined),
    [valueCrore],
  );

  const openNew = () => {
    setEditing(null);
    form.reset(emptyProject);
    setFormOpen(true);
  };

  const openEdit = (row: Project) => {
    setEditing(row);
    form.reset({
      code: row.code,
      name: row.name,
      shortName: row.shortName,
      type: row.type,
      companyId: row.companyId,
      client: row.client,
      location: row.location,
      contractValueCrore: row.contractValue / 10_000_000,
      startDate: row.startDate,
      endDate: row.endDate,
      projectManagerId: row.projectManagerId,
      chainageFrom: row.chainageFrom ?? '',
      chainageTo: row.chainageTo ?? '',
      status: row.status,
    });
    setFormOpen(true);
  };

  const submit = form.handleSubmit(async (values) => {
    if (allRows.some((r) => r.code.toUpperCase() === values.code.toUpperCase() && r.id !== editing?.id)) {
      form.setError('code', { message: t.masters.prjDuplicateCode });
      return;
    }
    setSaving(true);
    try {
      if (editing) await onUpdate(editing.id, values);
      else await onCreate(values);
      setFormOpen(false);
      form.reset(emptyProject);
    } finally {
      setSaving(false);
    }
  });

  // No deactivate action: Project carries `status`, not `isActive` (D-058).
  const rowActions: RowAction<Project>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
  ];

  return (
    <>
      <PageHeader
        title={t.masters.prjFull}
        subtitle={t.masters.prjSubtitle}
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupMasters }]}
        helpTopic="project"
        primaryAction={{ label: t.masters.prjNew, icon: <Plus />, onClick: openNew }}
      />

      <section className="mb-section flex flex-col gap-2 rounded-lg border border-border bg-surface p-card sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.common.search}
            aria-label={t.common.search}
          />
        </div>
        <SelectField
          id="prj-company-filter"
          label={t.masters.company}
          value={companyFilter}
          onChange={onCompanyFilterChange}
          options={companyFilterOptions}
          className="w-full sm:w-56"
        />
        <SelectField
          id="prj-status-filter"
          label={t.masters.prjStatus}
          value={statusFilter}
          onChange={onStatusFilterChange}
          options={statusFilterOptions}
          className="w-full sm:w-40"
        />
      </section>

      <DataTable<Project>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        rowActions={rowActions}
        onRowClick={openEdit}
        showExport
        showColumnToggle
        emptyHeadline={t.masters.prjEmpty}
        emptyDescription={t.masters.prjEmptyHint}
        cardTitle={(r) => `${r.code} — ${r.shortName}`}
        cardSubtitle={(r) => `${projectTypeLabel(r.type)} — ${formatCrore(r.contractValue)}`}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.masters.prjEdit : t.masters.prjNew}</DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <FormLayout
              isDirty={isDirty}
              isSaving={saving}
              submitLabel={t.common.save}
              onSubmit={submit}
              onCancel={() => setFormOpen(false)}
            >
              <FormSection title={t.masters.secPrjIdentity} helpTopic="project" columns={2}>
                <TextField
                  id="prj-code"
                  label={t.masters.prjCode}
                  required
                  value={form.watch('code')}
                  onChange={(v) => form.setValue('code', v.toUpperCase(), { shouldDirty: true })}
                  error={errors.code?.message}
                  placeholder="SH19-PKG2"
                />
                <Controller
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <SelectField
                      id="prj-type"
                      label={t.masters.prjType}
                      required
                      value={field.value}
                      onChange={(v) => {
                        field.onChange(v);
                        // Chainage is meaningless off a linear work.
                        if (!LINEAR_TYPES.includes(v as Project['type'])) {
                          form.setValue('chainageFrom', '', { shouldDirty: true });
                          form.setValue('chainageTo', '', { shouldDirty: true });
                        }
                      }}
                      options={typeOptions}
                      error={errors.type?.message}
                    />
                  )}
                />
                <TextareaField
                  id="prj-name"
                  label={t.masters.prjName}
                  required
                  rows={2}
                  value={form.watch('name')}
                  onChange={(v) => form.setValue('name', v, { shouldDirty: true })}
                  error={errors.name?.message}
                  className="sm:col-span-2"
                />
                <TextField
                  id="prj-short-name"
                  label={t.masters.prjShortName}
                  required
                  value={form.watch('shortName')}
                  onChange={(v) => form.setValue('shortName', v, { shouldDirty: true })}
                  error={errors.shortName?.message}
                  placeholder="SH-19 Widening Pkg II"
                />
                <TextField
                  id="prj-location"
                  label={t.masters.prjLocation}
                  required
                  value={form.watch('location')}
                  onChange={(v) => form.setValue('location', v, { shouldDirty: true })}
                  error={errors.location?.message}
                />
              </FormSection>

              <FormSection title={t.masters.secPrjContract} helpTopic="projectContractValue" columns={2}>
                <Controller
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <SelectField
                      id="prj-company"
                      label={t.masters.company}
                      required
                      value={field.value}
                      onChange={field.onChange}
                      options={companyOptions}
                      error={errors.companyId?.message}
                    />
                  )}
                />
                <TextField
                  id="prj-client"
                  label={t.masters.prjClient}
                  required
                  value={form.watch('client')}
                  onChange={(v) => form.setValue('client', v, { shouldDirty: true })}
                  error={errors.client?.message}
                />
                <NumberField
                  id="prj-contract-value"
                  label={t.masters.prjContractValueCr}
                  required
                  value={form.watch('contractValueCrore')}
                  onChange={(v) =>
                    form.setValue('contractValueCrore', typeof v === 'number' ? v : 0, { shouldDirty: true })
                  }
                  error={errors.contractValueCrore?.message}
                  helperText={valuePreview}
                  helpTopic="projectContractValue"
                />
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <SelectField
                      id="prj-status"
                      label={t.masters.prjStatus}
                      required
                      value={field.value}
                      onChange={field.onChange}
                      options={statusOptions}
                      error={errors.status?.message}
                    />
                  )}
                />
              </FormSection>

              <FormSection title={t.masters.secPrjSchedule} columns={2}>
                <DateField
                  id="prj-start-date"
                  label={t.masters.prjStartDate}
                  required
                  value={form.watch('startDate')}
                  onChange={(v) => form.setValue('startDate', v, { shouldDirty: true })}
                  error={errors.startDate?.message}
                />
                <DateField
                  id="prj-end-date"
                  label={t.masters.prjEndDate}
                  required
                  value={form.watch('endDate')}
                  onChange={(v) => form.setValue('endDate', v, { shouldDirty: true })}
                  error={errors.endDate?.message}
                />
                <Controller
                  control={form.control}
                  name="projectManagerId"
                  render={({ field }) => (
                    <SearchableSelectField
                      id="prj-manager"
                      label={t.masters.prjManager}
                      required
                      value={field.value}
                      onChange={field.onChange}
                      options={managerOptions}
                      error={errors.projectManagerId?.message}
                      helperText={managerNote}
                    />
                  )}
                />
              </FormSection>

              {isLinear && (
                <FormSection title={t.masters.secPrjLinear} helpTopic="projectChainage" columns={2}>
                  <TextField
                    id="prj-chainage-from"
                    label={t.masters.prjChainageFrom}
                    value={form.watch('chainageFrom')}
                    onChange={(v) => form.setValue('chainageFrom', v, { shouldDirty: true })}
                    error={errors.chainageFrom?.message}
                    placeholder="24+000"
                    helpTopic="projectChainage"
                  />
                  <TextField
                    id="prj-chainage-to"
                    label={t.masters.prjChainageTo}
                    value={form.watch('chainageTo')}
                    onChange={(v) => form.setValue('chainageTo', v, { shouldDirty: true })}
                    error={errors.chainageTo?.message}
                    placeholder="61+500"
                  />
                </FormSection>
              )}

              {editing && (
                <FormSection title={t.masters.secPrjProgress} columns={2}>
                  <NumberField
                    id="prj-physical-progress"
                    label={t.masters.prjPhysicalProgress}
                    value={editing.physicalProgressPct}
                    onChange={() => undefined}
                    disabled
                    helperText={t.masters.prjProgressNote}
                  />
                  <NumberField
                    id="prj-financial-progress"
                    label={t.masters.prjFinancialProgress}
                    value={editing.financialProgressPct}
                    onChange={() => undefined}
                    disabled
                  />
                </FormSection>
              )}
            </FormLayout>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ProjectScreen;
