'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { StatusChip, type ColumnDef } from '@/components/erp';
import { Badge } from '@/components/ui/badge';
import { formatAmount, formatDate } from '@/lib/format';
import type { BankGuarantee, RetentionEntry } from '@/lib/data/types';
import {
  bgStatusLabel,
  bgTypeLabel,
  daysToExpiry,
  isExpiringSoon,
  isLapsed,
  isLive,
} from '@/lib/project/bg-retention';

export function bgColumns(): ColumnDef<BankGuarantee>[] {
  return [
    {
      key: 'bgNumber',
      header: t.project.bgNumber,
      sortable: true,
      width: '12rem',
      cell: (r) => (
        <span className="flex flex-col">
          <span className="font-medium text-foreground">{r.bgNumber}</span>
          <span className="text-xs text-muted-foreground">{r.documentNo}</span>
        </span>
      ),
    },
    {
      key: 'type',
      header: t.project.bgType,
      cell: (r) => <span className="text-foreground">{bgTypeLabel(r.type)}</span>,
    },
    {
      key: 'bankName',
      header: t.project.bgBank,
      cell: (r) => (
        <span className="flex flex-col">
          <span className="text-foreground">{r.bankName}</span>
          <span className="text-xs text-muted-foreground">{r.branch ?? '—'}</span>
        </span>
      ),
    },
    {
      key: 'beneficiary',
      header: t.project.bgBeneficiary,
      hiddenByDefault: true,
      cell: (r) => <span className="line-clamp-2 text-foreground">{r.beneficiary}</span>,
    },
    {
      key: 'amount',
      header: t.project.bgAmount,
      align: 'right',
      sortable: true,
      width: '10rem',
      cell: (r) => <span className="num text-foreground">{formatAmount(r.amount)}</span>,
    },
    {
      key: 'validUpto',
      header: t.project.validUpto,
      sortable: true,
      width: '8rem',
      cell: (r) => formatDate(r.validUpto),
    },
    {
      key: 'daysToExpiry',
      header: t.project.bgDaysToExpiry,
      align: 'right',
      width: '9rem',
      cell: (r) => {
        if (!isLive(r)) return <span className="text-muted-foreground">—</span>;
        const days = daysToExpiry(r);
        if (days < 0) return <Badge variant="danger">{t.project.bgLapsed}</Badge>;
        if (isExpiringSoon(r))
          return (
            <Badge variant="warning">
              {days} {t.project.bgDays}
            </Badge>
          );
        return (
          <span className="num text-muted-foreground">
            {days} {t.project.bgDays}
          </span>
        );
      },
    },
    {
      key: 'marginAmount',
      header: t.project.bgMarginAmount,
      align: 'right',
      width: '10rem',
      hiddenByDefault: true,
      cell: (r) =>
        r.marginAmount === undefined ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <span className="num text-muted-foreground">{formatAmount(r.marginAmount)}</span>
        ),
    },
    {
      key: 'bgStatus',
      header: t.project.bgStatusLabel,
      cell: (r) =>
        isLapsed(r) || r.bgStatus === 'INVOKED' ? (
          <Badge variant="danger">{bgStatusLabel(r.bgStatus)}</Badge>
        ) : r.bgStatus === 'UNDER_EXTENSION' ? (
          <Badge variant="warning">{bgStatusLabel(r.bgStatus)}</Badge>
        ) : (
          <span className="text-foreground">{bgStatusLabel(r.bgStatus)}</span>
        ),
    },
    {
      key: 'status',
      header: t.common.status,
      align: 'center',
      hiddenByDefault: true,
      cell: (r) => <StatusChip status={r.status} size="sm" />,
    },
  ];
}

/** Ledger view — rows already carry a running balance. */
export function retentionColumns(): ColumnDef<RetentionEntry & { balance: number }>[] {
  const eventLabel = (e: RetentionEntry['event']) =>
    ({
      DEDUCTED: t.project.reDEDUCTED,
      RELEASED: t.project.reRELEASED,
      SUBSTITUTED_BY_BG: t.project.reSUBSTITUTED_BY_BG,
    })[e];

  return [
    { key: 'date', header: t.project.retDate, width: '8rem', cell: (r) => formatDate(r.date) },
    {
      key: 'billNo',
      header: t.project.retBillNo,
      width: '10rem',
      cell: (r) => <span className="font-medium text-foreground">{r.billNo}</span>,
    },
    {
      key: 'event',
      header: t.project.retEvent,
      cell: (r) =>
        r.event === 'DEDUCTED' ? (
          <span className="text-foreground">{eventLabel(r.event)}</span>
        ) : (
          <Badge variant="success">{eventLabel(r.event)}</Badge>
        ),
    },
    {
      key: 'billAmount',
      header: t.project.retBillAmount,
      align: 'right',
      width: '11rem',
      cell: (r) =>
        r.billAmount === undefined ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <span className="num text-muted-foreground">{formatAmount(r.billAmount)}</span>
        ),
    },
    {
      key: 'retentionPct',
      header: t.project.retPct,
      align: 'right',
      width: '6rem',
      cell: (r) =>
        r.retentionPct === undefined ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <span className="num text-muted-foreground">{r.retentionPct}%</span>
        ),
    },
    {
      key: 'amount',
      header: t.project.retAmount,
      align: 'right',
      width: '10rem',
      cell: (r) => (
        <span className={r.event === 'DEDUCTED' ? 'num text-foreground' : 'num text-success'}>
          {r.event === 'DEDUCTED' ? '' : '− '}
          {formatAmount(r.amount)}
        </span>
      ),
    },
    {
      key: 'balance',
      header: t.project.retBalance,
      align: 'right',
      width: '11rem',
      cell: (r) => <span className="num font-medium text-foreground">{formatAmount(r.balance)}</span>,
    },
  ];
}
