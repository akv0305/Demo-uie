import { terminology as t } from '@/config/terminology.config';
import type { ColumnDef } from '@/components/erp';
import type { HsnSac } from '@/lib/data/types';

const pct = (n?: number) => (n === undefined ? '—' : `${n}%`);

export const kindLabel = (k: HsnSac['kind']) =>
  k === 'HSN' ? t.masters.kindHSN : t.masters.kindSAC;

export const hsnColumns: ColumnDef<HsnSac>[] = [
  {
    key: 'code',
    header: t.masters.hsnCode,
    sortable: true,
    cell: (r) => <span className="font-medium text-foreground">{r.code}</span>,
  },
  { key: 'kind', header: t.masters.hsnKind, sortable: true, cell: (r) => kindLabel(r.kind) },
  {
    key: 'description',
    header: t.masters.hsnDescription,
    sortable: true,
    cell: (r) => r.description,
  },
  {
    key: 'gstRate',
    header: t.masters.hsnGstRate,
    align: 'right',
    sortable: true,
    cell: (r) =>
      r.isNonGst ? (
        <span className="text-muted-foreground">{t.masters.hsnNonGst}</span>
      ) : (
        pct(r.gstRate)
      ),
  },
  {
    key: 'cgstRate',
    header: t.masters.hsnCgst,
    align: 'right',
    hideOnCard: true,
    cell: (r) => pct(r.cgstRate),
  },
  {
    key: 'sgstRate',
    header: t.masters.hsnSgst,
    align: 'right',
    hideOnCard: true,
    cell: (r) => pct(r.sgstRate),
  },
  {
    key: 'igstRate',
    header: t.masters.hsnIgst,
    align: 'right',
    hideOnCard: true,
    cell: (r) => pct(r.igstRate),
  },
  {
    key: 'effectiveFrom',
    header: t.masters.hsnEffectiveFrom,
    hiddenByDefault: true,
    cell: (r) => r.effectiveFrom ?? '—',
  },
  {
    key: 'isActive',
    header: t.common.status,
    cell: (r) =>
      (r.isActive ?? true) ? (
        <span className="text-success">{t.admin.active}</span>
      ) : (
        <span className="text-muted-foreground">{t.admin.inactive}</span>
      ),
  },
];
