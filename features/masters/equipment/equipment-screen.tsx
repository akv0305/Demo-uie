'use client';

import * as React from 'react';
import { Pencil, Plus, Power } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { terminology as t } from '@/config/terminology.config';
import {
  AmountField,
  CheckboxField,
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
  type Option,
  type RowAction,
} from '@/components/erp';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Equipment } from '@/lib/data/types';
import { equipmentColumns, type EquipmentColumnLookups } from './equipment-columns';
import {
  EQUIPMENT_STATUSES,
  EQUIPMENT_TYPES,
  HIRE_RATE_UNITS,
  OWNERSHIPS,
  emptyEquipment,
  equipmentSchema,
  type EquipmentFormValues,
} from './equipment-schema';

export interface EquipmentScreenProps extends EquipmentColumnLookups {
  rows: Equipment[];
  isLoading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  ownershipFilter: string;
  onOwnershipFilterChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  activeFilter: string;
  onActiveFilterChange: (v: string) => void;
  projectOptions: Option[];
  /** All sites; the screen narrows them to the chosen project. */
  siteOptions: (Option & { projectId: string | null })[];
  /** Equipment-hire vendors only. */
  vendorOptions: Option[];
  employeeOptions: Option[];
  onCreate: (values: EquipmentFormValues) => Promise<void>;
  onUpdate: (id: string, values: EquipmentFormValues) => Promise<void>;
  onToggleActive: (row: Equipment) => Promise<void>;
}

export function EquipmentScreen({
  rows,
  isLoading,
  search,
  onSearchChange,
  ownershipFilter,
  onOwnershipFilterChange,
  statusFilter,
  onStatusFilterChange,
  activeFilter,
  onActiveFilterChange,
  projectOptions,
  siteOptions,
  vendorOptions,
  employeeOptions,
  projectName,
  siteName,
  vendorName,
  employeeName,
  onCreate,
  onUpdate,
  onToggleActive,
}: EquipmentScreenProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Equipment | null>(null);
  const [toggleTarget, setToggleTarget] = React.useState<Equipment | null>(null);
  const [saving, setSaving] = React.useState(false);

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: emptyEquipment,
    mode: 'onBlur',
  });
  const { errors, isDirty } = form.formState;

  const ownership = form.watch('ownership');
  const projectId = form.watch('projectId');
  const isHired = ownership === 'HIRED';

  const columns = React.useMemo(
    () => equipmentColumns({ projectName, siteName, vendorName, employeeName }),
    [projectName, siteName, vendorName, employeeName],
  );

  const ownershipOptions: Option[] = OWNERSHIPS.map((v) => ({
    value: v,
    label: v === 'OWNED' ? t.masters.eoOWNED : t.masters.eoHIRED,
  }));

  const statusOptions: Option[] = EQUIPMENT_STATUSES.map((v) => ({
    value: v,
    label: t.masters[`es${v}`],
  }));

  const typeOptions: Option[] = EQUIPMENT_TYPES.map((v) => ({ value: v, label: v }));

  const rateUnitOptions: Option[] = HIRE_RATE_UNITS.map((v) => ({ value: v, label: v }));

  const activeOptions: Option[] = [
    { value: 'ALL', label: t.common.all },
    { value: 'ACTIVE', label: t.admin.active },
    { value: 'INACTIVE', label: t.admin.inactive },
  ];

  /** Sites of the chosen project, plus company-level sites. */
  const projectSites = React.useMemo(
    () =>
      siteOptions
        .filter((s) => s.projectId === projectId || s.projectId === null)
        .map(({ value, label }) => ({ value, label })),
    [siteOptions, projectId],
  );

  // Owned equipment carries no hire details.
  React.useEffect(() => {
    if (!isHired) {
      if (form.getValues('hireVendorId') !== '') form.setValue('hireVendorId', '', { shouldDirty: true });
      if (form.getValues('hireRate') !== '') form.setValue('hireRate', '', { shouldDirty: true });
      if (form.getValues('hireRateUnit') !== '') form.setValue('hireRateUnit', '', { shouldDirty: true });
    }
  }, [isHired, form]);

  // Changing project invalidates a site belonging to the old one.
  React.useEffect(() => {
    const current = form.getValues('siteId');
    if (current && !projectSites.some((s) => s.value === current)) {
      form.setValue('siteId', '', { shouldDirty: true });
    }
  }, [projectSites, form]);

  const openNew = () => {
    setEditing(null);
    form.reset(emptyEquipment);
    setFormOpen(true);
  };

  const openEdit = (row: Equipment) => {
    setEditing(row);
    form.reset({
      code: row.code,
      name: row.name,
      type: row.type,
      registrationNo: row.registrationNo ?? '',
      ownership: row.ownership,
      hireVendorId: row.hireVendorId ?? '',
      hireRate: row.hireRate ?? '',
      hireRateUnit: row.hireRateUnit ?? '',
      projectId: row.projectId ?? '',
      siteId: row.siteId ?? '',
      operatorEmployeeId: row.operatorEmployeeId ?? '',
      status: row.status,
      currentHmr: row.currentHmr,
      nextServiceDueHmr: row.nextServiceDueHmr ?? '',
      nextServiceDueDate: row.nextServiceDueDate ?? '',
      isActive: row.isActive !== false,
    });
    setFormOpen(true);
  };

  const submit = form.handleSubmit(async (values) => {
    if (rows.some((r) => r.code.toUpperCase() === values.code.toUpperCase() && r.id !== editing?.id)) {
      form.setError('code', { message: t.masters.eqpDuplicateCode });
      return;
    }
    if (
      values.registrationNo !== '' &&
      rows.some(
        (r) => (r.registrationNo ?? '').toUpperCase() === values.registrationNo && r.id !== editing?.id,
      )
    ) {
      form.setError('registrationNo', { message: t.masters.eqpDuplicateReg });
      return;
    }
    setSaving(true);
    try {
      if (editing) await onUpdate(editing.id, values);
      else await onCreate(values);
      setFormOpen(false);
      form.reset(emptyEquipment);
    } finally {
      setSaving(false);
    }
  });

  const rowActions: RowAction<Equipment>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
    { label: t.masters.deactivate, icon: <Power />, onSelect: (row) => setToggleTarget(row) },
  ];

  return (
    <>
      <PageHeader
        title={t.masters.eqpFull}
        subtitle={t.masters.eqpSubtitle}
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupMasters }]}
        helpTopic="equipment"
        primaryAction={{ label: t.masters.eqpNew, icon: <Plus />, onClick: openNew }}
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
          id="eqp-own-filter"
          label={t.masters.eqpOwnership}
          value={ownershipFilter}
          onChange={onOwnershipFilterChange}
          options={[{ value: 'ALL', label: t.common.all }, ...ownershipOptions]}
          className="w-full sm:w-36"
        />
        <SelectField
          id="eqp-status-filter"
          label={t.masters.eqpStatus}
          value={statusFilter}
          onChange={onStatusFilterChange}
          options={[{ value: 'ALL', label: t.common.all }, ...statusOptions]}
          className="w-full sm:w-44"
        />
        <SelectField
          id="eqp-active-filter"
          label={t.common.status}
          value={activeFilter}
          onChange={onActiveFilterChange}
          options={activeOptions}
          className="w-full sm:w-36"
        />
      </section>

      <DataTable<Equipment>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        rowActions={rowActions}
        onRowClick={openEdit}
        showExport
        showColumnToggle
        emptyHeadline={t.masters.eqpEmpty}
        emptyDescription={t.masters.eqpEmptyHint}
        cardTitle={(r) => `${r.code}  ${r.name}`}
        cardSubtitle={(r) => `${r.type} · ${t.masters[`es${r.status}`]}`}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.masters.eqpEdit : t.masters.eqpNew}</DialogTitle>
          </DialogHeader>

          <FormLayout
            isDirty={isDirty}
            isSaving={saving}
            submitLabel={t.common.save}
            onSubmit={submit}
            onCancel={() => setFormOpen(false)}
          >
            <FormSection title={t.masters.secEqpIdentity} helpTopic="equipment" columns={2}>
              <TextField
                id="eqp-code"
                label={t.masters.eqpCode}
                required
                value={form.watch('code')}
                onChange={(v) => form.setValue('code', v.toUpperCase(), { shouldDirty: true })}
                error={errors.code?.message}
                maxLength={20}
                placeholder="UIE/EQ/EXC01"
              />
              <TextField
                id="eqp-name"
                label={t.masters.eqpName}
                required
                value={form.watch('name')}
                onChange={(v) => form.setValue('name', v, { shouldDirty: true })}
                error={errors.name?.message}
                placeholder="Excavator Tata Hitachi EX210LC"
              />
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <SearchableSelectField
                    id="eqp-type"
                    label={t.masters.eqpType}
                    required
                    value={field.value}
                    onChange={field.onChange}
                    options={typeOptions}
                    error={errors.type?.message}
                  />
                )}
              />
              <TextField
                id="eqp-reg"
                label={t.masters.eqpRegNo}
                value={form.watch('registrationNo')}
                onChange={(v) => form.setValue('registrationNo', v.toUpperCase(), { shouldDirty: true })}
                error={errors.registrationNo?.message}
                helperText={t.masters.eqpRegNoHint}
                maxLength={12}
                placeholder="TS07UB4412"
              />
            </FormSection>

            <FormSection title={t.masters.secEqpOwnership} helpTopic="equipmentHire" columns={2}>
              <Controller
                control={form.control}
                name="ownership"
                render={({ field }) => (
                  <SelectField
                    id="eqp-ownership"
                    label={t.masters.eqpOwnership}
                    required
                    value={field.value}
                    onChange={field.onChange}
                    options={ownershipOptions}
                    error={errors.ownership?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="hireVendorId"
                render={({ field }) => (
                  <SearchableSelectField
                    id="eqp-hire-vendor"
                    label={t.masters.eqpHireVendor}
                    required={isHired}
                    value={field.value}
                    onChange={field.onChange}
                    options={vendorOptions}
                    disabled={!isHired}
                    error={errors.hireVendorId?.message}
                    helperText={isHired ? undefined : t.masters.eqpHireFieldsOwned}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="hireRate"
                render={({ field }) => (
                  <AmountField
                    id="eqp-hire-rate"
                    label={t.masters.eqpHireRate}
                    required={isHired}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!isHired}
                    error={errors.hireRate?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="hireRateUnit"
                render={({ field }) => (
                  <SelectField
                    id="eqp-rate-unit"
                    label={t.masters.eqpHireRateUnit}
                    required={isHired}
                    value={field.value}
                    onChange={field.onChange}
                    options={rateUnitOptions}
                    disabled={!isHired}
                    error={errors.hireRateUnit?.message}
                  />
                )}
              />
            </FormSection>

            <FormSection title={t.masters.secEqpDeployment} columns={2}>
              <Controller
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <SearchableSelectField
                    id="eqp-project"
                    label={t.masters.project}
                    value={field.value}
                    onChange={field.onChange}
                    options={projectOptions}
                    error={errors.projectId?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="siteId"
                render={({ field }) => (
                  <SearchableSelectField
                    id="eqp-site"
                    label={t.masters.siteName}
                    value={field.value}
                    onChange={field.onChange}
                    options={projectSites}
                    disabled={!projectId}
                    error={errors.siteId?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="operatorEmployeeId"
                render={({ field }) => (
                  <SearchableSelectField
                    id="eqp-operator"
                    label={t.masters.eqpOperator}
                    value={field.value}
                    onChange={field.onChange}
                    options={employeeOptions}
                    error={errors.operatorEmployeeId?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <SelectField
                    id="eqp-status"
                    label={t.masters.eqpStatus}
                    required
                    value={field.value}
                    onChange={field.onChange}
                    options={statusOptions}
                    error={errors.status?.message}
                  />
                )}
              />
            </FormSection>

            <FormSection title={t.masters.secEqpService} helpTopic="equipmentReading" columns={2}>
              <Controller
                control={form.control}
                name="currentHmr"
                render={({ field }) => (
                  <NumberField
                    id="eqp-hmr"
                    label={t.masters.eqpCurrentHmr}
                    required
                    value={field.value}
                    onChange={(v) => field.onChange(v === '' ? 0 : v)}
                    error={errors.currentHmr?.message}
                    helperText={t.masters.eqpCurrentHmrHint}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="nextServiceDueHmr"
                render={({ field }) => (
                  <NumberField
                    id="eqp-service-hmr"
                    label={t.masters.eqpNextServiceHmr}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.nextServiceDueHmr?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="nextServiceDueDate"
                render={({ field }) => (
                  <DateField
                    id="eqp-service-date"
                    label={t.masters.eqpNextServiceDate}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.nextServiceDueDate?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <CheckboxField
                    id="eqp-active"
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
        description={t.masters.eqpDeactivateWarning}
        onConfirm={() => {
          if (toggleTarget) void onToggleActive(toggleTarget);
          setToggleTarget(null);
        }}
      />
    </>
  );
}

export default EquipmentScreen;
