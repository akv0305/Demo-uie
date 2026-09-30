'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { BgRetentionScreen } from '@/features/project-controls/bg-retention-screen';
import type { BgFormValues } from '@/features/project-controls/bg-schema';
import {
  createRecord,
  listBankGuarantees,
  listProjects,
  listRetentionEntries,
  listSites,
  saveBankGuarantee,
} from '@/lib/data';
import type { BankGuarantee, Project, RetentionEntry } from '@/lib/data/types';

/** Form values to stored fields. Empty strings become absent, not zero. */
function formFields(v: BgFormValues) {
  return {
    projectId: v.projectId,
    siteId: v.siteId,
    bgNumber: v.bgNumber,
    date: v.date,
    type: v.type,
    bgStatus: v.bgStatus,
    bankName: v.bankName,
    branch: v.branch || undefined,
    beneficiary: v.beneficiary,
    amount: v.amount,
    validUpto: v.validUpto,
    claimPeriodUpto: v.claimPeriodUpto || undefined,
    marginPct: v.marginPct === '' ? undefined : v.marginPct,
    marginAmount: v.marginAmount === '' ? undefined : v.marginAmount,
    fdrNo: v.fdrNo || undefined,
    commissionPct: v.commissionPct === '' ? undefined : v.commissionPct,
    purpose: v.purpose || undefined,
    releasedOn: v.releasedOn || undefined,
    remarks: v.remarks || undefined,
  };
}

export default function Page() {
  const [guarantees, setGuarantees] = React.useState<BankGuarantee[]>([]);
  const [retention, setRetention] = React.useState<RetentionEntry[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectId, setProjectId] = React.useState('');
  const [siteOptions, setSiteOptions] = React.useState<Option[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      try {
        const list = await listProjects();
        setProjects(list);
        if (list.length) setProjectId((cur) => cur || list[0].id);
      } catch (err) {
        console.error('[bg-retention] projects failed', err);
        setIsLoading(false);
      }
    })();
  }, []);

  const load = React.useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [bgs, ret, sites] = await Promise.all([
        listBankGuarantees({ projectId, pageSize: 500 }),
        listRetentionEntries({ projectId }),
        listSites({ projectId }),
      ]);
      setGuarantees(bgs.rows);
      setRetention(ret);
      setSiteOptions(sites.map((s) => ({ value: s.id, label: s.name })));
    } catch (err) {
      console.error('[bg-retention] load failed', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const target = projects.find((p) => p.id === projectId) ?? null;
  const defaultSiteId = siteOptions[0]?.value ?? '';

  const projectOptions: Option[] = projects.map((p) => ({
    value: p.id,
    label: `${p.code} — ${p.name}`,
  }));

  return (
    <BgRetentionScreen
      guarantees={guarantees}
      retention={retention}
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projectOptions}
      siteId={defaultSiteId}
      siteOptions={siteOptions}
      onCreate={async (values) => {
        // Company follows the selected project, never a hard-coded entity.
        await createRecord<BankGuarantee>('bankGuarantees', {
          ...formFields(values),
          companyId: target?.companyId ?? '',
          status: 'DRAFT',
          revisionNo: 0,
          createdBy: target?.projectManagerId ?? '',
          createdOn: new Date().toISOString(),
          documentNo: `UIE/BG/2526/${String(Date.now()).slice(-4)}`,
        });
        await load();
      }}
      onUpdate={async (id, values) => {
        // bgStatus is user-driven; approval status, revision and created-by are not.
        await saveBankGuarantee(id, { ...formFields(values), updatedOn: new Date().toISOString() });
        await load();
      }}
    />
  );
}
