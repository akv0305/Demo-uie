'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { StatusChip, type ColumnDef } from '@/components/erp';
import { Badge } from '@/components/ui/badge';
import { formatAmount, formatDate, formatQuantity } from '@/lib/format';
import type { MaterialReturn } from '@/lib/data/types';
import {
  damagedQtyTotal,
  damagedValueTotal,
  hasDamage,
  hasUnbalancedLine,
  restockedQtyTotal,
  returnValue,
} from '@/lib/inventory/material-return';

export function returnColumns(): ColumnDef<MaterialReturn>[] {
  return [
    {
      key: 'documentNo',
      header: t.inventory.mrFull,
      sortable: true,
      width: '14rem',
      cell: (r) => (
        <span className="flex flex-col">
          <span className="font-medium text-foreground">{r.documentNo}</span>
          <span className="text-xs text-muted-foreground">{formatDate(r.date)}</span>
          {r.returnType !== 'SURPLUS' ? (
            <Badge variant="info" className="mt-0.5 self-start">
              {t.inventory[`rt${r.returnType}` as keyof typeof t.inventory] as string}
            </Badge>
          ) : null}
        </span>
      ),
    },
    {
      key: 'issueDocumentNo',
      header: t.inventory.mrIssueRef,
      sortable: true,
      width: '12rem',
      cell: (r) =>
        r.issueDocumentNo ? (
          <span className="text-foreground">{r.issueDocumentNo}</span>
        ) : (
          <Badge variant="warning">{t.inventory.mrNoIssueRef}</Badge>
        ),
    },
    {
      key: 'returnedFrom',
      header: t.inventory.secMrReference,
      width: '14rem',
      cell: (r) => (
        <span className="flex flex-col">
          <span className="truncate text-foreground">
            {r.subcontractorName || r.reason || '—'}
          </span>
          {r.gatePassNo ? (
            <span className="text-xs text-muted-foreground">
              {t.inventory.mrGatePassNo}: {r.gatePassNo}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: 'restockedQty',
      header: t.inventory.mrRestockedQty,
      align: 'right',
      width: '9rem',
      cell: (r) => <span className="num">{formatQuantity(restockedQtyTotal(r))}</span>,
    },
    {
      key: 'damagedQty',
      header: t.inventory.mrDamagedQty,
      align: 'right',
      width: '9rem',
      hiddenByDefault: true,
      cell: (r) => {
        const damaged = damagedQtyTotal(r);
        return damaged > 0 ? (
          <span className="num text-danger">{formatQuantity(damaged)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      key: 'restockValue',
      header: t.inventory.mrKpiRestockValue,
      sortable: true,
      align: 'right',
      width: '10rem',
      cell: (r) => <span className="num">{formatAmount(returnValue(r))}</span>,
    },
    {
      key: 'flags',
      header: t.common.status,
      align: 'center',
      width: '12rem',
      hideOnCard: true,
      cell: (r) => {
        const flags: React.ReactNode[] = [];
        if (hasDamage(r)) {
          flags.push(
            <Badge key="damage" variant="danger">
              {`${t.inventory.mrDamagedQty} ${formatAmount(damagedValueTotal(r))}`}
            </Badge>,
          );
        }
        if (hasUnbalancedLine(r)) {
          flags.push(
            <Badge key="unbalanced" variant="warning">
              {t.inventory.mrUnbalanced}
            </Badge>,
          );
        }
        if (!r.issueId) {
          flags.push(
            <Badge key="noref" variant="secondary">
              {t.inventory.mrKpiWithoutIssueHint}
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
      cell: (r) => <StatusChip status={r.status} size="sm" />,
    },
  ];
}
