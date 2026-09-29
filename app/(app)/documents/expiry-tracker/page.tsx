'use client';

import * as React from 'react';
import { ExpiryTrackerScreen } from '@/features/documents/expiry-tracker-screen';
import {
  listCompanies,
  listEmployees,
  listEquipment,
  listExpiringAttachments,
  listProjects,
  listSubcontractors,
  listVendors,
} from '@/lib/data';
import type { Attachment } from '@/lib/data/types';
import { daysToExpiry, sortByExpiry } from '@/lib/documents/attachments';

export default function Page() {
  const [tracked, setTracked] = React.useState<Attachment[]>([]);
  const [names, setNames] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [withinDays, setWithinDays] = React.useState('30');

  const load = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // 3650 days = every document that carries an expiry date.
      // The window selector filters this list client-side below.
      const [files, vendors, subs, equipment, employees, projects, companies] = await Promise.all([
        listExpiringAttachments(3650),
        listVendors({ pageSize: 500 }),
        listSubcontractors({ pageSize: 500 }),
        listEquipment({ pageSize: 500 }),
        listEmployees({ pageSize: 500 }),
        listProjects(),
        listCompanies(),
      ]);

      // entityKey:entityId -> display name. Ids must never reach the screen (R1).
      const map: Record<string, string> = {};
      vendors.rows.forEach((v) => (map[`vendors:${v.id}`] = v.name));
      subs.rows.forEach((s) => (map[`subcontractors:${s.id}`] = s.name));
      equipment.rows.forEach((e) => (map[`equipment:${e.id}`] = `${e.code} — ${e.name}`));
      employees.rows.forEach((e) => (map[`employees:${e.id}`] = e.name));
      projects.forEach((p) => (map[`projects:${p.id}`] = p.name));
      companies.forEach((c) => (map[`companies:${c.id}`] = c.name));

      setNames(map);
      setTracked(files);
    } catch (err) {
      // Temporary during bring-up — replace with ErrorState (DEF-039).
      console.error('[expiry-tracker] load failed', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const linkedLabel = React.useCallback(
    (row: Attachment) => names[`${row.entityKey}:${row.entityId}`] ?? row.entityId,
    [names],
  );

  const limit = Number(withinDays);

  // Expired rows always stay visible regardless of the window — they need action now.
  const visible = React.useMemo(
    () =>
      sortByExpiry(
        tracked.filter((a) => {
          const d = daysToExpiry(a.expiryDate);
          return d !== null && d <= limit;
        }),
      ),
    [tracked, limit],
  );

  return (
    <ExpiryTrackerScreen
      rows={visible}
      allTracked={tracked}
      isLoading={isLoading}
      withinDays={withinDays}
      onWithinDaysChange={setWithinDays}
      linkedLabel={linkedLabel}
    />
  );
}
