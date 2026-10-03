'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { LedgerScreen } from '@/features/inventory/ledger-screen';
import { buildLedger, ledgerTotals, openingBalance, allMovements } from '@/lib/inventory/ledger';
import type { LedgerInput } from '@/lib/inventory/ledger';
import { listItems, listProjects, listSites, listStoresDocuments } from '@/lib/data';
import type { LedgerSource, Project, Site } from '@/lib/data/types';

const EMPTY: LedgerInput = {
  goodsReceipts: [],
  issues: [],
  returns: [],
  transfers: [],
  adjustments: [],
};

export default function Page() {
  const [docs, setDocs] = React.useState<LedgerInput>(EMPTY);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectId, setProjectId] = React.useState('');
  const [sites, setSites] = React.useState<Site[]>([]);
  const [itemOptions, setItemOptions] = React.useState<Option[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [storeSiteId, setStoreSiteId] = React.useState('');
  const [itemId, setItemId] = React.useState('');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [source, setSource] = React.useState<LedgerSource | 'ALL'>('ALL');

  // Masters that do not depend on the selected project.
  React.useEffect(() => {
    void (async () => {
      const [list, itm, allSites] = await Promise.all([
        listProjects(),
        listItems({ pageSize: 500 }),
        listSites(),
      ]);
      setProjects(list);
      if (list.length) setProjectId((cur) => cur || list[0].id);
      setSites(allSites);
      setItemOptions(itm.rows.map((i) => ({ value: i.id, label: i.name, hint: i.code })));
    })();
  }, []);

  // The ledger has no register of its own — it reads the five that do (D-144).
  const load = React.useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      setDocs(await listStoresDocuments({ projectId }));
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const storeOptions = React.useMemo<Option[]>(
    () =>
      sites
        .filter((s) => s.isStore && (s.projectId === projectId || s.projectId === null))
        .map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` })),
    [sites, projectId],
  );

  // A balance only means something for one godown at a time (D-147).
  React.useEffect(() => {
    setStoreSiteId((cur) =>
      cur && storeOptions.some((o) => o.value === cur) ? cur : (storeOptions[0]?.value ?? ''),
    );
  }, [storeOptions]);

  const filter = React.useMemo(
    () => ({
      storeSiteId: storeSiteId || undefined,
      itemId: itemId || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      source,
    }),
    [storeSiteId, itemId, fromDate, toDate, source],
  );

  const rows = React.useMemo(
    () => (storeSiteId ? buildLedger(docs, filter) : []),
    [docs, filter, storeSiteId],
  );

  const opening = React.useMemo(
    () => (storeSiteId ? openingBalance(allMovements(docs), filter) : { quantity: 0, value: 0 }),
    [docs, filter, storeSiteId],
  );

  const totals = React.useMemo(() => ledgerTotals(rows, opening), [rows, opening]);

  return (
    <LedgerScreen
      rows={rows}
      opening={opening}
      totals={totals}
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projects.map((p) => ({ value: p.id, label: p.name, hint: p.code }))}
      storeSiteId={storeSiteId}
      onStoreChange={setStoreSiteId}
      storeOptions={storeOptions}
      itemId={itemId}
      onItemChange={setItemId}
      itemOptions={itemOptions}
      fromDate={fromDate}
      onFromDateChange={setFromDate}
      toDate={toDate}
      onToDateChange={setToDate}
      source={source}
      onSourceChange={setSource}
    />
  );
}
