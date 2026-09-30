'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { VariationScreen } from '@/features/project-controls/variation-screen';
import type { VariationFormValues } from '@/features/project-controls/variation-schema';
import {
  createRecord,
  listProjects,
  listSites,
  listUoms,
  listVariations,
  listWbsNodes,
  saveVariation,
} from '@/lib/data';
import type { Project, Variation } from '@/lib/data/types';

export default function Page() {
  const [rows, setRows] = React.useState<Variation[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectId, setProjectId] = React.useState('');
  const [siteOptions, setSiteOptions] = React.useState<Option[]>([]);
  const [wbsOptions, setWbsOptions] = React.useState<Option[]>([]);
  const [wbsNames, setWbsNames] = React.useState<Record<string, string>>({});
  const [uomOptions, setUomOptions] = React.useState<Option[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      try {
        const [list, uoms] = await Promise.all([listProjects(), listUoms()]);
        setProjects(list);
        setUomOptions(uoms.map((u) => ({ value: u.code, label: `${u.code} — ${u.name}` })));
        if (list.length) setProjectId((cur) => cur || list[0].id);
      } catch (err) {
        console.error('[variation] projects failed', err);
        setIsLoading(false);
      }
    })();
  }, []);

  const load = React.useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [vars, sites, wbs] = await Promise.all([
        listVariations({ projectId, pageSize: 500 }),
        listSites(),
        listWbsNodes(projectId),
      ]);
      setRows(vars.rows);
      setSiteOptions(
        sites
          .filter((s) => s.projectId === projectId)
          .map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` })),
      );
      setWbsOptions(wbs.map((w) => ({ value: w.id, label: `${w.code} ${w.name}` })));
      const map: Record<string, string> = {};
      wbs.forEach((w) => (map[w.id] = `${w.code} ${w.name}`));
      setWbsNames(map);
    } catch (err) {
      console.error('[variation] load failed', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const project = projects.find((p) => p.id === projectId);
  const projectOptions: Option[] = projects.map((p) => ({
    value: p.id,
    label: `${p.code} — ${p.name}`,
  }));
  const defaultSiteId = siteOptions[0]?.value ?? '';

  /** Only the fields the form owns. Audit fields are never written from here. */
  const formFields = (v: VariationFormValues) => ({
    projectId: v.projectId,
    siteId: v.siteId || defaultSiteId,
    date: v.date,
    category: v.category,
    origin: v.origin,
    description: v.description,
    wbsId: v.wbsId || undefined,
    location: v.location,
    uomCode: v.uomCode || undefined,
    quantity: v.quantity === '' ? undefined : v.quantity,
    rate: v.rate === '' ? undefined : v.rate,
    proposedAmount: v.proposedAmount,
    approvedAmount: v.isDecided && v.approvedAmount !== '' ? v.approvedAmount : undefined,
    clientRefNo: v.clientRefNo,
    clientRefDate: v.clientRefDate,
    needsRateAnalysis: v.needsRateAnalysis,
    timeExtensionDays: v.timeExtensionDays === '' ? undefined : v.timeExtensionDays,
    remarks: v.remarks,
  });

  return (
    <VariationScreen
      rows={rows}
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projectOptions}
      contractValue={project?.contractValue ?? 0}
      siteId={defaultSiteId}
      siteOptions={siteOptions}
      wbsOptions={wbsOptions}
      uomOptions={uomOptions}
      activityName={(id) => (id ? (wbsNames[id] ?? id) : '—')}
      onCreate={async (values) => {
        // The company follows the project, never a fixed entity.
        const target = projects.find((p) => p.id === values.projectId);
        await createRecord<Variation>('variations', {
          ...formFields(values),
          companyId: target?.companyId ?? '',
          status: 'DRAFT',
          revisionNo: 0,
          createdBy: target?.projectManagerId ?? '',
          createdOn: new Date().toISOString(),
          documentNo: `UIE/VO/2526/${String(Date.now()).slice(-4)}`,
        });
        await load();
      }}
      onUpdate={async (id, values) => {
        // Status, revision and created-by stay as they were.
        await saveVariation(id, { ...formFields(values), updatedOn: new Date().toISOString() });
        await load();
      }}
    />
  );
}
