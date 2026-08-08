'use client';

import * as React from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { Download, Paperclip, Trash2, Upload } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import type { Attachment } from '@/lib/data/types';
import { formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EmptyState } from './empty-state';

/**
 * (10) AttachmentsPanel — file list with name, category, uploaded by, date and
 * expiry, plus download / delete actions and a drag-and-drop upload area.
 */
export function AttachmentsPanel({
  attachments,
  onUpload,
  onDelete,
  readOnly = false,
  className,
}: {
  attachments: Attachment[];
  onUpload?: (files: { name: string; sizeKb: number }[]) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
  className?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFiles = (list: FileList | null) => {
    if (!list || !onUpload) return;
    onUpload(Array.from(list).map((f) => ({ name: f.name, sizeKb: Math.round(f.size / 1024) })));
  };

  const expiryBadge = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const days = differenceInCalendarDays(new Date(expiryDate), new Date());
    if (days < 0) return <Badge variant="danger">{t.documents.expired}</Badge>;
    if (days <= 30)
      return (
        <Badge variant="warning">
          {t.documents.expiringSoon} · {days} {t.documents.daysToExpiry.toLowerCase()}
        </Badge>
      );
    return <span className="text-xs text-muted-foreground">{formatDate(expiryDate)}</span>;
  };

  return (
    <section className={cn('flex flex-col gap-section', className)}>
      {/* Upload area */}
      {!readOnly && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition-colors',
            isDragging ? 'border-primary bg-primary/5' : 'border-input bg-surface-muted',
          )}
        >
          <Upload className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{t.common.dragDropHint}</p>
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            {t.common.upload}
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            aria-label={t.common.upload}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {attachments.length === 0 ? (
        <EmptyState
          icon={Paperclip}
          headline={t.common.noAttachments}
          description={t.common.noAttachmentsHint}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted">
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.common.fileName}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.common.category}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.common.uploadedBy}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.common.uploadedOn}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.common.expiryDate}
                  </th>
                  <th className="w-24 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.common.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attachments.map((a) => (
                  <tr key={a.id} className="hover:bg-accent/60">
                    <td className="px-3 py-row-y">
                      <span className="flex items-center gap-2">
                        <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                        <span className="truncate text-foreground">{a.fileName}</span>
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{a.sizeKb} KB</span>
                    </td>
                    <td className="px-3 py-row-y text-muted-foreground">{a.category}</td>
                    <td className="px-3 py-row-y text-muted-foreground">{a.uploadedByName}</td>
                    <td className="px-3 py-row-y text-muted-foreground">{formatDate(a.uploadedOn)}</td>
                    <td className="px-3 py-row-y">{expiryBadge(a.expiryDate) ?? '—'}</td>
                    <td className="px-3 py-row-y text-right">
                      <span className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="iconSm" aria-label={t.common.download}>
                          <Download />
                        </Button>
                        {!readOnly && (
                          <Button
                            variant="ghost"
                            size="iconSm"
                            aria-label={t.common.delete}
                            className="text-danger"
                            onClick={() => onDelete?.(a.id)}
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="flex flex-col gap-2 md:hidden">
            {attachments.map((a) => (
              <li key={a.id} className="rounded-lg border border-border bg-surface p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex min-w-0 items-start gap-2">
                    <Paperclip className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">{a.fileName}</span>
                      <span className="block text-xs text-muted-foreground">
                        {a.category} · {a.sizeKb} KB
                      </span>
                    </span>
                  </p>
                  <span className="flex shrink-0 items-center gap-1">
                    <Button variant="ghost" size="iconSm" aria-label={t.common.download}>
                      <Download />
                    </Button>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="iconSm"
                        aria-label={t.common.delete}
                        className="text-danger"
                        onClick={() => onDelete?.(a.id)}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </span>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-2 text-xs">
                  <div>
                    <dt className="text-muted-foreground">{t.common.uploadedBy}</dt>
                    <dd className="truncate text-foreground">{a.uploadedByName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t.common.uploadedOn}</dt>
                    <dd className="text-foreground">{formatDate(a.uploadedOn)}</dd>
                  </div>
                  {a.expiryDate && (
                    <div className="col-span-2">
                      <dt className="text-muted-foreground">{t.common.expiryDate}</dt>
                      <dd className="mt-0.5">{expiryBadge(a.expiryDate)}</dd>
                    </div>
                  )}
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
