'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { StatusChip, type ColumnDef } from '@/components/erp';
import { Badge } from '@/components/ui/badge';
import { formatAmount, formatDate } from '@/lib/format';
import type { Quotation } from '@/lib/data/types';
import {
  basicValue,
  daysToExpiry,
  extraCharges,
  isExpired,
  isPartialOffer,
  landedValue,
  taxValue,
} from '@/lib/procurement/quotation';

export function quotationColumns(
  rfqNo: (id: string) => string,
  lowestId?: string,
): ColumnDef<Quotation>[] {
  return [
    {
      key: 'documentNo',
      header: t.procurement.qtnNo,
      sortable: true,
      width: '12rem',
      cell: (q) => (
        <span className="flex flex-col">
          <span className="font-medium text-foreground">{q.documentNo}</span>
          <span className="text-xs text-muted-foreground">{formatDate(q.date)}</span>
        </span>
      ),
    },
    {
      key: 'vendorName',
      header: t.procurement.qtnVendor,
      sortable: true,
      cell: (q) => (
        <span className="flex flex-col">
          <span className="text-foreground">{q.vendorName}</span>
          {q.vendorRefNo && <span className="text-xs text-muted-foreground">{q.vendorRefNo}</span>}
        </span>
      ),
    },
    {
      key: 'rfqId',
      header: t.procurement.qtnRfq,
      width: '12rem',
      cell: (q) => <span className="text-foreground">{rfqNo(q.rfqId)}</span>,
    },
    {
      key: 'basicValue',
      header: t.procurement.qtnBasicValue,
      align: 'right',
      sortable: true,
      width: '10rem',
      cell: (q) => <span className="num text-foreground">{formatAmount(basicValue(q))}</span>,
    },
    {
      key: 'charges',
      header: t.procurement.qtnCharges,
      align: 'right',
      width: '9rem',
      hiddenByDefault: true,
      cell: (q) => <span className="num text-muted-foreground">{formatAmount(extraCharges(q))}</span>,
    },
    {
      key: 'tax',
      header: t.procurement.qtnTax,
      align: 'right',
      width: '9rem',
      hiddenByDefault: true,
      cell: (q) => <span className="num text-muted-foreground">{formatAmount(taxValue(q))}</span>,
    },
    {
      key: 'landedValue',
      header: t.procurement.qtnLandedValue,
      align: 'right',
      sortable: true,
      width: '11rem',
      cell: (q) => (
        <span className="flex flex-col items-end">
          <span className="num font-medium text-foreground">{formatAmount(landedValue(q))}</span>
          {q.id === lowestId && (
            <Badge variant="success" className="mt-0.5">
              {t.procurement.qtnLowest}
            </Badge>
          )}
        </span>
      ),
    },
    {
      key: 'validUntil',
      header: t.procurement.qtnValidUntil,
      sortable: true,
      width: '10rem',
      cell: (q) => {
        if (!q.validUntil) return <span className="text-muted-foreground">—</span>;
        const left = daysToExpiry(q);
        return (
          <span className="flex flex-col">
            <span className="text-foreground">{formatDate(q.validUntil)}</span>
            {isExpired(q) ? (
              <span className="text-xs text-danger">{t.procurement.qtnExpired}</span>
            ) : left !== null && left <= 7 ? (
              <span className="text-xs text-warning">{t.procurement.qtnExpiringSoon}</span>
            ) : null}
          </span>
        );
      },
    },
    {
      key: 'technical',
      header: t.procurement.qtnTechnical,
      align: 'center',
      width: '9rem',
      cell: (q) => (
        <span className="flex flex-col items-center gap-1">
          {q.isTechnicallyQualified === true ? (
            <Badge variant="success">{t.procurement.qtnQualified}</Badge>
          ) : q.isTechnicallyQualified === false ? (
            <Badge variant="danger">{t.procurement.qtnDisqualified}</Badge>

          ) : (
            <Badge variant="outline">{t.procurement.qtnPendingScrutiny}</Badge>
          )}
          {isPartialOffer(q) && <Badge variant="warning">{t.procurement.qtnPartial}</Badge>}
        </span>
      ),
    },
    {
      key: 'status',
      header: t.common.status,
      align: 'center',
      cell: (q) => <StatusChip status={q.status} size="sm" />,
    },
  ];
}
