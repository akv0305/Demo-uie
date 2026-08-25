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
  EmptyState,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCrore, formatNumber } from '@/lib/format';
import type { WbsNode } from '@/lib/data/types';
import { wbsColumns } from './wbs-columns';
import { ancestorIds, emptyWbs, wbsSchema, type WbsFormValues } from './wbs-schema';

export interface WbsScreenProps {
  /** Depth-first ordered nodes of the selected project. */
  rows: WbsNode[];
  isLoading: boolean;
  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];
  uomOptions: Option[];
  onCreate: (values: WbsFormValues) => Promise<void>;
  onUpdate: (id: string, values: WbsFormValues) => Promise<void>;
  onToggleActive: (row: WbsNode) => Promise<void>;
}

export function WbsScreen({
  rows,
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
  uomOptions,
  onCreate,
  onUpdate,
  onToggleActive,
}: WbsScreenProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<WbsNode | null>(null);
  const [toggleTarget, setToggleTarget] = React.useState<WbsNode | null>(null);
  const [saving, setSaving] = React.useState(false);

  const form = useForm<WbsFormValues>({
    resolver: zodResolver(wbsSchema),
    defaultValues: emptyWbs(projectId),
    mode: 'onBlur',
  });
  const { errors, isDirty } = form.formState;

  const parentId = form.watch('parentId');
  const columns = React.useMemo(() => wbsColumns(), []);

  const byId = React.useMemo(
    () => new Map(rows.map((r) => [r.id, { parentId: r.parentId }])),
    [rows],
  );

  /** Nodes that may be a parent: same project, not self, not a descendant. */
  const parentOptions: Option[] = React.useMemo(() => {
    const banned = new Set<string>();
    if (editing) {
      banned.add(editing.id);
      for (const r of rows) if (ancestorIds(r.id, byId).includes(editing.id)) banned.add(r.id);
    }
    return [
      { value: '', label: t.masters.wbsParentNone },
      ...rows
        .filter((r) => !banned.has(r.id) && r.level < 4)
        .map((r) => ({ value: r.id, label: `${r.code} — ${r.name}` })),
    ];
  }, [rows, editing, byId]);

  const parent = rows.find((r) => r.id === parentId);

  // Level and code prefix both follow the parent, so neither is typed freehand.
  React.useEffect(() => {
    const nextLevel = parent ? parent.level + 1 : 1;
    if (form.getValues('level') !== nextLevel) {
      form.setValue('level', nextLevel, { shouldDirty: true });
    }
  }, [parent, form]);

  const hasChildren = React.useMemo(
    () => (editing ? rows.some((r) => r.parentId === editing.id) : false),
    [rows, editing],
  );

  const openNew = () => {
    setEditing(null);
    form.reset(emptyWbs(projectId));
    setFormOpen(true);
  };

  const openChild = (row: WbsNode) => {
    setEditing(null);
    form.reset({
      ...emptyWbs(projectId),
      parentId: row.id,
      level: row.level + 1,
      code: `${row.code}.`,
    });
    setFormOpen(true);
  };

  const openEdit = (row: WbsNode) => {
    setEditing(row);
    form.reset({
      projectId: row.projectId,
      code: row.code,
      name: row.name,
      parentId: row.parentId ?? '',
      level: row.level,
      uomCode: row.uomCode ?? '',
      budgetedQty: row.budgetedQty ?? '',
      budgetedCostCrore: row.budgetedCost === undefined ? '' : row.budgetedCost / 10000000,
      isActive: row.isActive !== false,
    });
    setFormOpen(true);
  };

  const submit = form.handleSubmit(async (values) => {
    if (rows.some((r) => r.code === values.code && r.id !== editing?.id)) {
      form.setError('code', { message: t.masters.wbsDuplicateCode });
      return;
    }
    // A child's code must sit under its parent's.
    if (parent && !values.code.startsWith(`${parent.code}.`)) {
      form.setError('code', { message: `Start the code with ${parent.code}.` });
      return;
    }
    setSaving(true);
    try {
      if (editing) await onUpdate(editing.id, values);
      else await onCreate(values);
      setFormOpen(false);
      form.reset(emptyWbs(projectId));
    } finally {
      setSaving(false);
    }
  });

  const rowActions: RowAction<WbsNode>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
    { label: t.masters.wbsChild, icon: <Plus />, onSelect: openChild },
    { label: t.masters.deactivate, icon: <Power />, onSelect: (row) => setToggleTarget(row) },
  ];

  return (
    <>
      <PageHeader
        title={t.masters.wbsFull}
        subtitle={t.masters.wbsSubtitle}
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupMasters }]}
        helpTopic="wbs"
        primaryAction={
          projectId ? { label: t.masters.wbsNew, icon: <Plus />, onClick: openNew } : undefined
        }
      />

      <section className="mb-section rounded-lg border border-border bg-surface p-card">
        <SelectField
          id="wbs-project"
          label={t.masters.project}
          required
          value={projectId}
          onChange={onProjectChange}
          options={projectOptions}
          helperText={t.masters.wbsSelectProject}
          className="w-full sm:w-96"
        />
      </section>

      {projectId === '' ? (
        <EmptyState headline={t.masters.wbsSelectProject} />
      ) : (
        <DataTable<WbsNode>
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          isLoading={isLoading}
          rowActions={rowActions}
          onRowClick={openEdit}
          showExport
          showColumnToggle
          emptyHeadline={t.masters.wbsEmpty}
          emptyDescription={t.masters.wbsEmptyHint}
          cardTitle={(r) => `${r.code}  ${r.name}`}
          cardSubtitle={(r) =>
            r.budgetedCost === undefined ? r.name : `${t.masters.wbsBudgetedCost}: ${formatCrore(r.budgetedCost)}`
          }
        />
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.masters.wbsEdit : t.masters.wbsNew}</DialogTitle>
          </DialogHeader>

          <FormLayout
            isDirty={isDirty}
            isSaving={saving}
            submitLabel={t.common.save}
            onSubmit={submit}
            onCancel={() => setFormOpen(false)}
          >
            <FormSection title={t.masters.secWbsIdentity} helpTopic="wbs" columns={2}>
              <Controller
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <SearchableSelectField
                    id="wbs-parent"
                    label={t.masters.wbsParent}
                    value={field.value}
                    onChange={field.onChange}
                    options={parentOptions}
                    error={errors.parentId?.message}
                    helperText={`${t.masters.wbsLevel} ${form.watch('level')}`}
                  />
                )}
              />
              <TextField
                id="wbs-code"
                label={t.masters.wbsCode}
                required
                value={form.watch('code')}
                onChange={(v) => form.setValue('code', v, { shouldDirty: true })}
                error={errors.code?.message}
                maxLength={14}
                placeholder={parent ? `${parent.code}.01` : '01'}
              />
              <TextField
                id="wbs-name"
                label={t.masters.wbsName}
                required
                value={form.watch('name')}
                onChange={(v) => form.setValue('name', v, { shouldDirty: true })}
                error={errors.name?.message}
                placeholder="Granular Sub Base (GSB)"
              />
              <Controller
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <CheckboxField
                    id="wbs-active"
                    label={t.admin.active}
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormSection>

            <FormSection title={t.masters.secWbsBudget} helpTopic="wbsBudget" columns={2}>
              <Controller
                control={form.control}
                name="uomCode"
                render={({ field }) => (
                  <SearchableSelectField
                    id="wbs-uom"
                    label={t.masters.uom}
                    value={field.value}
                    onChange={field.onChange}
                    options={uomOptions}
                    error={errors.uomCode?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="budgetedQty"
                render={({ field }) => (
                  <NumberField
                    id="wbs-qty"
                    label={t.masters.wbsBudgetedQty}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.budgetedQty?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="budgetedCostCrore"
                render={({ field }) => (
                  <AmountField
                    id="wbs-cost"
                    label={`${t.masters.wbsBudgetedCost} (Cr)`}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.budgetedCostCrore?.message}
                    helperText={hasChildren ? t.masters.wbsHasChildren : undefined}
                  />
                )}
              />
            </FormSection>

            {editing && (
              <FormSection title={t.masters.secWbsExecution} columns={2}>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t.masters.wbsExecutedQty}
                  </span>
                  <p className="num text-sm text-muted-foreground">
                    {editing.executedQty === undefined ? '—' : formatNumber(editing.executedQty)}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t.masters.wbsActualCost}
                  </span>
                  <p className="num text-sm text-muted-foreground">
                    {editing.actualCost === undefined ? '—' : formatCrore(editing.actualCost)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  {t.masters.wbsExecutionReadOnly}
                </p>
              </FormSection>
            )}
          </FormLayout>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={toggleTarget !== null}
        onOpenChange={(o) => !o && setToggleTarget(null)}
        intent="CANCEL"
        documentLabel={toggleTarget ? `${toggleTarget.code}  ${toggleTarget.name}` : undefined}
        description={t.masters.wbsDeactivateWarning}
        onConfirm={() => {
          if (toggleTarget) void onToggleActive(toggleTarget);
          setToggleTarget(null);
        }}
      />
    </>
  );
}

export default WbsScreen;
