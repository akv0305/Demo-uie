'use client';

import * as React from 'react';
import { createRecord, listRecords, updateRecord } from '@/lib/data';

/** Minimum shape a master row must have to use this hook. */
export interface MasterRow {
  id: string;
  isActive?: boolean;
}

/** Edits to fixture rows are stored as patch records (D-023). */
interface PatchRecord<T> {
  id: string;
  targetId: string;
  patch: Partial<T>;
}

const DEMO_USER = 'Demo User';
const today = () => new Date().toISOString().slice(0, 10);

export interface UseMasterCollectionOptions<T extends MasterRow, F> {
  /** Store key for locally created rows. Patches use `${entityKey}.patch`. */
  entityKey: string;
  /** Reads the fixture rows. Need not be memoised — held in a ref. */
  fetchFixtures: () => Promise<T[]>;
  /** Form values to domain shape. */
  toDomain: (values: F) => Omit<T, 'id'>;
}

/**
 * Shared master-record collection: fixtures + locally created rows + patches
 * over fixture rows, with create / update / toggle-active writes.
 *
 * Returns every row. Screen-specific search and filters stay in the container.
 */
export function useMasterCollection<T extends MasterRow, F>({
  entityKey,
  fetchFixtures,
  toDomain,
}: UseMasterCollectionOptions<T, F>) {
  const [fixtureRows, setFixtureRows] = React.useState<T[]>([]);
  const [localRows, setLocalRows] = React.useState<T[]>([]);
  const [overrides, setOverrides] = React.useState<Record<string, Partial<T>>>({});
  const [isLoading, setIsLoading] = React.useState(true);

  const patchKey = `${entityKey}.patch`;

  // Refs so callers may pass inline arrows without retriggering the effect.
  const fetchRef = React.useRef(fetchFixtures);
  fetchRef.current = fetchFixtures;
  const toDomainRef = React.useRef(toDomain);
  toDomainRef.current = toDomain;

  const reload = React.useCallback(async () => {
    const [fx, created, patches] = await Promise.all([
      fetchRef.current(),
      listRecords<T>(entityKey),
      listRecords<PatchRecord<T>>(patchKey),
    ]);
    setFixtureRows(fx);
    setLocalRows(created);
    setOverrides(Object.fromEntries(patches.map((p) => [p.targetId, p.patch])));
    setIsLoading(false);
  }, [entityKey, patchKey]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const rows = React.useMemo(() => {
    const all = [...localRows, ...fixtureRows.filter((f) => !localRows.some((l) => l.id === f.id))];
    return all.map((r) => ({ ...r, ...(overrides[r.id] ?? {}) }));
  }, [fixtureRows, localRows, overrides]);

  const isLocal = React.useCallback(
    (id: string) => localRows.some((r) => r.id === id),
    [localRows],
  );

  /**
   * Upsert a patch over a fixture row. Merges into any existing patch — an
   * earlier field edit must survive a later status toggle.
   */
  const writePatch = React.useCallback(
    async (targetId: string, values: Partial<T>) => {
      const existing = await listRecords<PatchRecord<T>>(patchKey);
      const hit = existing.find((p) => p.targetId === targetId);
      if (hit) {
        await updateRecord<PatchRecord<T>>(patchKey, hit.id, {
          patch: { ...hit.patch, ...values },
        });
      } else {
        await createRecord<PatchRecord<T>>(patchKey, { targetId, patch: values });
      }
    },
    [patchKey],
  );

  const create = React.useCallback(
    async (values: F) => {
      await createRecord<T>(entityKey, {
        ...toDomainRef.current(values),
        createdBy: DEMO_USER,
        createdOn: today(),
      } as Omit<T, 'id'>);
      await reload();
    },
    [entityKey, reload],
  );

  const update = React.useCallback(
    async (id: string, values: F) => {
      const next = {
        ...toDomainRef.current(values),
        updatedBy: DEMO_USER,
        updatedOn: today(),
      } as Partial<T>;
      if (isLocal(id)) await updateRecord<T>(entityKey, id, next);
      else await writePatch(id, next);
      await reload();
    },
    [entityKey, isLocal, reload, writePatch],
  );

  const toggleActive = React.useCallback(
    async (row: T) => {
      const next = {
        isActive: !(row.isActive ?? true),
        updatedBy: DEMO_USER,
        updatedOn: today(),
      } as Partial<T>;
      if (isLocal(row.id)) await updateRecord<T>(entityKey, row.id, next);
      else await writePatch(row.id, next);
      await reload();
    },
    [entityKey, isLocal, reload, writePatch],
  );

  return { rows, isLoading, reload, create, update, toggleActive, isLocal };
}
