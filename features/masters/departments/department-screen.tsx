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
import type { Department } from '@/lib/data/types';
import { departmentColumns } from './department-columns';
import { departmentSchema, emptyDepartment, type DepartmentFormValues } from './department-schema';

export interface DepartmentScreenProps {
  rows: Department[];
  isLoading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  activeFilter: string;
  onActiveFilterChange: (v: string) => void;
  /** Active employees, for the head lookup. */
  employeeOptions: Option[];
  /** Resolves an employee id to a display name, or the not-assigned label. */
  employeeName: (id?: string) => string;
  /** Department name an employee is currently posted to, for the advisory note. */
  employeeDeptName: (employeeId: string) => string | undefined;
  onCreate: (values: DepartmentFormValues) => Promise<void>;
  onUpdate: (id: string, values: DepartmentFormValues) => Promise<void>;
  onToggleActive: (row: Department) => Promise<void>;
}

export function DepartmentScreen({
  rows,
  isLoading,
  search,
  onSearchChange,
  activeFilter,
  onActiveFilterChange,
  employeeOptions,
  employeeName,
  employeeDeptName,
  onCreate,
  onUpdate,
  onToggleActive,
}: DepartmentScreenProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Department | null>(null);
  const [toggleTarget, setToggleTarget] = React.useState<Department | null>(null);
  const [saving, setSaving] = React.useState(false);

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: emptyDepartment,
    mode: 'onBlur',
  });
  const { errors, isDirty } = form.formState;
  const headId = form.watch('headEmployeeId');

  const columns = React.useMemo(() => departmentColumns(employeeName), [employeeName]);

  const headOptions: Option[] = employeeOptions;
  
  const statusOptions: Option[] = [
    { value: 'ALL', label: t.common.all },
    { value: 'ACTIVE', label: t.admin.active },
    { value: 'INACTIVE', label: t.admin.inactive },
  ];

  /**
   * Advisory only. A new department has no employees posted to it yet, so
   * blocking on a mismatch would make the first save impossible (Q-45).
   */
  const headNote = React.useMemo(() => {
    if (!headId || !editing) return undefined;
    const current = employeeDeptName(headId);
    if (!current || current === editing.name) return t.masters.depHeadHint;
    return t.masters.depHeadOtherDept.replace('{dept}', current);
  }, [headId, editing, employeeDeptName]);

  const openNew = () => {
    setEditing(null);
    form.reset(emptyDepartment);
    setFormOpen(true);
  };

  const openEdit = (row: Department) => {
    setEditing(row);
    form.reset({
      code: row.code,
      name: row.name,
      headEmployeeId: row.headEmployeeId ?? '',
      isActive: row.isActive !== false,
    });
    setFormOpen(true);
  };

  const submit = form.handleSubmit(async (values) => {
    if (rows.some((r) => r.code.toUpperCase() === values.code.toUpperCase() && r.id !== editing?.id)) {
      form.setError('code', { message: t.masters.depDuplicateCode });
      return;
    }
    if (rows.some((r) => r.name.trim().toLowerCase() === values.name.trim().toLowerCase() && r.id !== editing?.id)) {
      form.setError('name', { message: t.masters.depDuplicateName });
      return;
    }
    setSaving(true);
    try {
      if (editing) await onUpdate(editing.id, values);
      else await onCreate(values);
      setFormOpen(false);
      form.reset(emptyDepartment);
    } finally {
      setSaving(false);
    }
  });

  const rowActions: RowAction<Department>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
    { label: t.masters.deactivate, icon: <Power />, onSelect: (row) => setToggleTarget(row) },
  ];

  return (
    <>
      <PageHeader
        title={t.masters.depFull}
        subtitle={t.masters.depSubtitle}
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupMasters }]}
        helpTopic="department"
        primaryAction={{ label: t.masters.depNew, icon: <Plus />, onClick: openNew }}
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
          id="dep-status-filter"
          label={t.common.status}
          value={activeFilter}
          onChange={onActiveFilterChange}
          options={statusOptions}
          className="w-full sm:w-36"
        />
      </section>

      <DataTable<Department>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        rowActions={rowActions}
        onRowClick={openEdit}
        showExport
        showColumnToggle
        emptyHeadline={t.masters.depEmpty}
        emptyDescription={t.masters.depEmptyHint}
        cardTitle={(r) => `${r.code} — ${r.name}`}
        cardSubtitle={(r) => employeeName(r.headEmployeeId)}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.masters.depEdit : t.masters.depNew}</DialogTitle>
          </DialogHeader>

          <FormLayout
            isDirty={isDirty}
            isSaving={saving}
            submitLabel={t.common.save}
            onSubmit={submit}
            onCancel={() => setFormOpen(false)}
          >
            <FormSection title={t.masters.secDepIdentity} helpTopic="department" columns={2}>
              <TextField
                id="dep-code"
                label={t.masters.depCode}
                required
                value={form.watch('code')}
                onChange={(v) => form.setValue('code', v.toUpperCase(), { shouldDirty: true })}
                error={errors.code?.message}
                maxLength={8}
                placeholder="PUR"
              />
              <TextField
                id="dep-name"
                label={t.masters.depName}
                required
                value={form.watch('name')}
                onChange={(v) => form.setValue('name', v, { shouldDirty: true })}
                error={errors.name?.message}
                placeholder="Procurement"
              />
            </FormSection>

            <FormSection title={t.masters.secDepOwner} helpTopic="departmentHead" columns={2}>
              <Controller
                control={form.control}
                name="headEmployeeId"
                render={({ field }) => (
                  <SearchableSelectField
                    id="dep-head"
                    label={t.masters.depHead}
                    value={field.value}
                    onChange={field.onChange}
                    options={headOptions}
                    error={errors.headEmployeeId?.message}
                    helperText={headNote}
                    helpTopic="departmentHead"
                  />
                )}
              />
              <Controller
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <CheckboxField
                    id="dep-active"
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
        documentLabel={toggleTarget ? `${toggleTarget.code} — ${toggleTarget.name}` : undefined}
        description={t.masters.depDeactivateWarning}
        onConfirm={() => {
          if (toggleTarget) void onToggleActive(toggleTarget);
          setToggleTarget(null);
        }}
      />
    </>
  );
}

export default DepartmentScreen;
