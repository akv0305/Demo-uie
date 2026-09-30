'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { RfqScreen } from '@/features/procurement/rfq-screen';
import type { RfqFormValues } from '@/features/procurement/rfq-schema';
import {
  createRecord,
  listItems,
  listProjects,
  listPurchaseRequisitions,
  listRfqs,
  listSites,
  listVendors,
  listWbsNodes,
  listEmployees,
  saveRfq,
} from '@/lib/data';
import type {
  Project,
  PurchaseRequisition,
  Rfq,
  RfqLine,
  RfqVendor,
  Vendor,
} from '@/lib/data/types';
import { isAwaitingOrder } from '@/lib/procurement/requisition';

export default function Page() {
  const [rows, setRows] = React.useState<Rfq[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectId, setProjectId] = React.useState('');
  const [siteOptions, setSiteOptions] = React.useState<Option[]>([]);
  const [itemOptions, setItemOptions] = React.useState<
    (Option & { uomCode?: string; gstRate?: number })[]
  >([]);
  const [wbsOptions, setWbsOptions] = React.useState<Option[]>([]);
  const [employeeOptions, setEmployeeOptions] = React.useState<Option[]>([]);
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [openPrs, setOpenPrs] = React.useState<PurchaseRequisition[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      try {
        const [list, itm, ven] = await Promise.all([listProjects(), listItems({ pageSize: 500 }), listVendors({ pageSize: 200 })]);
        setProjects(list);
        if (list.length) setProjectId((cur) => cur || list[0].id);
        setItemOptions(
          itm.rows.map((i) => ({
            value: i.id,
            label: i.name,
            hint: i.code,
            uomCode: i.stockUomCode,
            gstRate: i.gstRate,
          })),
        );
        setVendors(ven.rows.filter((v) => v.isActive));
      } catch (err) {
        console.error('[rfq] reference data failed', err);
        setIsLoading(false);
      }
    })();
  }, []);

  const load = React.useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [rfq, sites, wbs, emp, prs] = await Promise.all([
        listRfqs({ projectId, pageSize: 500 }),
        listSites(),
        listWbsNodes(projectId),
        listEmployees({ pageSize: 500 }),
        listPurchaseRequisitions({ projectId, pageSize: 500 }),
      ]);
      setRows(rfq.rows);
      setSiteOptions(
        sites
          .filter((s) => s.projectId === projectId)
          .map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` })),
      );
      setWbsOptions(wbs.map((w) => ({ value: w.code, label: `${w.code} — ${w.name}` })));
      setEmployeeOptions(
        emp.rows.map((e) => ({ value: e.id, label: `${e.name} — ${e.designation}` })),
      );
      setOpenPrs(prs.rows.filter(isAwaitingOrder));
    } catch (err) {
      console.error('[rfq] load failed', err);
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
  const formFields = (v: RfqFormValues, lines: RfqLine[], invited: RfqVendor[]) => ({
    projectId: v.projectId,
    siteId: v.siteId || defaultSiteId,
    date: v.date,
    title: v.title,
    dueDate: v.dueDate,
    quoteValidityDays: v.quoteValidityDays === '' ? undefined : v.quoteValidityDays,
    deliveryLocationSiteId: v.deliveryLocationSiteId || undefined,
    deliverySchedule: v.deliverySchedule,
    paymentTermsExpected: v.paymentTermsExpected,
    freightTerms: v.freightTerms,
    inspectionRequired: v.inspectionRequired,
    scopeNotes: v.scopeNotes,
    remarks: v.remarks,
    preparedBy: v.preparedBy || undefined,
    lines,
    vendors: invited,
    prIds: Array.from(new Set(lines.map((l) => l.prId).filter(Boolean))) as string[],
  });

  return (
    <RfqScreen
      rows={rows}
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projectOptions}
      siteId={defaultSiteId}
      siteOptions={siteOptions}
      itemOptions={itemOptions}
      wbsOptions={wbsOptions}
      employeeOptions={employeeOptions}
      vendors={vendors}
      openPrs={openPrs}
      onCreate={async (values, lines, invited) => {
        // The company follows the project, never a fixed entity.
        const target = projects.find((p) => p.id === values.projectId);
        await createRecord<Rfq>('rfqs', {
          ...formFields(values, lines, invited),
          companyId: target?.companyId ?? '',
          status: 'DRAFT',
          revisionNo: 0,
          createdBy: values.preparedBy || (target?.projectManagerId ?? ''),
          createdOn: new Date().toISOString(),
          documentNo: `UIE/RFQ/2526/${String(Date.now()).slice(-4)}`,
        });
        await load();
      }}
      onUpdate={async (id, values, lines, invited) => {
        await saveRfq(id, { ...formFields(values, lines, invited), updatedOn: new Date().toISOString() });
        await load();
      }}
    />
  );
}
