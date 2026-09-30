'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { PrScreen } from '@/features/procurement/pr-screen';
import type { PrFormValues } from '@/features/procurement/pr-schema';
import {
  createRecord,
  listEmployees,
  listItems,
  listProjects,
  listPurchaseRequisitions,
  listSites,
  listWbsNodes,
  savePurchaseRequisition,
} from '@/lib/data';
import type { Project, PurchaseRequisition } from '@/lib/data/types';

/** Grid rows back to domain lines. A blank estimated rate drops out. */
function formFields(v: PrFormValues) {
  return {
    projectId: v.projectId,
    siteId: v.siteId,
    date: v.date,
    priority: v.priority,
    indentedBy: v.indentedBy,
    requiredBy: v.requiredBy,
    deliverySiteId: v.deliverySiteId,
    justification: v.justification || undefined,
    lines: v.lines.map((l) => ({
      id: l.id,
      itemId: l.itemId,
      description: l.description,
      uomCode: l.uomCode,
      quantity: typeof l.quantity === 'number' ? l.quantity : 0,
      estimatedRate: typeof l.rate === 'number' && l.rate > 0 ? l.rate : undefined,
      wbsId: l.wbsCode || undefined,
      remarks: l.remarks || undefined,
    })),
    remarks: v.remarks || undefined,
  };
}

export default function Page() {
  const [rows, setRows] = React.useState<PurchaseRequisition[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectId, setProjectId] = React.useState('');
  const [siteOptions, setSiteOptions] = React.useState<Option[]>([]);
  const [siteNames, setSiteNames] = React.useState<Record<string, string>>({});
  const [employeeOptions, setEmployeeOptions] = React.useState<Option[]>([]);
  const [wbsOptions, setWbsOptions] = React.useState<Option[]>([]);
  const [itemOptions, setItemOptions] = React.useState<
    (Option & { uomCode?: string; gstRate?: number })[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      try {
        const [list, items] = await Promise.all([listProjects(), listItems({ pageSize: 500 })]);
        setProjects(list);
        if (list.length) setProjectId((cur) => cur || list[0].id);
        setItemOptions(
          items.rows
            .filter((i) => i.isActive)
            .map((i) => ({
              value: i.id,
              label: i.name,
              hint: i.code,
              uomCode: i.stockUomCode,
              gstRate: i.gstRate,
            })),
        );
      } catch (err) {
        console.error('[pr] reference data failed', err);
        setIsLoading(false);
      }
    })();
  }, []);

  const load = React.useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [prs, sites, employees, wbs] = await Promise.all([
        listPurchaseRequisitions({ projectId, pageSize: 500 }),
        listSites({ projectId }),
        listEmployees({ projectId }),
        listWbsNodes(projectId),
      ]);
      setRows(prs.rows);
      setSiteOptions(sites.map((s) => ({ value: s.id, label: s.name })));
      setSiteNames(Object.fromEntries(sites.map((s) => [s.id, s.name])));
      setEmployeeOptions(
        employees.rows.map((e) => ({ value: e.id, label: e.name, hint: e.designation })),
      );
      setWbsOptions(wbs.map((w) => ({ value: w.code, label: `${w.code} — ${w.name}` })));
    } catch (err) {
      console.error('[pr] load failed', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const target = projects.find((p) => p.id === projectId) ?? null;
  const defaultSiteId = siteOptions[0]?.value ?? '';

  const projectOptions: Option[] = projects.map((p) => ({
    value: p.id,
    label: `${p.code} — ${p.name}`,
  }));

  return (
    <PrScreen
      rows={rows}
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projectOptions}
      siteId={defaultSiteId}
      siteOptions={siteOptions}
      employeeOptions={employeeOptions}
      itemOptions={itemOptions}
      wbsOptions={wbsOptions}
      siteName={(id) => siteNames[id] ?? id}
      onCreate={async (values) => {
        // Company follows the selected project, never a hard-coded entity.
        await createRecord<PurchaseRequisition>('purchaseRequisitions', {
          ...formFields(values),
          companyId: target?.companyId ?? '',
          status: 'DRAFT',
          revisionNo: 0,
          createdBy: values.indentedBy,
          createdOn: new Date().toISOString(),
          documentNo: `UIE/PR/2526/${String(Date.now()).slice(-4)}`,
        });
        await load();
      }}
      onUpdate={async (id, values) => {
        // Approval status, revision and created-by are not user-editable here.
        await savePurchaseRequisition(id, {
          ...formFields(values),
          updatedOn: new Date().toISOString(),
        });
        await load();
      }}
    />
  );
}
