'use client';

import * as React from 'react';
import type { Option } from '@/components/erp';
import { terminology as t } from '@/config/terminology.config';
import { SummaryScreen } from '@/features/inventory/summary-screen';
import { listItems, listProjects, listSites, listStoresDocuments } from '@/lib/data';
import type { Item, Project, Site } from '@/lib/data/types';
import type { LedgerInput } from '@/lib/inventory/ledger';
import { buildSummary } from '@/lib/inventory/summary';

/** Read-only register — nothing is created here, so there is no form (D-156). */
export default function Page() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectId, setProjectId] = React.useState('');
  const [sites, setSites] = React.useState<Site[]>([]);
  const [items, setItems] = React.useState<Item[]>([]);
  const [docs, setDocs] = React.useState<LedgerInput | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const [siteId, setSiteId] = React.useState('');
  const [group, setGroup] = React.useState('');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState(() => new Date().toISOString().slice(0, 10));

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
      setItems(itm.rows);
      setSites(allSites);
    })();
  }, []);

  React.useEffect(() => {
    if (!projectId) return;
    setIsLoading(true);
    void (async () => {
      try {
        setDocs(await listStoresDocuments({ projectId }));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [projectId]);

  /** Only a store holds stock, and only one belonging to the project in hand. */
  const storeOptions = React.useMemo<Option[]>(
    () =>
      sites
        .filter((s) => s.isStore && (s.projectId === projectId || s.projectId === null))
        .map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` })),
    [sites, projectId],
  );

  // A store that no longer belongs to the chosen project must not stay selected.
  React.useEffect(() => {
    if (siteId && !storeOptions.some((o) => o.value === siteId)) setSiteId('');
  }, [storeOptions, siteId]);

  /** Groups actually present in the item master, not the whole union. */
  const groupOptions = React.useMemo<Option[]>(() => {
    const present = [...new Set(items.map((i) => i.group))].sort();
    return present.map((g) => ({
      value: g,
      label: (t.masters[`grp${g}` as keyof typeof t.masters] as string) ?? g,
    }));
  }, [items]);

  const rows = React.useMemo(() => {
    if (!docs) return [];
    const built = buildSummary(docs, {
      siteId: siteId || undefined,
      itemIds: group ? items.filter((i) => i.group === group).map((i) => i.id) : undefined,
      fromDate: fromDate || undefined,
      toDate,
      items,
    });
    // Code order is how a storekeeper reads a bin card register.
    return built.sort(
      (a, b) =>
        a.itemCode.localeCompare(b.itemCode, 'en-IN', { numeric: true }) ||
        a.siteId.localeCompare(b.siteId),
    );
  }, [docs, siteId, group, fromDate, toDate, items]);

  return (
    <SummaryScreen
      rows={rows}
      isLoading={isLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
      projectOptions={projects.map((p) => ({ value: p.id, label: p.name, hint: p.code }))}
      siteId={siteId}
      onSiteChange={setSiteId}
      storeOptions={storeOptions}
      group={group}
      onGroupChange={setGroup}
      groupOptions={groupOptions}
      fromDate={fromDate}
      onFromDateChange={setFromDate}
      toDate={toDate}
      onToDateChange={setToDate}
    />
  );
}
