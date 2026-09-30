'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import {
  DataTable,
  EmptyState,
  KpiCard,
  PageHeader,
  SearchableSelectField,
  SelectField,
  type Option,
} from '@/components/erp';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatAmount, formatDate } from '@/lib/format';
import type { ComparisonResult, VendorColumn } from '@/lib/procurement/comparison';
import { estimateVariancePct } from '@/lib/procurement/comparison';
import { comparisonColumns } from './comparison-columns';

export interface ComparisonScreenProps {
  isLoading: boolean;
  projectId: string;
  onProjectChange: (v: string) => void;
  projectOptions: Option[];
  rfqId: string;
  onRfqChange: (v: string) => void;
  rfqOptions: Option[];
  comparison: ComparisonResult;
}

/** Rank badge — L1, L2, L3, then plain numerals. */
function rankLabel(rank: number): string {
  if (rank === 1) return t.procurement.cstL1;
  if (rank === 2) return t.procurement.cstL2;
  if (rank === 3) return t.procurement.cstL3;
  return `L${rank}`;
}

function VendorSummaryCard({ v }: { v: VendorColumn }) {
  return (
    <Card className="flex flex-col gap-2 p-card">
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-foreground">{v.vendorName}</span>
          <span className="block text-xs text-muted-foreground">{v.documentNo}</span>
        </span>
        {v.rank ? (
          <Badge variant={v.rank === 1 ? 'success' : 'secondary'}>{rankLabel(v.rank)}</Badge>
        ) : (
          <Badge variant="outline">{t.procurement.cstUnranked}</Badge>
        )}
      </div>

      <dl className="flex flex-col gap-1 border-t border-border pt-2 text-xs">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">{t.procurement.cstBasicValue}</dt>
          <dd className="num text-foreground">{formatAmount(v.basicValue)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">{t.procurement.cstCharges}</dt>
          <dd className="num text-foreground">{formatAmount(v.charges)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">{t.procurement.cstTax}</dt>
          <dd className="num text-foreground">{formatAmount(v.tax)}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-1">
          <dt className="font-medium text-foreground">{t.procurement.cstLandedValue}</dt>
          <dd className="num font-heading text-foreground">{formatAmount(v.landedValue)}</dd>
        </div>
      </dl>

      <dl className="flex flex-col gap-1 border-t border-border pt-2 text-xs text-muted-foreground">
        {v.deliveryPeriodDays !== undefined && (
          <div className="flex justify-between">
            <dt>{t.procurement.cstDelivery}</dt>
            <dd className="num">{v.deliveryPeriodDays}</dd>
          </div>
        )}
        {v.paymentTerms && (
          <div className="flex flex-col">
            <dt>{t.procurement.cstPayment}</dt>
            <dd className="text-foreground">{v.paymentTerms}</dd>
          </div>
        )}
        {v.validUntil && (
          <div className="flex justify-between">
            <dt>{t.procurement.cstValidity}</dt>
            <dd className={v.isExpired ? 'text-danger' : 'text-foreground'}>
              {formatDate(v.validUntil)}
            </dd>
          </div>
        )}
        {v.deviations && (
          <div className="flex flex-col">
            <dt>{t.procurement.cstDeviations}</dt>
            <dd className="text-foreground">{v.deviations}</dd>
          </div>
        )}
      </dl>

      {!v.isComparable && (
        <p className="rounded-md bg-surface-muted px-2 py-1 text-xs text-muted-foreground">
          {t.procurement.cstUnrankedHint}
        </p>
      )}
    </Card>
  );
}

export function ComparisonScreen({
  isLoading,
  projectId,
  onProjectChange,
  projectOptions,
  rfqId,
  onRfqChange,
  rfqOptions,
  comparison,
}: ComparisonScreenProps) {
  const { vendors, rows, singleVendorValue, splitAwardValue, splitSaving } = comparison;
  const columns = React.useMemo(() => comparisonColumns(vendors), [vendors]);
  const comparableCount = vendors.filter((v) => v.isComparable).length;
  const variance = estimateVariancePct(comparison);
  const l1 = vendors.find((v) => v.rank === 1);

  return (
    <>
      <PageHeader
        title={t.procurement.quotationComparison}
        subtitle={t.procurement.cstSubtitle}
        helpTopic="quotationComparison"
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupProcurement }]}
      />

      <section className="mb-section grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SelectField
          id="cst-project"
          label={t.nav.project}
          value={projectId}
          onChange={onProjectChange}
          options={projectOptions}
        />
        <SearchableSelectField
          id="cst-rfq"
          label={t.procurement.cstPickRfq}
          value={rfqId}
          onChange={onRfqChange}
          options={rfqOptions}
          placeholder={t.procurement.cstPickRfqHint}
        />
      </section>

      {!rfqId ? (
        <EmptyState headline={t.procurement.cstNoRfq} description={t.procurement.cstNoRfqHint} />
      ) : vendors.length === 0 && !isLoading ? (
        <EmptyState headline={t.procurement.cstEmpty} description={t.procurement.cstEmptyHint} />
      ) : (
        <>
          <section className="mb-section grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label={t.procurement.cstKpiOffers} value={String(vendors.length)} />
            <KpiCard
              label={t.procurement.cstKpiComparable}
              value={String(comparableCount)}
              comparison={comparableCount < 3 ? t.procurement.cstThinFile : undefined}
            />
            <KpiCard
              label={t.procurement.cstKpiL1}
              value={singleVendorValue === null ? '—' : formatAmount(singleVendorValue)}
              comparison={
                variance === null
                  ? undefined
                  : `${Math.abs(variance).toFixed(1)}% ${
                      variance >= 0 ? t.procurement.cstOverEstimate : t.procurement.cstUnderEstimate
                    }`
              }
              trend={variance === null ? undefined : variance > 0 ? 'UP' : 'DOWN'}
              trendIsGood={variance === null ? undefined : variance <= 0}
            />
            <KpiCard
              label={t.procurement.cstKpiSaving}
              value={formatAmount(splitSaving)}
              comparison={
                splitAwardValue === null ? undefined : `${t.procurement.cstSplitAward}: ${formatAmount(splitAwardValue)}`
              }
            />
          </section>

          {/* Vendor summaries sit above the matrix because the commercial terms
              decide as many awards as the rates do. */}
          <section className="mb-section grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((v) => (
              <VendorSummaryCard key={v.quotationId} v={v} />
            ))}
          </section>

          <p className="mb-3 text-xs text-muted-foreground">{t.procurement.cstLandedNote}</p>

          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.rfqLineId}
            isLoading={isLoading}
            emptyHeadline={t.procurement.cstEmpty}
            emptyDescription={t.procurement.cstEmptyHint}
            cardTitle={(r) => r.description}
            cardSubtitle={(r) => `${r.quantity} ${r.uomCode}`}
          />

          <section className="mt-section">
            <Card className="flex flex-col gap-2 p-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t.procurement.cstRecommendation}
              </p>
              {l1 ? (
                <p className="text-sm leading-relaxed text-foreground">
                  {t.procurement.cstSingleAward}: {l1.vendorName} — {formatAmount(l1.landedValue)}.
                  {splitSaving > 0 && (
                    <>
                      {' '}
                      {t.procurement.cstSplitAward}: {formatAmount(splitAwardValue ?? 0)} (
                      {t.procurement.cstSplitSaving} {formatAmount(splitSaving)}).
                    </>
                  )}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">{t.procurement.cstUnrankedHint}</p>
              )}
              {splitSaving > 0 && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t.procurement.cstSplitNote}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{t.procurement.cstRecommendationNote}</p>
            </Card>
          </section>
        </>
      )}
    </>
  );
}

export default ComparisonScreen;
