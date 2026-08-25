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
  DateField,
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
import type { Employee } from '@/lib/data/types';
import { employeeColumns, type EmployeeLookups } from './employee-columns';
import { employeeSchema, emptyEmployee, type EmployeeFormValues } from './employee-schema';

/** Sentinel for the optional lookups — '' reads as "nothing selected". */
const NONE = '__none__';

export interface EmployeeScreenProps {
  rows: Employee[];
  allRows: Employee[];
  isLoading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  deptFilter: string;
  onDeptFilterChange: (v: string) => void;
  companyFilter: string;
  onCompanyFilterChange: (v: string) => void;
  activeFilter: string;
  onActiveFilterChange: (v: string) => void;
  departmentOptions: Option[];
  companyOptions: Option[];
  /** All projects, with `companyId` carried on the option hint for filtering. */
  projectOptions: (Option & { companyId: string })[];
  lookups: EmployeeLookups;
  onCreate: (values: EmployeeFormValues) => Promise<void>;
  onUpdate: (id: string, values: EmployeeFormValues) => Promise<void>;
  onToggleActive: (row: Employee) => Promise<void>;
}

export function EmployeeScreen({
  rows,
  allRows,
  isLoading,
  search,
  onSearchChange,
  deptFilter,
  onDeptFilterChange,
  companyFilter,
  onCompanyFilterChange,
  activeFilter,
  onActiveFilterChange,
  departmentOptions,
  companyOptions,
  projectOptions,
  lookups,
  onCreate,
  onUpdate,
  onToggleActive,
}: EmployeeScreenProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Employee | null>(null);
  const [toggleTarget, setToggleTarget] = React.useState<Employee | null>(null);
  const [saving, setSaving] = React.useState(false);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: emptyEmployee,
    mode: 'onBlur',
  });
  const { errors, isDirty } = form.formState;
  const companyId = form.watch('companyId');
  const projectId = form.watch('projectId');
  const reportingToId = form.watch('reportingToId');

  const columns = React.useMemo(() => employeeColumns(lookups), [lookups]);

  /** A project belongs to one company, so the company choice constrains it. */
  const visibleProjects: Option[] = React.useMemo(
    () => [
      { value: NONE, label: t.masters.empProjectNone },
      ...projectOptions.filter((p) => !companyId || p.companyId === companyId),
    ],
    [projectOptions, companyId],
  );

  const managerOptions: Option[] = React.useMemo(
    () => [
      { value: NONE, label: t.masters.empReportingNone },
      ...allRows
        .filter((e) => e.isActive && e.id !== editing?.id)
        .map((e) => ({ value: e.id, label: `${e.name} — ${e.designation}`, hint: e.code })),
    ],
    [allRows, editing],
  );

  const statusOptions: Option[] = [
    { value: 'ALL', label: t.common.all },
    { value: 'ACTIVE', label: t.admin.active },
    { value: 'INACTIVE', label: t.admin.inactive },
  ];
  const deptFilterOptions: Option[] = [{ value: 'ALL', label: t.common.all }, ...departmentOptions];
  const companyFilterOptions: Option[] = [{ value: 'ALL', label: t.common.all }, ...companyOptions];

  /** Cross-company reporting is legitimate in a group with SPVs — advise only. */
  const managerNote = React.useMemo(() => {
    if (!reportingToId || !companyId) return undefined;
    const mgr = allRows.find((e) => e.id === reportingToId);
    if (!mgr || mgr.companyId === companyId) return undefined;
    return t.masters.empReportingCrossCompany.replace('{company}', lookups.companyCode(mgr.companyId));
  }, [reportingToId, companyId, allRows, lookups]);

  const openNew = () => {
    setEditing(null);
    form.reset(emptyEmployee);
    setFormOpen(true);
  };

  const openEdit = (row: Employee) => {
    setEditing(row);
    form.reset({
      code: row.code,
      name: row.name,
      designation: row.designation,
      departmentId: row.departmentId,
      companyId: row.companyId,
      projectId: row.projectId ?? '',
      dateOfJoining: row.dateOfJoining,
      reportingToId: row.reportingToId ?? '',
      phone: row.phone,
      email: row.email,
      pfNumber: row.pfNumber ?? '',
      esiNumber: row.esiNumber ?? '',
      isActive: row.isActive,
    });
    setFormOpen(true);
  };

  /** Walks the reporting chain upward looking for the employee being edited. */
  const findCycle = React.useCallback(
    (startManagerId: string, selfId: string): string[] | null => {
      const chain: string[] = [];
      const seen = new Set<string>();
      let cursor: string | undefined = startManagerId;
      while (cursor) {
        if (seen.has(cursor)) return null; // pre-existing loop, not ours
        seen.add(cursor);
        const node = allRows.find((e) => e.id === cursor);
        if (!node) return null;
        chain.push(node.name);
        if (node.id === selfId) return chain;
        cursor = node.reportingToId;
      }
      return null;
    },
    [allRows],
  );

  const submit = form.handleSubmit(async (values) => {
    if (allRows.some((r) => r.code.toUpperCase() === values.code.toUpperCase() && r.id !== editing?.id)) {
      form.setError('code', { message: t.masters.empDuplicateCode });
      return;
    }
    if (allRows.some((r) => r.email.toLowerCase() === values.email.toLowerCase() && r.id !== editing?.id)) {
      form.setError('email', { message: t.masters.empDuplicateEmail });
      return;
    }
    if (values.reportingToId && editing && values.reportingToId === editing.id) {
      form.setError('reportingToId', { message: t.masters.empReportingSelf });
      return;
    }
    if (values.reportingToId && editing) {
      const cycle = findCycle(values.reportingToId, editing.id);
      if (cycle) {
        form.setError('reportingToId', {
          message: t.masters.empReportingCycle.replace('{chain}', [editing.name, ...cycle].join(' → ')),
        });
        return;
      }
    }
    setSaving(true);
    try {
      if (editing) await onUpdate(editing.id, values);
      else await onCreate(values);
      setFormOpen(false);
      form.reset(emptyEmployee);
    } finally {
      setSaving(false);
    }
  });

  const rowActions: RowAction<Employee>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
    { label: t.masters.deactivate, icon: <Power />, onSelect: (row) => setToggleTarget(row) },
  ];

  return (
    <>
      <PageHeader
        title={t.masters.empFull}
        subtitle={t.masters.empSubtitle}
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupMasters }]}
        helpTopic="employee"
        primaryAction={{ label: t.masters.empNew, icon: <Plus />, onClick: openNew }}
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
          id="emp-dept-filter"
          label={t.masters.department}
          value={deptFilter}
          onChange={onDeptFilterChange}
          options={deptFilterOptions}
          className="w-full sm:w-56"
        />
        <SelectField
          id="emp-company-filter"
          label={t.masters.company}
          value={companyFilter}
          onChange={onCompanyFilterChange}
          options={companyFilterOptions}
          className="w-full sm:w-44"
        />
        <SelectField
          id="emp-status-filter"
          label={t.common.status}
          value={activeFilter}
          onChange={onActiveFilterChange}
          options={statusOptions}
          className="w-full sm:w-36"
        />
      </section>

      <DataTable<Employee>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        rowActions={rowActions}
        onRowClick={openEdit}
        showExport
        showColumnToggle
        emptyHeadline={t.masters.empEmpty}
        emptyDescription={t.masters.empEmptyHint}
        cardTitle={(r) => `${r.code} — ${r.name}`}
        cardSubtitle={(r) => `${r.designation} — ${lookups.departmentName(r.departmentId)}`}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.masters.empEdit : t.masters.empNew}</DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <FormLayout
              isDirty={isDirty}
              isSaving={saving}
              submitLabel={t.common.save}
              onSubmit={submit}
              onCancel={() => setFormOpen(false)}
            >
              <FormSection title={t.masters.secEmpIdentity} helpTopic="employee" columns={2}>
                <TextField
                  id="emp-code"
                  label={t.masters.empCode}
                  required
                  value={form.watch('code')}
                  onChange={(v) => form.setValue('code', v.toUpperCase(), { shouldDirty: true })}
                  error={errors.code?.message}
                  placeholder="UIE/E/1061"
                />
                <DateField
                  id="emp-doj"
                  label={t.masters.empDoj}
                  required
                  value={form.watch('dateOfJoining')}
                  onChange={(v) => form.setValue('dateOfJoining', v, { shouldDirty: true })}
                  error={errors.dateOfJoining?.message}
                />
                <TextField
                  id="emp-name"
                  label={t.masters.empName}
                  required
                  value={form.watch('name')}
                  onChange={(v) => form.setValue('name', v, { shouldDirty: true })}
                  error={errors.name?.message}
                />
                <TextField
                  id="emp-designation"
                  label={t.masters.empDesignation}
                  required
                  value={form.watch('designation')}
                  onChange={(v) => form.setValue('designation', v, { shouldDirty: true })}
                  error={errors.designation?.message}
                  placeholder="Site Engineer"
                />
              </FormSection>

              <FormSection title={t.masters.secEmpPosting} helpTopic="employeeReporting" columns={2}>
                <Controller
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <SelectField
                      id="emp-dept"
                      label={t.masters.department}
                      required
                      value={field.value}
                      onChange={field.onChange}
                      options={departmentOptions}
                      error={errors.departmentId?.message}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <SelectField
                      id="emp-company"
                      label={t.masters.company}
                      required
                      value={field.value}
                      onChange={(v) => {
                        field.onChange(v);
                        // A project belonging to the old company no longer applies.
                        const stillValid = projectOptions.some(
                          (p) => p.value === projectId && p.companyId === v,
                        );
                        if (!stillValid) form.setValue('projectId', '', { shouldDirty: true });
                      }}
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
                      id="emp-project"
                      label={t.masters.project}
                      value={field.value || NONE}
                      onChange={(v) => field.onChange(v === NONE ? '' : v)}
                      options={visibleProjects}
                      error={errors.projectId?.message}
                      disabled={!companyId}
                      helperText={!companyId ? t.masters.empProjectNone : undefined}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="reportingToId"
                  render={({ field }) => (
                    <SearchableSelectField
                      id="emp-reporting-to"
                      label={t.masters.empReportingTo}
                      value={field.value || NONE}
                      onChange={(v) => field.onChange(v === NONE ? '' : v)}
                      options={managerOptions}
                      error={errors.reportingToId?.message}
                      helperText={managerNote}
                      helpTopic="employeeReporting"
                    />
                  )}
                />
              </FormSection>

              <FormSection title={t.masters.secEmpContact} columns={2}>
                <TextField
                  id="emp-phone"
                  label={t.masters.phone}
                  required
                  value={form.watch('phone')}
                  onChange={(v) => form.setValue('phone', v, { shouldDirty: true })}
                  error={errors.phone?.message}
                  placeholder="+91 98490 21145"
                />
                <TextField
                  id="emp-email"
                  label={t.masters.email}
                  required
                  value={form.watch('email')}
                  onChange={(v) => form.setValue('email', v, { shouldDirty: true })}
                  error={errors.email?.message}
                  placeholder="name@udayinfra.co.in"
                />
              </FormSection>

              <FormSection title={t.masters.secEmpStatutory} helpTopic="employeeStatutory" columns={2}>
                <TextField
                  id="emp-pf"
                  label={t.masters.empPf}
                  value={form.watch('pfNumber')}
                  onChange={(v) => form.setValue('pfNumber', v.toUpperCase(), { shouldDirty: true })}
                  error={errors.pfNumber?.message}
                  placeholder="TG/HYD/0045821/1001"
                />
                <TextField
                  id="emp-esi"
                  label={t.masters.empEsi}
                  value={form.watch('esiNumber')}
                  onChange={(v) => form.setValue('esiNumber', v.replace(/\D/g, ''), { shouldDirty: true })}
                  error={errors.esiNumber?.message}
                  maxLength={10}
                  placeholder="5301234567"
                />
                <Controller
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <CheckboxField
                      id="emp-active"
                      label={t.admin.active}
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </FormSection>
            </FormLayout>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={toggleTarget !== null}
        onOpenChange={(o) => !o && setToggleTarget(null)}
        intent="CANCEL"
        documentLabel={toggleTarget ? `${toggleTarget.code} — ${toggleTarget.name}` : undefined}
        description={t.masters.empDeactivateWarning}
        onConfirm={() => {
          if (toggleTarget) void onToggleActive(toggleTarget);
          setToggleTarget(null);
        }}
      />
    </>
  );
}

export default EmployeeScreen;
