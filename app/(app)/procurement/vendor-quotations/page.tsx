'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { QuotationScreen } from '@/features/procurement/quotation-screen';
import type { QuotationFormValues } from '@/features/procurement/quotation-schema';
import {
  createRecord,
  listProjects,
  listQuotations,
  listRfqs,
  listSites,
  listVendors,
  saveQuotation,
} from '@/lib/data';
import type { Project, Quotation, QuotationLine, Rfq } from '@/lib/data/types';

export default function Page() {
  const [rows, setRows] = React.useState<Quotation[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectId, setProjectId] = React.useState('');
  const [siteOptions, setSiteOptions] = React.useState<Option[]>([]);
  const [vendorOptions, setVendorOptions] = React.useState<Option[]>([]);
  const [rfqs, setRfqs] = React.useState<Rfq[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      try {
        const [list, ven] = await Promise.all([listProjects(), listVendors({ pageSize: 200 })]);
        setProjects(list);
        if (list.length) setProjectId((cur) => cur || list[0].id);
        setVendorOptions(
          ven.rows.filter((v) => v.isActive).map((v) => ({ value: v.id, label: v.name, hint: v.code })),
        );
      } catch (err) {
        console.error('[quotation] reference data failed', err);
        setIsLoading(false);
      }
    })();
  }, []);

  const load = React.useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [qtn, sites, rfq] = await Promise.all([
        listQuotations({ projectId, pageSize: 500 }),
        listSites(),
        listRfqs({ projectId, pageSize: 500 }),
      ]);
      setRows(qtn.rows);
      setRfqs(rfq.rows);
      setSiteOptions(
        sites
          .filter((s) => s.projectId === projectId)
          .map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` })),
      );
    } catch (err) {
      console.error('[quotation] load failed', err);
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
  const formFields = (v: QuotationFormValues, lines: QuotationLine[]) => ({
    projectId: v.projectId,
    siteId: v.siteId || defaultSiteId,
    rfqId: v.rfqId,
    vendorId: v.vendorId,
    vendorName: vendorOptions.find((o) => o.value === v.vendorId)?.label ?? '',
    date: v.date,
    vendorRefNo: v.vendorRefNo,
    vendorRefDate: v.vendorRefDate || undefined,
    validUntil: v.validUntil || undefined,
    receivedOn: v.receivedOn || undefined,
    paymentTerms: v.paymentTerms,
    deliveryPeriodDays: v.deliveryPeriodDays === '' ? undefined : v.deliveryPeriodDays,
    warrantyTerms: v.warrantyTerms,
    isTechnicallyQualified:
      v.isTechnicallyQualified === 'YES' ? true : v.isTechnicallyQualified === 'NO' ? false : undefined,
    deviations: v.deviations,
    remarks: v.remarks,
    lines,
    charges: {
      freightBasis: v.freightBasis,
      freightAmount: v.freightAmount === '' ? undefined : v.freightAmount,
      loadingBasis: v.loadingBasis,
      loadingAmount: v.loadingAmount === '' ? undefined : v.loadingAmount,
      packingBasis: v.packingBasis,
      packingAmount: v.packingAmount === '' ? undefined : v.packingAmount,
      chargesGstRate: v.chargesGstRate === '' ? undefined : v.chargesGstRate,
    },
  });

  return (
    <QuotationScreen
      rows={rows}
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projectOptions}
      siteId={defaultSiteId}
      siteOptions={siteOptions}
      rfqs={rfqs}
      vendorOptions={vendorOptions}
      onCreate={async (values, lines) => {
        const target = projects.find((p) => p.id === values.projectId);
        await createRecord<Quotation>('quotations', {
          ...formFields(values, lines),
          companyId: target?.companyId ?? '',
          status: 'SUBMITTED',
          revisionNo: 0,
          createdBy: target?.projectManagerId ?? '',
          createdOn: new Date().toISOString(),
          documentNo: `UIE/QTN/2526/${String(Date.now()).slice(-4)}`,
        });
        await load();
      }}
      onUpdate={async (id, values, lines) => {
        await saveQuotation(id, { ...formFields(values, lines), updatedOn: new Date().toISOString() });
        await load();
      }}
    />
  );
}
