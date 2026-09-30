'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { ClaimScreen } from '@/features/project-controls/claim-screen';
import type { ClaimFormValues } from '@/features/project-controls/claim-schema';
import {
  createRecord,
  listClaims,
  listHindrances,
  listProjects,
  listSites,
  listVariations,
  saveClaim,
} from '@/lib/data';
import type { Claim, Project } from '@/lib/data/types';

export default function Page() {
  const [rows, setRows] = React.useState<Claim[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectId, setProjectId] = React.useState('');
  const [siteOptions, setSiteOptions] = React.useState<Option[]>([]);
  const [hindranceOptions, setHindranceOptions] = React.useState<Option[]>([]);
  const [variationOptions, setVariationOptions] = React.useState<Option[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      try {
        const list = await listProjects();
        setProjects(list);
        if (list.length) setProjectId((cur) => cur || list[0].id);
      } catch (err) {
        console.error('[claim] projects failed', err);
        setIsLoading(false);
      }
    })();
  }, []);

  const load = React.useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [clm, sites, hin, vars] = await Promise.all([
        listClaims({ projectId, pageSize: 500 }),
        listSites(),
        listHindrances({ projectId, pageSize: 500 }),
        listVariations({ projectId, pageSize: 500 }),
      ]);
      setRows(clm.rows);
      setSiteOptions(
        sites
          .filter((s) => s.projectId === projectId)
          .map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` })),
      );
      setHindranceOptions(
        hin.rows.map((h) => ({ value: h.id, label: `${h.documentNo} — ${h.description.slice(0, 60)}` })),
      );
      setVariationOptions(
        vars.rows.map((v) => ({ value: v.id, label: `${v.documentNo} — ${v.description.slice(0, 60)}` })),
      );
    } catch (err) {
      console.error('[claim] load failed', err);
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
  const formFields = (v: ClaimFormValues) => {
    const closed = v.stage === 'SETTLED' || v.stage === 'WITHDRAWN';
    return {
      projectId: v.projectId,
      siteId: v.siteId || defaultSiteId,
      date: v.date,
      type: v.type,
      stage: v.stage,
      title: v.title,
      description: v.description,
      hindranceId: v.hindranceId || undefined,
      variationId: v.variationId || undefined,
      noticeDate: v.noticeDate || undefined,
      noticeRefNo: v.noticeRefNo,
      particularsDate: v.particularsDate || undefined,
      claimedAmount: v.claimedAmount === '' ? 0 : v.claimedAmount,
      claimedDays: v.claimedDays === '' ? undefined : v.claimedDays,
      settledAmount: closed && v.settledAmount !== '' ? v.settledAmount : undefined,
      settledDays: closed && v.settledDays !== '' ? v.settledDays : undefined,
      settledDate: closed ? v.settledDate || undefined : undefined,
      remarks: v.remarks,
    };
  };

  return (
    <ClaimScreen
      rows={rows}
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projectOptions}
      siteId={defaultSiteId}
      siteOptions={siteOptions}
      hindranceOptions={hindranceOptions}
      variationOptions={variationOptions}
      onCreate={async (values) => {
        // The company follows the project, never a fixed entity.
        const target = projects.find((p) => p.id === values.projectId);
        await createRecord<Claim>('claims', {
          ...formFields(values),
          companyId: target?.companyId ?? '',
          status: 'DRAFT',
          revisionNo: 0,
          createdBy: target?.projectManagerId ?? '',
          createdOn: new Date().toISOString(),
          documentNo: `UIE/CLM/2526/${String(Date.now()).slice(-4)}`,
        });
        await load();
      }}
      onUpdate={async (id, values) => {
        // Stage is user-driven here, but status, revision and created-by are not.
        await saveClaim(id, { ...formFields(values), updatedOn: new Date().toISOString() });
        await load();
      }}
    />
  );
}
