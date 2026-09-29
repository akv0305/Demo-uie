import { Badge } from '@/components/ui/badge';
import { terminology as t } from '@/config/terminology.config';
import type { ColumnDef } from '@/components/erp';
import type { Attachment } from '@/lib/data/types';
import { formatDate } from '@/lib/format';
import {
  entityTypeLabel,
  expiryLabel,
  expiryState,
  formatFileSize,
} from '@/lib/documents/attachments';

function ValidityCell({ row }: { row: Attachment }) {
  const state = expiryState(row.expiryDate);
  if (state === 'NONE') return <span className="text-muted-foreground">{t.documents.noExpiry}</span>;
  if (state === 'EXPIRED') return <Badge variant="danger">{t.documents.expired}</Badge>;
  if (state === 'DUE_SOON') return <Badge variant="warning">{t.documents.expiringSoon}</Badge>;
  return <Badge variant="success">{t.documents.valid}</Badge>;
}

/**
 * @param linkedLabel Resolves entityKey+entityId to a readable record name.
 *                    Supplied by the container — ids must never be displayed (R1).
 */
export function documentColumns(
  linkedLabel: (row: Attachment) => string,
): ColumnDef<Attachment>[] {
  return [
    {
      key: 'fileName',
      header: t.documents.documentName,
      sortable: true,
      cell: (r) => <span className="font-medium text-foreground">{r.fileName}</span>,
    },
    { key: 'category', header: t.documents.documentType, sortable: true, cell: (r) => r.category },
    {
      key: 'linkedType',
      header: t.documents.linkedType,
      cell: (r) => entityTypeLabel(r.entityKey),
    },
    { key: 'linkedTo', header: t.documents.linkedTo, cell: (r) => linkedLabel(r) },
    {
      key: 'uploadedOn',
      header: t.documents.uploadedOn,
      sortable: true,
      cell: (r) => formatDate(r.uploadedOn),
    },
    {
      key: 'uploadedBy',
      header: t.documents.uploadedBy,
      cell: (r) => r.uploadedByName,
      hiddenByDefault: true,
    },
    {
      key: 'sizeKb',
      header: t.documents.fileSize,
      align: 'right',
      cell: (r) => formatFileSize(r.sizeKb),
      hideOnCard: true,
    },
    { key: 'validity', header: t.common.status, cell: (r) => <ValidityCell row={r} /> },
  ];
}

/** Expiry tracker shows dates and countdown instead of size and uploader. */
export function expiryColumns(
  linkedLabel: (row: Attachment) => string,
): ColumnDef<Attachment>[] {
  return [
    {
      key: 'fileName',
      header: t.documents.documentName,
      sortable: true,
      cell: (r) => <span className="font-medium text-foreground">{r.fileName}</span>,
    },
    { key: 'category', header: t.documents.documentType, cell: (r) => r.category },
    {
      key: 'linkedTo',
      header: t.documents.linkedTo,
      cell: (r) => `${entityTypeLabel(r.entityKey)} — ${linkedLabel(r)}`,
    },
    {
      key: 'expiryDate',
      header: t.documents.validTo,
      sortable: true,
      cell: (r) => (r.expiryDate ? formatDate(r.expiryDate) : '—'),
    },
    {
      key: 'daysToExpiry',
      header: t.documents.daysToExpiry,
      align: 'right',
      cell: (r) => expiryLabel(r.expiryDate),
    },
    { key: 'validity', header: t.common.status, cell: (r) => <ValidityCell row={r} /> },
  ];
}
