'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { HindranceScreen } from '@/features/project-controls/hindrance-screen';
import type { HindranceFormValues } from '@/features/project-controls/hindrance-schema';
import {
  createRecord,
  listHindrances,
  listProjects,
  listSites,
  listWbsNodes,
  saveHindrance,
} from '@/lib/data';
import type { Hindrance, Project } from '@/lib/data/types';

export default function Page() {
  const [rows, setRows] = React.useState<Hindrance[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectId, setProjectId] = React.useState('');
  const [siteOptions, setSiteOptions] = React.useState<Option[]>([]);
  const [wbsOptions, setWbsOptions] = React.useState<Option[]>([]);
  const [wbsNames, setWbsNames] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      try {
        const list = await listProjects();
        setProjects(list);
        if (list.length) setProjectId((cur) => cur || list[0].id);
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

  const projectOptions: Option[] = projects.map((p) => ({
    value: p.id,
    label: `${p.code} — ${p.name}`,
  }));
  const defaultSiteId = siteOptions[0]?.value ?? '';

  /** Only the fields the form owns. Audit fields are never written from here. */
  // Cleared optional values are written as '' rather than dropped (R7, D-067).
  const formFields = (v: HindranceFormValues) => ({
    projectId: v.projectId,
    siteId: v.siteId || defaultSiteId,
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
        // The company follows the project, never a fixed entity (DEF-042).
        const project = projects.find((p) => p.id === values.projectId);
        await createRecord<Hindrance>('hindrances', {
          ...formFields(values),
          companyId: project?.companyId ?? '',
          status: 'DRAFT',
          revisionNo: 0,
          createdBy: project?.projectManagerId ?? '',
          createdOn: new Date().toISOString(),
          documentNo: `UIE/HIN/2526/${String(Date.now()).slice(-4)}`,
        });
        await load();
      }}
      onUpdate={async (id, values) => {
        // Status, revision and created-by stay as they were (DEF-045).
        await saveHindrance(id, {
          ...formFields(values),
          updatedOn: new Date().toISOString(),
        });
        await load();
      }}
    />
  );
}
