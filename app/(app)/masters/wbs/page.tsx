'use client';

import * as React from 'react';
import { listProjects, listUoms, listWbsNodes } from '@/lib/data';
import { useMasterCollection } from '@/lib/masters/use-master-collection';
import type { Project, Uom, WbsNode } from '@/lib/data/types';
import { WbsScreen } from '@/features/masters/wbs/wbs-screen';
import { sortTree, type WbsFormValues } from '@/features/masters/wbs/wbs-schema';

const toWbsNode = (v: WbsFormValues): Omit<WbsNode, 'id'> => ({
  projectId: v.projectId,
  code: v.code.trim(),
  name: v.name.trim(),
  parentId: v.parentId === '' ? null : v.parentId,
  level: v.level,
  uomCode: v.uomCode,
  budgetedQty: v.budgetedQty === '' ? undefined : v.budgetedQty,
  budgetedCost: v.budgetedCostCrore === '' ? undefined : Math.round(v.budgetedCostCrore * 10000000),
  isActive: v.isActive,
});

/**
 * listWbsNodes requires a projectId, but the hook holds fetchFixtures in a ref
 * and would not refetch on project change. So every project is loaded once and
 * the selection filters client-side.
 */
async function fetchAllWbs(): Promise<WbsNode[]> {
  const projects = await listProjects();
  const perProject = await Promise.all(projects.map((p) => listWbsNodes(p.id)));
  return perProject.flat();
}

export default function Page() {
  const { rows, isLoading, create, update, toggleActive } = useMasterCollection<WbsNode, WbsFormValues>({
    entityKey: 'wbs',
    fetchFixtures: fetchAllWbs,
    toDomain: toWbsNode,
  });

  const [projects, setProjects] = React.useState<Project[]>([]);
  const [uoms, setUoms] = React.useState<Uom[]>([]);
  const [projectId, setProjectId] = React.useState('');

  React.useEffect(() => {
    void (async () => {
      const [p, u] = await Promise.all([listProjects(), listUoms()]);
      setProjects(p);
      setUoms(u);
      if (p.length > 0) setProjectId(p[0].id);
    })();
  }, []);

  const projectOptions = React.useMemo(
    () => projects.map((p) => ({ value: p.id, label: `${p.code} — ${p.shortName}` })),
    [projects],
  );

  const uomOptions = React.useMemo(
    () => uoms.filter((u) => u.isActive).map((u) => ({ value: u.code, label: `${u.code} — ${u.name}` })),
    [uoms],
  );

  const visible = React.useMemo(
    () => sortTree(rows.filter((r) => r.projectId === projectId)),
    [rows, projectId],
  );

  return (
    <WbsScreen
      rows={visible}
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projectOptions}
      uomOptions={uomOptions}
      onCreate={create}
      onUpdate={update}
      onToggleActive={toggleActive}
    />
  );
}
