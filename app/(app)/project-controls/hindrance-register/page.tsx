'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { HindranceScreen } from '@/features/project-controls/hindrance-screen';
import type { HindranceFormValues } from '@/features/project-controls/hindrance-schema';
import { createRecord, listHindrances, listProjects, listSites, listWbsNodes, updateRecord } from '@/lib/data';
import type { Hindrance } from '@/lib/data/types';

export default function Page() {
  const [rows, setRows] = React.useState<Hindrance[]>([]);
  const [projectOptions, setProjectOptions] = React.useState<Option[]>([]);
  const [projectId, setProjectId] = React.useState('');
  const [siteOptions, setSiteOptions] = React.useState<Option[]>([]);
  const [wbsOptions, setWbsOptions] = React.useState<Option[]>([]);
  const [wbsNames, setWbsNames] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      try {
        const projects = await listProjects();
        setProjectOptions(projects.map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` })));
        if (projects.length) setProjectId((cur) => cur || projects[0].id);
      } catch (err) {
        console.error('[hindrance] projects failed', err);
        setIsLoading(false);
      }
    })();
  }, []);

  const load = React.useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [hin, sites, wbs] = await Promise.all([
        listHindrances({ projectId, pageSize: 500 }),
        listSites(),
        listWbsNodes(projectId),
      ]);
      setRows(hin.rows);
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
      console.error('[hindrance] load failed', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const defaultSiteId = siteOptions[0]?.value ?? '';

  // Cleared optional values are written as '' rather than dropped (R7, D-067).
  const toRecord = (v: HindranceFormValues) => ({
    companyId: 'CMP-UIE',
    projectId: v.projectId,
    siteId: v.siteId || defaultSiteId,
    status: 'DRAFT' as const,
    revisionNo: 0,
    fromDate: v.fromDate,
    toDate: v.toDate,
    category: v.category,
    responsibility: v.responsibility,
    description: v.description,
    wbsId: v.wbsId,
    location: v.location,
    isWorkStopped: v.isWorkStopped,
    isEotClaimable: v.isEotClaimable,
    eotClaimDays: v.eotClaimDays === '' ? undefined : v.eotClaimDays,
    actionTaken: v.actionTaken,
    resolvedRemarks: v.resolvedRemarks,
    createdBy: 'EMP-0004',
    createdOn: new Date().toISOString(),
  });

  return (
    <HindranceScreen
      rows={rows}
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projectOptions}
      siteId={defaultSiteId}
      siteOptions={siteOptions}
      wbsOptions={wbsOptions}
      activityName={(id) => (id ? (wbsNames[id] ?? id) : '—')}
      onCreate={async (values) => {
        await createRecord<Hindrance>('hindrances', {
          ...toRecord(values),
          documentNo: `UIE/HIN/2526/${String(Date.now()).slice(-4)}`,
        });
        await load();
      }}
      onUpdate={async (id, values) => {
        await updateRecord<Hindrance>('hindrances', id, toRecord(values));
        await load();
      }}
    />
  );
}
