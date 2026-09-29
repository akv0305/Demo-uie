'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { WbsBudgetScreen } from '@/features/project-controls/wbs-budget-screen';
import { listProjects, listWbsNodes } from '@/lib/data';
import { sortTree } from '@/features/masters/wbs/wbs-schema';
import { rollupWbs, type RolledWbsNode } from '@/lib/project/wbs-rollup';

export default function Page() {
  const [projectOptions, setProjectOptions] = React.useState<Option[]>([]);
  const [projectId, setProjectId] = React.useState('');
  const [rows, setRows] = React.useState<RolledWbsNode[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      try {
        const projects = await listProjects();
        setProjectOptions(projects.map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` })));
        if (projects.length) setProjectId((cur) => cur || projects[0].id);
      } catch (err) {
        console.error('[wbs-budget] projects failed', err);
        setIsLoading(false);
      }
    })();
  }, []);

  React.useEffect(() => {
    if (!projectId) return;
    void (async () => {
      setIsLoading(true);
      try {
        const nodes = await listWbsNodes(projectId);
        // Sort first so the indent reads as a tree, then roll up.
        setRows(rollupWbs(sortTree(nodes)));
      } catch (err) {
        console.error('[wbs-budget] nodes failed', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [projectId]);

  return (
    <WbsBudgetScreen
      rows={rows}
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projectOptions}
    />
  );
}
