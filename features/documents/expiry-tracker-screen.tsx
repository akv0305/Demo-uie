'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { DataTable, KpiCard, PageHeader, SelectField, type Option } from '@/components/erp';
import type { Attachment } from '@/lib/data/types';
import { expiryState } from '@/lib/documents/attachments';
import { expiryColumns } from './document-columns';

export interface ExpiryTrackerScreenProps {
  rows: Attachment[];
  /** Every tracked document, for the KPI counts — not just the filtered view. */
  allTracked: Attachment[];
  isLoading: boolean;
  withinDays: string;
  onWithinDaysChange: (v: string) => void;
  linkedLabel: (row: Attachment) => string;
}

export function ExpiryTrackerScreen({
  rows,
  allTracked,
  isLoading,
  withinDays,
  onWithinDaysChange,
  linkedLabel,
}: ExpiryTrackerScreenProps) {
  const columns = React.useMemo(() => expiryColumns(linkedLabel), [linkedLabel]);

  const counts = React.useMemo(() => {
    let expired = 0;
    let dueSoon = 0;
    let valid = 0;
    allTracked.forEach((a) => {
      const s = expiryState(a.expiryDate);
      if (s === 'EXPIRED') expired += 1;
      else if (s === 'DUE_SOON') dueSoon += 1;
      else if (s === 'VALID') valid += 1;
    });
    return { expired, dueSoon, valid, total: allTracked.length };
  }, [allTracked]);

  const windowOptions: Option[] = [
    { value: '30', label: t.documents.days30 },
    { value: '60', label: t.documents.days60 },
    { value: '90', label: t.documents.days90 },
  ];

  return (
    <>
      <PageHeader
        title={t.documents.expiryTracker}
        subtitle={t.documents.expirySubtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/home' },
          { label: t.nav.groupDocuments },
        ]}
        helpTopic="documentExpiry"
        secondaryActions={[{ label: t.documents.goToLibrary, href: '/documents/library' }]}
      />

      <section className="mb-section grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t.documents.kpiTracked}
          value={String(counts.total)}
          comparison={t.documents.trackedHint}
        />
        <KpiCard label={t.documents.kpiExpired} value={String(counts.expired)} />
        <KpiCard label={t.documents.kpiDueSoon} value={String(counts.dueSoon)} />
        <KpiCard label={t.documents.kpiValid} value={String(counts.valid)} />
      </section>

      <section className="mb-section flex flex-col gap-2 rounded-lg border border-border bg-surface p-card sm:flex-row sm:items-end">
        <SelectField
          id="expiry-window"
          label={t.documents.withinDays}
          value={withinDays}
          onChange={onWithinDaysChange}
          options={windowOptions}
          className="w-full sm:w-44"
        />
      </section>

      <DataTable<Attachment>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        emptyHeadline={t.documents.expiryEmpty}
        emptyDescription={t.documents.expiryEmptyHint}
        cardTitle={(r) => r.fileName}
        cardSubtitle={(r) => linkedLabel(r)}
      />
    </>
  );
}

export default ExpiryTrackerScreen;
