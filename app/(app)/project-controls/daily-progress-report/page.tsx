'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import type { Option } from '@/components/erp';
import { DprScreen } from '@/features/project-controls/dpr-screen';
import {
  listDprs,
  listEquipment,
  listProjects,
  listSites,
  listSubcontractors,
  listWbsNodes,
} from '@/lib/data';
import type { DailyProgressReport } from '@/lib/data/types';

export default function Page() {
  const [rows, setRows] = React.useState<DailyProgressReport[]>([]);
  const [projectOptions, setProjectOptions] = React.useState<Option[]>([]);
  const [projectId, setProjectId] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [names, setNames] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      try {
        const projects = await listProjects();
        setProjectOptions(projects.map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` })));
        if (projects.length) setProjectId((cur) => cur || projects[0].id);
      } catch (err) {
        console.error('[dpr] projects failed', err);
        setIsLoading(false);
      }
    })();
  }, []);

  React.useEffect(() => {
    if (!projectId) return;
    void (async () => {
      setIsLoading(true);
      try {
        const [dprs, sites, wbs, equipment, subs] = await Promise.all([
          listDprs({ projectId, pageSize: 500 }),
          listSites(),
          listWbsNodes(projectId),
          listEquipment({ pageSize: 500 }),
          listSubcontractors({ pageSize: 500 }),
        ]);
        const map: Record<string, string> = {};
        sites.forEach((s) => (map[s.id] = s.name));
        wbs.forEach((w) => (map[w.id] = `${w.code} ${w.name}`));
        equipment.rows.forEach((e) => (map[e.id] = `${e.code} — ${e.name}`));
        subs.rows.forEach((s) => (map[s.id] = s.name));
        setNames(map);
        setRows(dprs.rows);
      } catch (err) {
        console.error('[dpr] load failed', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [projectId]);

  const visible = statusFilter === 'ALL' ? rows : rows.filter((r) => r.status === statusFilter);

  const statusOptions: Option[] = [
    { value: 'ALL', label: t.common.all },
    ...(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'RETURNED'] as const).map((s) => ({
      value: s,
      label: t.status[s],
    })),
  ];

  const nameOf = (id: string) => names[id] ?? id;

  return (
    <DprScreen
      rows={visible}
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projectOptions}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      statusOptions={statusOptions}
      siteName={nameOf}
      wbsName={nameOf}
      equipmentName={nameOf}
      subcontractorName={(id) => (id ? nameOf(id) : t.project.dprOwnLabour)}
    />
  );
}
