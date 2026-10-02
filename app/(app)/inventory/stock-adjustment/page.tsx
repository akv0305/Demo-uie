'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { AdjustmentScreen } from '@/features/inventory/adjustment-screen';
import type { AdjustmentFormValues } from '@/features/inventory/adjustment-schema';
import {
  createRecord,
  listEmployees,
  listItems,
  listProjects,
  listSites,
  listStockAdjustments,
  saveStockAdjustment,
} from '@/lib/data';
import type { Project, Site, StockAdjustment, StockAdjustmentLine } from '@/lib/data/types';

export default function Page() {
  const [rows, setRows] = React.useState<StockAdjustment[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectId, setProjectId] = React.useState('');
  const [sites, setSites] = React.useState<Site[]>([]);
  const [itemOptions, setItemOptions] = React.useState<
    (Option & { uomCode?: string; gstRate?: number })[]
  >([]);
  const [employeeOptions, setEmployeeOptions] = React.useState<Option[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Masters that do not depend on the selected project.
  React.useEffect(() => {
    void (async () => {
      const [list, itm, allSites] = await Promise.all([
        listProjects(),
        listItems({ pageSize: 500 }),
        listSites(),
      ]);
      setProjects(list);
      if (list.length) setProjectId((cur) => cur || list[0].id);
      setSites(allSites);
      setItemOptions(
        itm.rows.map((i) => ({
          value: i.id,
          label: i.name,
          hint: i.code,
          uomCode: i.stockUomCode,
          gstRate: i.gstRate,
        })),
      );
    })();
  }, []);

  const load = React.useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [adjustments, emps] = await Promise.all([
        listStockAdjustments({ projectId, pageSize: 500 }),
        listEmployees({ projectId, pageSize: 200 }),
      ]);
      setRows(adjustments.rows);
      setEmployeeOptions(
        emps.rows.map((e) => ({ value: e.id, label: e.name, hint: e.designation })),
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  /** Only a store can be counted, and only one belonging to the project in hand. */
  const storeOptions = React.useMemo<Option[]>(
    () =>
      sites
        .filter((s) => s.isStore && (s.projectId === projectId || s.projectId === null))
        .map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` })),
    [sites, projectId],
  );

  /** Empty strings from the form mean "not entered", not "blank value". */
  const clean = <T extends Record<string, unknown>>(v: T): T =>
    Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x === '' ? undefined : x])) as T;

  const formFields = (
    v: AdjustmentFormValues,
    lines: StockAdjustmentLine[],
    approve: boolean,
  ) => ({
    ...clean(v),
    projectId,
    // The audit block mirrors the store that was counted.
    siteId: v.storeSiteId,
    lines,
    // Nothing reaches stock until this is set (D-143). The witness approves
    // where there was one, otherwise the counter — pending Q-99.
    approvedBy: approve ? v.verifiedBy || v.countedBy : undefined,
    approvedOn: approve ? new Date().toISOString().slice(0, 10) : undefined,
    status: approve ? ('APPROVED' as const) : ('DRAFT' as const),
  });

  return (
    <AdjustmentScreen
      rows={rows}
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projects.map((p) => ({ value: p.id, label: p.name, hint: p.code }))}
      storeOptions={storeOptions}
      itemOptions={itemOptions}
      employeeOptions={employeeOptions}
      onCreate={async (values, lines, approve) => {
        await createRecord<StockAdjustment>('stockAdjustments', {
          ...formFields(values, lines, approve),
          companyId: projects.find((p) => p.id === projectId)?.companyId ?? '',
          revisionNo: 0,
          createdBy: values.countedBy,
          createdOn: new Date().toISOString(),
          documentNo: `UIE/SA/2526/${String(rows.length + 1).padStart(4, '0')}`,
        });
        await load();
      }}
      onUpdate={async (id, values, lines, approve) => {
        await saveStockAdjustment(id, {
          ...formFields(values, lines, approve),
          updatedOn: new Date().toISOString(),
        });
        await load();
      }}
    />
  );
}
