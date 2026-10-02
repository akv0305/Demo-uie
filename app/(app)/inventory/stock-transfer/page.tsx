'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { TransferScreen } from '@/features/inventory/transfer-screen';
import type { TransferFormValues } from '@/features/inventory/transfer-schema';
import { deriveStage } from '@/lib/inventory/stock-transfer';
import {
  createRecord,
  listEmployees,
  listItems,
  listProjects,
  listSites,
  listStockTransfers,
  saveStockTransfer,
} from '@/lib/data';
import type { Project, Site, StockTransfer, StockTransferLine } from '@/lib/data/types';

export default function Page() {
  const [rows, setRows] = React.useState<StockTransfer[]>([]);
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
      const [transfers, emps] = await Promise.all([
        listStockTransfers({ projectId, pageSize: 500 }),
        listEmployees({ projectId, pageSize: 200 }),
      ]);
      setRows(transfers.rows);
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

  const label = (s: Site) => `${s.code} — ${s.name}`;

  /** Material can only leave a store of the project in hand. */
  const storeOptions = React.useMemo<Option[]>(
    () =>
      sites
        .filter((s) => s.isStore && (s.projectId === projectId || s.projectId === null))
        .map((s) => ({ value: s.id, label: label(s) })),
    [sites, projectId],
  );

  /** It may go to any store, including another project's (D-136). */
  const toStoreOptions = React.useMemo<Option[]>(
    () =>
      sites
        .filter((s) => s.isStore)
        .map((s) => ({
          value: s.id,
          label: label(s),
          hint:
            s.projectId && s.projectId !== projectId
              ? projects.find((p) => p.id === s.projectId)?.shortName
              : undefined,
        })),
    [sites, projectId, projects],
  );

  /** Empty strings from the form mean "not entered", not "blank value". */
  const clean = <T extends Record<string, unknown>>(v: T): T =>
    Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x === '' ? undefined : x])) as T;

  const formFields = (
    v: TransferFormValues,
    lines: StockTransferLine[],
    dispatched: boolean,
  ) => {
    const to = sites.find((s) => s.id === v.toSiteId);
    // Only carried when the far end sits on a different project.
    const toProjectId = to?.projectId && to.projectId !== projectId ? to.projectId : undefined;
    const stage = deriveStage({ lines } as StockTransfer, dispatched);
    return {
      ...clean(v),
      projectId,
      // The audit block mirrors the sending store.
      siteId: v.fromSiteId,
      toProjectId,
      stage,
      // A transfer that has arrived must say when, even if nobody typed it.
      receivedDate:
        stage === 'RECEIVED' || stage === 'PARTLY_RECEIVED'
          ? v.receivedDate || new Date().toISOString().slice(0, 10)
          : undefined,
      lines,
    };
  };

  return (
    <TransferScreen
      rows={rows}
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projects.map((p) => ({ value: p.id, label: p.name, hint: p.code }))}
      storeOptions={storeOptions}
      toStoreOptions={toStoreOptions}
      itemOptions={itemOptions}
      employeeOptions={employeeOptions}
      onCreate={async (values, lines, dispatched) => {
        await createRecord<StockTransfer>('stockTransfers', {
          ...formFields(values, lines, dispatched),
          companyId: projects.find((p) => p.id === projectId)?.companyId ?? '',
          status: 'DRAFT' as const,
          revisionNo: 0,
          createdBy: values.dispatchedBy,
          createdOn: new Date().toISOString(),
          documentNo: `UIE/ST/2526/${String(rows.length + 1).padStart(4, '0')}`,
        });
        await load();
      }}
      onUpdate={async (id, values, lines, dispatched) => {
        await saveStockTransfer(id, {
          ...formFields(values, lines, dispatched),
          updatedOn: new Date().toISOString(),
        });
        await load();
      }}
    />
  );
}
