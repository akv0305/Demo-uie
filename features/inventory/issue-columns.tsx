'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { StatusChip, type ColumnDef } from '@/components/erp';
import { Badge } from '@/components/ui/badge';
import { formatAmount, formatDate, formatQuantity } from '@/lib/format';
import type { MaterialIssue } from '@/lib/data/types';
import {
  hasShortIssue,
  isReturnOverdue,
  issueValue,
  pendingReturnTotal,
  shortQtyTotal,
} from '@/lib/inventory/issue';

export function issueColumns(): ColumnDef<MaterialIssue>[] {
  return [
    {
      key: 'documentNo',
      header: t.inventory.miFull,
      sortable: true,
      width: '14rem',
      cell: (m) => (
        <span className="flex flex-col">
          <span className="font-medium text-foreground">{m.documentNo}</span>
          <span className="text-xs text-muted-foreground">{formatDate(m.date)}</span>
          {m.issueType !== 'CONSUMPTION' ? (
            <Badge variant="info" className="mt-0.5 self-start">
              {t.inventory[`it${m.issueType}` as keyof typeof t.inventory] as string}
            </Badge>
          ) : null}
        </span>
      ),
    },
    {
      key: 'requisitionNo',
      header: t.inventory.miRequisitionNo,
      sortable: true,
      width: '11rem',
      cell: (m) => (
        <span className="flex flex-col">
          <span className="text-foreground">{m.requisitionNo || '—'}</span>
          {m.requisitionDate ? (
            <span className="text-xs text-muted-foreground">{formatDate(m.requisitionDate)}</span>
          ) : null}
        </span>
      ),
    },
    {
      key: 'issuedTo',
      header: t.inventory.secMiParty,
      width: '14rem',
      cell: (m) => (
        <span className="flex flex-col">
          <span className="truncate text-foreground">
            {m.subcontractorName || m.purpose || '—'}
          </span>
          {m.gatePassNo ? (
            <span className="text-xs text-muted-foreground">
              {t.inventory.miGatePassNo}: {m.gatePassNo}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: 'lines',
      header: t.inventory.secMiLines,
      align: 'center',
      width: '6rem',
      cell: (m) => <span className="num">{m.lines.length}</span>,
    },
    {
      key: 'issueValue',
      header: t.inventory.miKpiValue,
      sortable: true,
      align: 'right',
      width: '10rem',
      cell: (m) => <span className="num">{formatAmount(issueValue(m))}</span>,
    },
    {
      key: 'shortQty',
      header: t.inventory.miShortQty,
      align: 'right',
      width: '9rem',
      hiddenByDefault: true,
      cell: (m) => {
        const short = shortQtyTotal(m);
        return short > 0 ? (
          <span className="num text-warning">{formatQuantity(short)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      key: 'flags',
      header: t.common.status,
      align: 'center',
      width: '12rem',
      hideOnCard: true,
      cell: (m) => {
        const flags: React.ReactNode[] = [];
        if (hasShortIssue(m)) {
          flags.push(
            <Badge key="short" variant="warning">
              {t.inventory.miKpiShort}
            </Badge>,
          );
        }
        const pending = pendingReturnTotal(m);
        if (pending > 0) {
          flags.push(
            <Badge key="return" variant={isReturnOverdue(m) ? 'danger' : 'info'}>
              {isReturnOverdue(m) ? t.inventory.miReturnOverdue : t.inventory.miPendingReturn}
            </Badge>,
          );
        }
        return flags.length ? (
          <span className="flex flex-wrap justify-center gap-1">{flags}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      key: 'status',
      header: t.common.status,
      align: 'center',
      cell: (m) => <StatusChip status={m.status} size="sm" />,
    },
  ];
}
