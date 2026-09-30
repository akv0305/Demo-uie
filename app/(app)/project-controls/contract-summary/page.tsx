'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { ContractSummaryScreen } from '@/features/project-controls/contract-summary-screen';
import {
  getProject,
  listClaims,
  listHindrances,
  listProjects,
  listVariations,
  listWbsNodes,
} from '@/lib/data';
import type { Claim, Hindrance, Project, Variation } from '@/lib/data/types';
import { rollupWbs, type RolledWbsNode } from '@/lib/project/wbs-rollup';

export default function Page() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectId, setProjectId] = React.useState('');
  const [project, setProject] = React.useState<Project | null>(null);
  const [variations, setVariations] = React.useState<Variation[]>([]);
  const [claims, setClaims] = React.useState<Claim[]>([]);
  const [hindrances, setHindrances] = React.useState<Hindrance[]>([]);
  const [wbs, setWbs] = React.useState<RolledWbsNode[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      try {
        const list = await listProjects();
        setProjects(list);
        if (list.length) setProjectId((cur) => cur || list[0].id);
      } catch (err) {
        console.error('[contract-summary] projects failed', err);
        setIsLoading(false);
      }
    })();
  }, []);

  React.useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      try {
        const [prj, vars, clm, hin, nodes] = await Promise.all([
          getProject(projectId),
          listVariations({ projectId, pageSize: 500 }),
          listClaims({ projectId, pageSize: 500 }),
          listHindrances({ projectId, pageSize: 500 }),
          listWbsNodes(projectId),
        ]);
        if (cancelled) return;
        setProject(prj);
        setVariations(vars.rows);
        setClaims(clm.rows);
        setHindrances(hin.rows);
        setWbs(rollupWbs(nodes));
      } catch (err) {
        console.error('[contract-summary] load failed', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const projectOptions: Option[] = projects.map((p) => ({
    value: p.id,
    label: `${p.code} — ${p.name}`,
  }));

  return (
    <ContractSummaryScreen
      project={project}
      variations={variations}
      claims={claims}
      hindrances={hindrances}
      wbs={wbs}
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projectOptions}
    />
  );
}
