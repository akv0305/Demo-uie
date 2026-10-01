'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { ReturnScreen } from '@/features/inventory/return-screen';
import type { ReturnFormValues } from '@/features/inventory/return-schema';
import { postToIssue } from '@/lib/inventory/material-return';
import {
  createRecord,
  listEmployees,
  listItems,
  listMaterialIssues,
  listMaterialReturns,
  listProjects,
  listSites,
  listSubcontractors,
  listWbsNodes,
  saveMaterialIssue,
  saveMaterialReturn,
} from '@/lib/data';
import type {
  MaterialIssue,
  MaterialReturn,
  MaterialReturnLine,
  Project,
} from '@/lib/data/types';

export default function Page() {
  const [rows, setRows] = React.useState<MaterialReturn[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectId, setProjectId] = React.useState('');
  const [siteId, setSiteId] = React.useState('');
  const [siteOptions, setSiteOptions] = React.useState<Option[]>([]);
  const [itemOptions, setItemOptions] = React.useState<
    (Option & { uomCode?: string; gstRate?: number })[]
  >([]);
  const [wbsOptions, setWbsOptions] = React.useState<Option[]>([]);
  const [employeeOptions, setEmployeeOptions] = React.useState<Option[]>([]);
  const [subcontractorOptions, setSubcontractorOptions] = React.useState<Option[]>([]);
  const [issues, setIssues] = React.useState<MaterialIssue[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Masters that do not depend on the selected project.
  React.useEffect(() => {
    void (async () => {
      const [list, itm, subs] = await Promise.all([
        listProjects(),
        listItems({ pageSize: 500 }),
        listSubcontractors({ pageSize: 200 }),
      ]);
      setProjects(list);
      if (list.length) setProjectId((cur) => cur || list[0].id);
      setItemOptions(
        itm.rows.map((i) => ({
          value: i.id,
          label: i.name,
          hint: i.code,
          uomCode: i.stockUomCode,
          gstRate: i.gstRate,
        })),
      );
      setSubcontractorOptions(
        subs.rows.map((s) => ({ value: s.id, label: s.name, hint: s.trade })),
      );
    })();
  }, []);

  const load = React.useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [returns, mis, sites, emps, wbs] = await Promise.all([
        listMaterialReturns({ projectId, pageSize: 500 }),
        listMaterialIssues({ projectId, pageSize: 500 }),
        listSites(),
        listEmployees({ projectId, pageSize: 200 }),
        listWbsNodes(projectId),
      ]);
      setRows(returns.rows);
      // Only issues with material still out can be returned against.
      setIssues(
        mis.rows.filter(
          (m) =>
            m.status !== 'CANCELLED' &&
            m.lines.some((l) => l.issuedQty - (l.returnedQty ?? 0) > 0),
        ),
      );
      const opts = sites
        .filter((s) => s.projectId === projectId)
        .map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` }));
      setSiteOptions(opts);
      setSiteId((cur) => cur || opts[0]?.value || '');
      setEmployeeOptions(
        emps.rows.map((e) => ({ value: e.id, label: e.name, hint: e.designation })),
      );
      setWbsOptions(wbs.map((w) => ({ value: w.id, label: w.name, hint: w.code })));
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  /** Empty strings from the form mean "not entered", not "blank value". */
  const clean = <T extends Record<string, unknown>>(v: T): T =>
    Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x === '' ? undefined : x])) as T;

  const formFields = (v: ReturnFormValues, lines: MaterialReturnLine[]) => {
    const issue = issues.find((m) => m.id === v.issueId);
    return {
      ...clean(v),
      projectId,
      siteId: v.storeSiteId || siteId,
      issueDocumentNo: issue?.documentNo,
      subcontractorName:
        v.returnType === 'FROM_SUBCONTRACTOR'
          ? subcontractorOptions.find((s) => s.value === v.subcontractorId)?.label
          : undefined,
      lines,
    };
  };

  /** D-130 — the return is the only writer of MaterialIssueLine.returnedQty. */
  const postBackToIssue = async (values: ReturnFormValues, ret: MaterialReturn) => {
    if (!values.issueId) return;
    const issue = issues.find((m) => m.id === values.issueId);
    if (issue) await saveMaterialIssue(issue.id, postToIssue(issue, ret));
  };

  return (
    <ReturnScreen
      rows={rows}
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projects.map((p) => ({ value: p.id, label: p.name, hint: p.code }))}
      siteId={siteId}
      siteOptions={siteOptions}
      storeOptions={siteOptions}
      itemOptions={itemOptions}
      wbsOptions={wbsOptions}
      employeeOptions={employeeOptions}
      subcontractorOptions={subcontractorOptions}
      issues={issues}
      onCreate={async (values, lines) => {
        const draft = {
          ...formFields(values, lines),
          companyId: projects.find((p) => p.id === projectId)?.companyId ?? '',
          status: 'DRAFT' as const,
          revisionNo: 0,
          createdBy: values.receivedBy,
          createdOn: new Date().toISOString(),
          documentNo: `UIE/MR/2526/${String(rows.length + 1).padStart(4, '0')}`,
        };
        await createRecord<MaterialReturn>('materialReturns', draft);
        // postToIssue reads only r.lines, so the unassigned id is immaterial.
        await postBackToIssue(values, { ...draft, id: '' } as MaterialReturn);
        await load();
      }}
      onUpdate={async (id, values, lines) => {
        const patch = { ...formFields(values, lines), updatedOn: new Date().toISOString() };
        await saveMaterialReturn(id, patch);
        await postBackToIssue(values, { ...patch, id } as MaterialReturn);
        await load();
      }}
    />
  );
}
