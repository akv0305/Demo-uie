'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { PoScreen } from '@/features/procurement/po-screen';
import type { PoFormValues } from '@/features/procurement/po-schema';
import {
  createRecord,
  listItems,
  listProjects,
  listPurchaseOrders,
  listQuotations,
  listSites,
  listVendors,
  listWbsNodes,
  savePurchaseOrder,
} from '@/lib/data';
import type { PoLine, Project, PurchaseOrder, Quotation } from '@/lib/data/types';

export default function Page() {
  const [rows, setRows] = React.useState<PurchaseOrder[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectId, setProjectId] = React.useState('');
  const [siteOptions, setSiteOptions] = React.useState<Option[]>([]);
  const [itemOptions, setItemOptions] = React.useState<
    (Option & { uomCode?: string; gstRate?: number })[]
  >([]);
  const [wbsOptions, setWbsOptions] = React.useState<Option[]>([]);
  const [vendorOptions, setVendorOptions] = React.useState<Option[]>([]);
  const [quotations, setQuotations] = React.useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      try {
        const [list, itm, ven] = await Promise.all([
          listProjects(),
          listItems({ pageSize: 500 }),
          listVendors({ pageSize: 200 }),
        ]);
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
        setVendorOptions(
          ven.rows.filter((v) => v.isActive).map((v) => ({ value: v.id, label: v.name, hint: v.code })),
        );
      } catch (err) {
        console.error('[po] reference data failed', err);
        setIsLoading(false);
      }
    })();
  }, []);

  const load = React.useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [po, sites, wbs, qtn] = await Promise.all([
        listPurchaseOrders({ projectId, pageSize: 500 }),
        listSites(),
        listWbsNodes(projectId),
        listQuotations({ projectId, pageSize: 500 }),
      ]);
      setRows(po.rows);
      setQuotations(qtn.rows);
      setSiteOptions(
        sites
          .filter((s) => s.projectId === projectId)
          .map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` })),
      );
      setWbsOptions(wbs.map((w) => ({ value: w.code, label: `${w.code} — ${w.name}` })));
    } catch (err) {
      console.error('[po] load failed', err);
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
  const formFields = (v: PoFormValues, lines: PoLine[]) => ({
    projectId: v.projectId,
    siteId: v.siteId || defaultSiteId,
    date: v.date,
    vendorId: v.vendorId,
    vendorName: vendorOptions.find((o) => o.value === v.vendorId)?.label ?? '',
    basis: v.basis,
    quotationId: v.quotationId || undefined,
    rfqId: quotations.find((q) => q.id === v.quotationId)?.rfqId,
    prIds: Array.from(new Set(lines.map((l) => l.prId).filter(Boolean))) as string[],
    deliveryTerms: v.deliveryTerms,
    deliverySiteId: v.deliverySiteId,
    deliveryAddress: v.deliveryAddress,
    deliveryByDate: v.deliveryByDate || undefined,
    paymentTerms: v.paymentTerms,
    warrantyTerms: v.warrantyTerms,
    advanceAmount: v.advanceAmount === '' ? undefined : v.advanceAmount,
    retentionPct: v.retentionPct === '' ? undefined : v.retentionPct,
    ldClause: v.ldClause,
    awardJustification: v.awardJustification,
    inspectionRequired: v.inspectionRequired,
    amendmentReason: v.amendmentReason || undefined,
    remarks: v.remarks,
    lines,
    charges: {
      freightAmount: v.freightAmount === '' ? undefined : v.freightAmount,
      loadingAmount: v.loadingAmount === '' ? undefined : v.loadingAmount,
      packingAmount: v.packingAmount === '' ? undefined : v.packingAmount,
      chargesGstRate: v.chargesGstRate === '' ? undefined : v.chargesGstRate,
    },
  });

  return (
    <PoScreen
      rows={rows}
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projectOptions}
      siteId={defaultSiteId}
      siteOptions={siteOptions}
      itemOptions={itemOptions}
      wbsOptions={wbsOptions}
      vendorOptions={vendorOptions}
      quotations={quotations}
      onCreate={async (values, lines) => {
        const target = projects.find((p) => p.id === values.projectId);
        await createRecord<PurchaseOrder>('purchaseOrders', {
          ...formFields(values, lines),
          companyId: target?.companyId ?? '',
          status: 'DRAFT',
          revisionNo: 0,
          createdBy: target?.projectManagerId ?? '',
          createdOn: new Date().toISOString(),
          documentNo: `UIE/PO/2526/${String(Date.now()).slice(-4)}`,
        });
        await load();
      }}
      onUpdate={async (id, values, lines) => {
        // An amendment reason bumps the amendment number.
        const current = rows.find((p) => p.id === id);
        const isAmendment = !!values.amendmentReason?.trim() && values.amendmentReason !== current?.amendmentReason;
        await savePurchaseOrder(id, {
          ...formFields(values, lines),
          amendmentNo: isAmendment ? (current?.amendmentNo ?? 0) + 1 : current?.amendmentNo,
          updatedOn: new Date().toISOString(),
        });
        await load();
      }}
    />
  );
}
