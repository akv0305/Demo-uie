'use client';

import * as React from 'react';
import { Pencil, Plus, Power } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { terminology as t } from '@/config/terminology.config';
import {
  CheckboxField,
  ConfirmDialog,
  DataTable,
  FormLayout,
  FormSection,
  PageHeader,
  SearchableSelectField,
  SelectField,
  TextField,
  type Option,
  type RowAction,
} from '@/components/erp';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Site, SiteType } from '@/lib/data/types';
import { siteColumns, type SiteColumnLookups } from './site-columns';
import { SITE_TYPES, STORE_TYPES, emptySite, siteSchema, type SiteFormValues } from './site-schema';

export interface SiteScreenProps extends SiteColumnLookups {
  rows: Site[];
  isLoading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: string;
  onTypeFilterChange: (v: string) => void;
  activeFilter: string;
  onActiveFilterChange: (v: string) => void;
  companyOptions: Option[];
  /** All projects; the screen narrows them to the chosen company. */
  projectOptions: (Option & { companyId: string })[];
  employeeOptions: Option[];
  onCreate: (values: SiteFormValues) => Promise<void>;
  onUpdate: (id: string, values: SiteFormValues) => Promise<void>;
  onToggleActive: (row: Site) => Promise<void>;
}

export function SiteScreen({
  rows,
  isLoading,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  activeFilter,
  onActiveFilterChange,
  companyOptions,
  projectOptions,
  employeeOptions,
  companyName,
  projectName,
  employeeName,
  onCreate,
  onUpdate,
  onToggleActive,
}: SiteScreenProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Site | null>(null);
  const [toggleTarget, setToggleTarget] = React.useState<Site | null>(null);
  const [saving, setSaving] = React.useState(false);

  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteSchema),
    defaultValues: emptySite,
    mode: 'onBlur',
  });
  const { errors, isDirty } = form.formState;

  const type = form.watch('type') as SiteType;
  const companyId = form.watch('companyId');
  const isStore = form.watch('isStore');

  const columns = React.useMemo(
    () => siteColumns({ companyName, projectName, employeeName }),
    [companyName, projectName, employeeName],
  );

  const typeOptions: Option[] = SITE_TYPES.map((v) => ({ value: v, label: t.masters[`st${v}`] }));

  const typeFilterOptions: Option[] = [{ value: 'ALL', label: t.common.all }, ...typeOptions];

  const statusOptions: Option[] = [
    { value: 'ALL', label: t.common.all },
    { value: 'ACTIVE', label: t.admin.active },
    { value: 'INACTIVE', label: t.admin.inactive },
  ];

  /** Projects of the chosen company only — same interlock as the Employee master. */
  const companyProjects = React.useMemo(
    () => projectOptions.filter((p) => p.companyId === companyId).map(({ value, label }) => ({ value, label })),
    [projectOptions, companyId],
  );

  const forcedStore = STORE_TYPES.includes(type);

  // A main store is company-level; a store type must hold stock.
  React.useEffect(() => {
    if (type === 'MAIN_STORE' && form.getValues('projectId') !== '') {
      form.setValue('projectId', '', { shouldDirty: true });
    }
    if (forcedStore && !form.getValues('isStore')) {
      form.setValue('isStore', true, { shouldDirty: true });
    }
  }, [type, forcedStore, form]);

  // Changing company invalidates a project belonging to the old one.
  React.useEffect(() => {
    const current = form.getValues('projectId');
    if (current && !companyProjects.some((p) => p.value === current)) {
      form.setValue('projectId', '', { shouldDirty: true });
    }
  }, [companyProjects, form]);

  // A location that holds no stock cannot have a keeper.
  React.useEffect(() => {
    if (!isStore && form.getValues('storeKeeperId') !== '') {
      form.setValue('storeKeeperId', '', { shouldDirty: true });
    }
  }, [isStore, form]);

  const openNew = () => {
    setEditing(null);
    form.reset(emptySite);
    setFormOpen(true);
  };

  const openEdit = (row: Site) => {
    setEditing(row);
    form.reset({
      code: row.code,
      name: row.name,
      type: row.type,
      companyId: row.companyId,
      projectId: row.projectId ?? '',
      location: row.location,
      storeKeeperId: row.storeKeeperId ?? '',
      isStore: row.isStore,
      isActive: row.isActive !== false,
    });
    setFormOpen(true);
  };

  const submit = form.handleSubmit(async (values) => {
    if (rows.some((r) => r.code.toUpperCase() === values.code.toUpperCase() && r.id !== editing?.id)) {
      form.setError('code', { message: t.masters.sitDuplicateCode });
      return;
    }
    setSaving(true);
    try {
      if (editing) await onUpdate(editing.id, values);
      else await onCreate(values);
      setFormOpen(false);
      form.reset(emptySite);
    } finally {
      setSaving(false);
    }
  });

  const rowActions: RowAction<Site>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
    { label: t.masters.deactivate, icon: <Power />, onSelect: (row) => setToggleTarget(row) },
  ];

  return (
    <>
      <PageHeader
        title={t.masters.sitFull}
        subtitle={t.masters.sitSubtitle}
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupMasters }]}
        helpTopic="site"
        primaryAction={{ label: t.masters.sitNew, icon: <Plus />, onClick: openNew }}
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
          id="sit-type-filter"
          label={t.masters.siteType}
          value={typeFilter}
          onChange={onTypeFilterChange}
          options={typeFilterOptions}
          className="w-full sm:w-44"
        />
        <SelectField
          id="sit-status-filter"
          label={t.common.status}
          value={activeFilter}
          onChange={onActiveFilterChange}
          options={statusOptions}
          className="w-full sm:w-36"
        />
      </section>

      <DataTable<Site>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        rowActions={rowActions}
        onRowClick={openEdit}
        showExport
        showColumnToggle
        emptyHeadline={t.masters.sitEmpty}
        emptyDescription={t.masters.sitEmptyHint}
        cardTitle={(r) => `${r.code}  ${r.name}`}
        cardSubtitle={(r) => `${t.masters[`st${r.type}`]} · ${r.location}`}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.masters.sitEdit : t.masters.sitNew}</DialogTitle>
          </DialogHeader>

          <FormLayout
            isDirty={isDirty}
            isSaving={saving}
            submitLabel={t.common.save}
            onSubmit={submit}
            onCancel={() => setFormOpen(false)}
          >
            <FormSection title={t.masters.secSitIdentity} helpTopic="site" columns={2}>
              <TextField
                id="sit-code"
                label={t.masters.sitCode}
                required
                value={form.watch('code')}
                onChange={(v) => form.setValue('code', v.toUpperCase(), { shouldDirty: true })}
                error={errors.code?.message}
                maxLength={16}
                placeholder="ST-SH19-A"
              />
              <TextField
                id="sit-name"
                label={t.masters.siteName}
                required
                value={form.watch('name')}
                onChange={(v) => form.setValue('name', v, { shouldDirty: true })}
                error={errors.name?.message}
                placeholder="SH-19 Site Store — Km 32+400 Camp"
              />
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <SelectField
                    id="sit-type"
                    label={t.masters.siteType}
                    required
                    value={field.value}
                    onChange={field.onChange}
                    options={typeOptions}
                    error={errors.type?.message}
                  />
                )}
              />
              <TextField
                id="sit-location"
                label={t.masters.location}
                required
                value={form.watch('location')}
                onChange={(v) => form.setValue('location', v, { shouldDirty: true })}
                error={errors.location?.message}
                placeholder="Siddipet, Telangana"
              />
            </FormSection>

            <FormSection title={t.masters.secSitOwnership} columns={2}>
              <Controller
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <SearchableSelectField
                    id="sit-company"
                    label={t.masters.company}
                    required
                    value={field.value}
                    onChange={field.onChange}
                    options={companyOptions}
                    error={errors.companyId?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <SearchableSelectField
                    id="sit-project"
                    label={t.masters.project}
                    value={field.value}
                    onChange={field.onChange}
                    options={companyProjects}
                    disabled={!companyId || type === 'MAIN_STORE'}
                    error={errors.projectId?.message}
                    helperText={
                      type === 'MAIN_STORE' ? t.masters.sitProjectOnMain : t.masters.sitProjectRequired
                    }
                  />
                )}
              />
            </FormSection>

            <FormSection title={t.masters.secSitStock} helpTopic="siteStock" columns={2}>
              <Controller
                control={form.control}
                name="isStore"
                render={({ field }) => (
                  <CheckboxField
                    id="sit-is-store"
                    label={t.masters.sitIsStore}
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={forcedStore}
                    description={forcedStore ? t.masters.sitIsStoreForced : undefined}
                    error={errors.isStore?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="storeKeeperId"
                render={({ field }) => (
                  <SearchableSelectField
                    id="sit-keeper"
                    label={t.masters.storeKeeper}
                    value={field.value}
                    onChange={field.onChange}
                    options={employeeOptions}
                    disabled={!isStore}
                    error={errors.storeKeeperId?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <CheckboxField
                    id="sit-active"
                    label={t.admin.active}
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormSection>
          </FormLayout>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={toggleTarget !== null}
        onOpenChange={(o) => !o && setToggleTarget(null)}
        intent="CANCEL"
        documentLabel={toggleTarget ? `${toggleTarget.code}  ${toggleTarget.name}` : undefined}
        description={t.masters.sitDeactivateWarning}
        onConfirm={() => {
          if (toggleTarget) void onToggleActive(toggleTarget);
          setToggleTarget(null);
        }}
      />
    </>
  );
}

export default SiteScreen;
