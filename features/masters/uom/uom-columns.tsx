import { Check } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import type { ColumnDef } from '@/components/erp';
import type { Uom, UomCategory } from '@/lib/data/types';

export const categoryLabel = (c?: UomCategory): string => {
  const map: Record<UomCategory, string> = {
    COUNT: t.masters.catCOUNT,
    WEIGHT: t.masters.catWEIGHT,
    VOLUME: t.masters.catVOLUME,
    LENGTH: t.masters.catLENGTH,
    AREA: t.masters.catAREA,
    TIME: t.masters.catTIME,
    OTHER: t.masters.catOTHER,
  };
  return c ? map[c] : '—';
};

export const uomColumns: ColumnDef<Uom>[] = [
  {
    key: 'code',
    header: t.masters.uomCode,
    sortable: true,
    cell: (r) => <span className="font-medium text-foreground">{r.code}</span>,
  },
  { key: 'name', header: t.masters.uomName, sortable: true, cell: (r) => r.name },
  {
    key: 'category',
    header: t.masters.uomCategory,
    sortable: true,
    cell: (r) => categoryLabel(r.category),
  },
  {
    key: 'decimals',
    header: t.masters.uomDecimals,
    align: 'right',
    cell: (r) => r.decimals,
  },
  {
    key: 'isBaseUnit',
    header: t.masters.uomIsBase,
    align: 'center',
    hideOnCard: true,
    cell: (r) =>
      r.isBaseUnit ? (
        <Check className="mx-auto h-4 w-4 text-success" aria-label={t.common.yes} />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
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
