'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { DashboardScreen } from '@/features/project-controls/dashboard-screen';
import {
  getProject,
  listBankGuarantees,
  listClaims,
  listDprs,
  listHindrances,
  listProjects,
  listVariations,
  listWbsNodes,
} from '@/lib/data';
import type {
  BankGuarantee,
  Claim,
  DailyProgressReport,
  Hindrance,
  Project,
  Variation,
} from '@/lib/data/types';
import { rollupWbs, type RolledWbsNode } from '@/lib/project/wbs-rollup';

export default function Page() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectId, setProjectId] = React.useState('');
  const [project, setProject] = React.useState<Project | null>(null);
  const [wbs, setWbs] = React.useState<RolledWbsNode[]>([]);
  const [hindrances, setHindrances] = React.useState<Hindrance[]>([]);
  const [variations, setVariations] = React.useState<Variation[]>([]);
  const [claims, setClaims] = React.useState<Claim[]>([]);
  const [guarantees, setGuarantees] = React.useState<BankGuarantee[]>([]);
  const [dprs, setDprs] = React.useState<DailyProgressReport[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      try {
        const list = await listProjects();
        setProjects(list);
        if (list.length) setProjectId((cur) => cur || list[0].id);
      } catch (err) {
        console.error('[dashboard] projects failed', err);
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
        const [prj, nodes, hin, vars, clm, bgs, dpr] = await Promise.all([
          getProject(projectId),
          listWbsNodes(projectId),
          listHindrances({ projectId, pageSize: 500 }),
          listVariations({ projectId, pageSize: 500 }),
          listClaims({ projectId, pageSize: 500 }),
          listBankGuarantees({ projectId, pageSize: 500 }),
          listDprs({ projectId, pageSize: 500 }),
        ]);
        if (cancelled) return;
        setProject(prj);
        setWbs(rollupWbs(nodes));
        setHindrances(hin.rows);
        setVariations(vars.rows);
        setClaims(clm.rows);
        setGuarantees(bgs.rows);
        setDprs(dpr.rows);
      } catch (err) {
        console.error('[dashboard] load failed', err);
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
    <DashboardScreen
      project={project}
      wbs={wbs}
      hindrances={hindrances}
      variations={variations}
      claims={claims}
      guarantees={guarantees}
      dprs={dprs}
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projectOptions}
    />
  );
}
