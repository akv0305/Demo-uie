'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { GrnScreen } from '@/features/inventory/grn-screen';
import type { GrnFormValues } from '@/features/inventory/grn-schema';
import { postToPo } from '@/lib/inventory/grn';
import {
  createRecord,
  listEmployees,
  listGoodsReceipts,
  listItems,
  listProjects,
  listPurchaseOrders,
  listSites,
  saveGoodsReceipt,
  savePurchaseOrder,
} from '@/lib/data';
import type {
  GoodsReceipt,
  GoodsReceiptLine,
  Project,
  PurchaseOrder,
} from '@/lib/data/types';

export default function Page() {
  const [rows, setRows] = React.useState<GoodsReceipt[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectId, setProjectId] = React.useState('');
  const [siteId, setSiteId] = React.useState('');
  const [siteOptions, setSiteOptions] = React.useState<Option[]>([]);
  const [itemOptions, setItemOptions] = React.useState<
    (Option & { uomCode?: string; gstRate?: number })[]
  >([]);
  const [employeeOptions, setEmployeeOptions] = React.useState<Option[]>([]);
  const [purchaseOrders, setPurchaseOrders] = React.useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Masters that do not depend on the selected project.
  React.useEffect(() => {
    void (async () => {
      const [list, itm] = await Promise.all([listProjects(), listItems({ pageSize: 500 })]);
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
    })();
  }, []);

  const load = React.useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [grns, pos, sites, emps] = await Promise.all([
        listGoodsReceipts({ projectId, pageSize: 500 }),
        listPurchaseOrders({ projectId, pageSize: 500 }),
        listSites(),
        listEmployees({ projectId, pageSize: 200 }),
      ]);
      setRows(grns.rows);
      // Only approved orders with material still outstanding can be received.
      setPurchaseOrders(
        pos.rows.filter(
          (p) =>
            p.status === 'APPROVED' &&
            p.lines.some((l) => l.quantity - (l.receivedQty ?? 0) > 0),
        ),
      );
      const opts = sites
        .filter((s) => s.projectId === projectId)
        .map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` }));
      setSiteOptions(opts);
      setSiteId((cur) => cur || opts[0]?.value || '');
      setEmployeeOptions(
        emps.rows.map((e) => ({ value: e.id, label: e.name, hint: e.designation })),
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  /** Empty strings from the form mean "not entered", not "blank value". */
  const clean = <T extends Record<string, unknown>>(v: T): T =>
    Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x === '' ? undefined : x])) as T;

  /** Only the fields the form owns. Audit fields are never written from here. */
  const formFields = (v: GrnFormValues, lines: GoodsReceiptLine[]) => {
    const po = purchaseOrders.find((p) => p.id === v.poId);
    const againstPo = v.grnType === 'AGAINST_PO';
    return {
      ...clean(v),
      projectId,
      siteId: v.storeSiteId || siteId,
      // D-119/D-120: the order link exists only for a receipt against a PO.
      poId: againstPo ? v.poId || undefined : undefined,
      poDocumentNo: againstPo ? po?.documentNo : undefined,
      vendorId: v.vendorId || po?.vendorId || undefined,
      vendorName: po?.vendorName,
      lines,
    };
  };

  /** D-115 — the receipt is the only writer of PoLine.receivedQty. */
  const postBackToPo = async (values: GrnFormValues, receipt: GoodsReceipt) => {
    if (values.grnType !== 'AGAINST_PO' || !values.poId) return;
    const po = purchaseOrders.find((p) => p.id === values.poId);
    if (po) await savePurchaseOrder(po.id, postToPo(po, receipt));
  };

  return (
    <GrnScreen
      rows={rows}
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projects.map((p) => ({ value: p.id, label: p.name, hint: p.code }))}
      siteId={siteId}
      siteOptions={siteOptions}
      storeOptions={siteOptions}
      itemOptions={itemOptions}
      employeeOptions={employeeOptions}
      purchaseOrders={purchaseOrders}
      onCreate={async (values, lines) => {
        const draft = {
          ...formFields(values, lines),
          companyId: projects.find((p) => p.id === projectId)?.companyId ?? '',
          status: 'DRAFT' as const,
          revisionNo: 0,
          createdBy: values.receivedBy,
          createdOn: new Date().toISOString(),
          documentNo: `UIE/GRN/2526/${String(rows.length + 1).padStart(4, '0')}`,
        };
        await createRecord<GoodsReceipt>('goodsReceipts', draft);
        // postToPo reads only g.lines, so the unassigned id is immaterial.
        await postBackToPo(values, { ...draft, id: '' } as GoodsReceipt);
        await load();
      }}
      onUpdate={async (id, values, lines) => {
        const patch = { ...formFields(values, lines), updatedOn: new Date().toISOString() };
        await saveGoodsReceipt(id, patch);
        await postBackToPo(values, { ...patch, id } as GoodsReceipt);
        await load();
      }}
    />
  );
}
