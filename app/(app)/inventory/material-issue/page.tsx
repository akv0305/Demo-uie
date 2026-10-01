'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { IssueScreen } from '@/features/inventory/issue-screen';
import type { IssueFormValues } from '@/features/inventory/issue-schema';
import {
  createRecord,
  listEmployees,
  listEquipment,
  listItems,
  listMaterialIssues,
  listProjects,
  listSites,
  listSubcontractors,
  listWbsNodes,
  saveMaterialIssue,
} from '@/lib/data';
import type { MaterialIssue, MaterialIssueLine, Project } from '@/lib/data/types';

export default function Page() {
  const [rows, setRows] = React.useState<MaterialIssue[]>([]);
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
  const [equipmentOptions, setEquipmentOptions] = React.useState<Option[]>([]);
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
      const [issues, sites, emps, wbs, eqp] = await Promise.all([
        listMaterialIssues({ projectId, pageSize: 500 }),
        listSites(),
        listEmployees({ projectId, pageSize: 200 }),
        listWbsNodes(projectId),
        listEquipment({ projectId, pageSize: 200 }),
      ]);
      setRows(issues.rows);
      const opts = sites
        .filter((s) => s.projectId === projectId)
        .map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` }));
      setSiteOptions(opts);
      setSiteId((cur) => cur || opts[0]?.value || '');
      setEmployeeOptions(
        emps.rows.map((e) => ({ value: e.id, label: e.name, hint: e.designation })),
      );
      setWbsOptions(wbs.map((w) => ({ value: w.id, label: w.name, hint: w.code })));
      setEquipmentOptions(eqp.rows.map((e) => ({ value: e.id, label: e.name, hint: e.code })));
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

  const formFields = (v: IssueFormValues, lines: MaterialIssueLine[]) => ({
    ...clean(v),
    projectId,
    siteId: v.storeSiteId || siteId,
    subcontractorName:
      v.issueType === 'SUBCONTRACTOR'
        ? subcontractorOptions.find((s) => s.value === v.subcontractorId)?.label
        : undefined,
    lines,
  });

  return (
    <IssueScreen
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
      equipmentOptions={equipmentOptions}
      onCreate={async (values, lines) => {
        await createRecord<MaterialIssue>('materialIssues', {
          ...formFields(values, lines),
          companyId: projects.find((p) => p.id === projectId)?.companyId ?? '',
          status: 'DRAFT' as const,
          revisionNo: 0,
          createdBy: values.issuedBy,
          createdOn: new Date().toISOString(),
          documentNo: `UIE/MI/2526/${String(rows.length + 1).padStart(4, '0')}`,
        });
        await load();
      }}
      onUpdate={async (id, values, lines) => {
        await saveMaterialIssue(id, {
          ...formFields(values, lines),
          updatedOn: new Date().toISOString(),
        });
        await load();
      }}
    />
  );
}
