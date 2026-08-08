/**
 * Generic localStorage-backed store so records created during the demo persist
 * across navigation and page reload within the browser.
 *
 * Deliberately generic: create / update / remove / list by entity key.
 * NO business rules live here.
 */

const PREFIX = 'erp.store.';

export interface StoredRecord {
  id: string;
  [key: string]: unknown;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function read<T extends StoredRecord>(entityKey: string): T[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(PREFIX + entityKey);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function write<T extends StoredRecord>(entityKey: string, rows: T[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PREFIX + entityKey, JSON.stringify(rows));
    window.dispatchEvent(new CustomEvent('erp:store-changed', { detail: { entityKey } }));
  } catch {
    // Storage full or unavailable — the demo continues with in-memory data only.
  }
}

function newId(entityKey: string): string {
  return `${entityKey.toUpperCase()}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export const store = {
  list<T extends StoredRecord>(entityKey: string): T[] {
    return read<T>(entityKey);
  },

  get<T extends StoredRecord>(entityKey: string, id: string): T | undefined {
    return read<T>(entityKey).find((r) => r.id === id);
  },

  create<T extends StoredRecord>(entityKey: string, record: Omit<T, 'id'> & { id?: string }): T {
    const rows = read<T>(entityKey);
    const created = { ...record, id: record.id ?? newId(entityKey) } as T;
    write(entityKey, [created, ...rows]);
    return created;
  },

  update<T extends StoredRecord>(entityKey: string, id: string, patch: Partial<T>): T | undefined {
    const rows = read<T>(entityKey);
    const index = rows.findIndex((r) => r.id === id);
    if (index === -1) return undefined;
    const updated = { ...rows[index], ...patch, id } as T;
    rows[index] = updated;
    write(entityKey, rows);
    return updated;
  },

  remove(entityKey: string, id: string): boolean {
    const rows = read(entityKey);
    const next = rows.filter((r) => r.id !== id);
    if (next.length === rows.length) return false;
    write(entityKey, next);
    return true;
  },

  clear(entityKey: string): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(PREFIX + entityKey);
    window.dispatchEvent(new CustomEvent('erp:store-changed', { detail: { entityKey } }));
  },

  /** Simple key/value slot for UI preferences such as the selected context. */
  getPreference<T>(key: string, fallback: T): T {
    if (!isBrowser()) return fallback;
    try {
      const raw = window.localStorage.getItem(PREFIX + 'pref.' + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },

  setPreference<T>(key: string, value: T): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(PREFIX + 'pref.' + key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },
};

export default store;
