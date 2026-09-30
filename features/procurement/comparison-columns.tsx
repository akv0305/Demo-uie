'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import type { ColumnDef } from '@/components/erp';
import { Badge } from '@/components/ui/badge';
import { formatAmount, formatQuantity } from '@/lib/format';
import type { ComparisonRow, VendorColumn } from '@/lib/procurement/comparison';

/**
 * Columns are built per enquiry: one fixed block for the item, then one
 * column per vendor who responded. The lowest landed rate on each row is
 * marked, which is what a reader of the statement looks for first.
 */
export function comparisonColumns(vendors: VendorColumn[]): ColumnDef<ComparisonRow>[] {
  const fixed: ColumnDef<ComparisonRow>[] = [
    {
      key: 'description',
      header: t.procurement.cstItem,
      width: '18rem',
      cell: (r) => (
        <span className="flex flex-col">
          <span className="font-medium text-foreground">{r.description}</span>
          <span className="text-xs text-muted-foreground">
            {formatQuantity(r.quantity)} {r.uomCode}
          </span>
        </span>
      ),
    },
    {
      key: 'estimate',
      header: t.procurement.cstEstimate,
      align: 'right',
      width: '8rem',
      hiddenByDefault: true,
      cell: (r) =>
        r.estimatedRate ? (
          <span className="num text-muted-foreground">{formatAmount(r.estimatedRate)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  const vendorCols: ColumnDef<ComparisonRow>[] = vendors.map((v) => ({
    key: `v-${v.quotationId}`,
    header: v.vendorName,
    align: 'right',
    width: '11rem',
    cell: (r) => {
      const cell = r.cells.find((c) => c.quotationId === v.quotationId);
      if (!cell || !cell.quoted) {
        return <span className="text-xs text-muted-foreground">{t.procurement.cstNotQuoted}</span>;
      }
      return (
        <span className="flex flex-col items-end">
          <span
            className={
              cell.isLowest ? 'num font-medium text-success' : 'num text-foreground'
            }
          >
            {formatAmount(cell.landedRate)}
          </span>
          <span className="text-xs text-muted-foreground">{formatAmount(cell.landedAmount)}</span>
          {cell.makeOffered && (
            <span className="text-xs text-muted-foreground">{cell.makeOffered}</span>
          )}
          {cell.isLowest && (
            <Badge variant="success" className="mt-0.5">
              {t.procurement.cstL1}
            </Badge>
          )}
        </span>
      );
    },
  }));

  return [...fixed, ...vendorCols];
}
