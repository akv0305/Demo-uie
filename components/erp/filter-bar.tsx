'use client';

import * as React from 'react';
import { Filter, Search, X } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { DocumentStatus } from '@/lib/data/types';
import { ALL_STATUSES } from './status-chip';
import { DateRangeField, SelectField, type Option } from './form-field';

/**
 * (2) FilterBar — company, project, date range, status and free-text filters.
 * Collapsible on mobile; shows active filter chips with clear.
 */
export interface FilterState {
  companyId?: string;
  projectId?: string;
  status?: DocumentStatus | 'ALL';
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export interface FilterBarProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
  companyOptions?: Option[];
  projectOptions?: Option[];
  showStatus?: boolean;
  showDateRange?: boolean;
  className?: string;
}

export function FilterBar({
  value,
  onChange,
  companyOptions = [],
  projectOptions = [],
  showStatus = true,
  showDateRange = true,
  className,
}: FilterBarProps) {
  const [expanded, setExpanded] = React.useState(false);

  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch });

  const statusOptions: Option[] = React.useMemo(
    () => [
      { value: 'ALL', label: t.common.all },
      ...ALL_STATUSES.map((s) => ({ value: s, label: t.status[s] })),
    ],
    [],
  );

  // Active chips, each individually clearable.
  const chips: { key: keyof FilterState; label: string }[] = [];
  if (value.companyId) {
    const found = companyOptions.find((o) => o.value === value.companyId);
    if (found) chips.push({ key: 'companyId', label: `${t.nav.company}: ${found.label}` });
  }
  if (value.projectId) {
    const found = projectOptions.find((o) => o.value === value.projectId);
    if (found) chips.push({ key: 'projectId', label: `${t.nav.project}: ${found.label}` });
  }
  if (value.status && value.status !== 'ALL') {
    chips.push({ key: 'status', label: `${t.common.status}: ${t.status[value.status]}` });
  }
  if (value.fromDate) chips.push({ key: 'fromDate', label: `${t.common.fromDate}: ${value.fromDate}` });
  if (value.toDate) chips.push({ key: 'toDate', label: `${t.common.toDate}: ${value.toDate}` });
  if (value.search) chips.push({ key: 'search', label: `${t.common.search}: ${value.search}` });

  const clearOne = (key: keyof FilterState) => {
    const next = { ...value };
    delete next[key];
    onChange(next);
  };

  return (
    <section
      aria-label={t.common.filters}
      className={cn('mb-section rounded-lg border border-border bg-surface', className)}
    >
      {/* Always-visible row: free text + mobile toggle */}
      <div className="flex items-center gap-2 p-3">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="filter-search"
            type="search"
            value={value.search ?? ''}
            onChange={(e) => set({ search: e.target.value || undefined })}
            placeholder={t.common.searchPlaceholder}
            aria-label={t.common.search}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="default"
          onClick={() => setExpanded((p) => !p)}
          aria-expanded={expanded}
          aria-controls="filter-fields"
          className="shrink-0 md:hidden"
        >
          <Filter />
          <span className="sr-only sm:not-sr-only">
            {expanded ? t.common.hideFilters : t.common.showFilters}
          </span>
        </Button>
      </div>

      {/* Filter fields: always shown from md up, toggled below md */}
      <div
        id="filter-fields"
        className={cn(
          'grid grid-cols-1 gap-3 border-t border-border p-3 sm:grid-cols-2 lg:grid-cols-4',
          expanded ? 'grid' : 'hidden md:grid',
        )}
      >
        {companyOptions.length > 0 && (
          <SelectField
            id="filter-company"
            label={t.nav.company}
            value={value.companyId}
            onChange={(v) => set({ companyId: v })}
            options={companyOptions}
          />
        )}
        {projectOptions.length > 0 && (
          <SelectField
            id="filter-project"
            label={t.nav.project}
            value={value.projectId}
            onChange={(v) => set({ projectId: v })}
            options={projectOptions}
          />
        )}
        {showStatus && (
          <SelectField
            id="filter-status"
            label={t.common.status}
            value={value.status ?? 'ALL'}
            onChange={(v) => set({ status: v as DocumentStatus | 'ALL' })}
            options={statusOptions}
          />
        )}
        {showDateRange && (
          <DateRangeField
            id="filter-date-range"
            label={t.common.dateRange}
            fromValue={value.fromDate}
            toValue={value.toDate}
            onFromChange={(v) => set({ fromDate: v || undefined })}
            onToChange={(v) => set({ toDate: v || undefined })}
          />
        )}
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border bg-surface-muted px-3 py-2">
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex max-w-full items-center gap-1 rounded-sm border border-border bg-surface px-2 py-0.5 text-xs text-foreground"
            >
              <span className="truncate">{chip.label}</span>
              <button
                type="button"
                onClick={() => clearOne(chip.key)}
                aria-label={`${t.common.clear} ${chip.label}`}
                className="shrink-0 text-muted-foreground hover:text-danger"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <Button variant="ghost" size="sm" onClick={() => onChange({})} className="h-6">
            {t.common.clearFilters}
          </Button>
        </div>
      )}
    </section>
  );
}
