'use client';

import * as React from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';
import { terminology as t } from '@/config/terminology.config';
import type { ApprovalStep, Attachment, AuditEntry, DocumentStatus } from '@/lib/data/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ApprovalTimeline } from './approval-timeline';
import { AttachmentsPanel } from './attachments-panel';
import { AuditTrailPanel } from './audit-trail-panel';
import { StatusChip } from './status-chip';
import type { PageAction } from './page-header';

/**
 * (9) DetailPageLayout — header with document number and status, key-value
 * summary panel, tabbed body (Details, Line Items, Attachments, Approvals,
 * Audit Trail) and an action bar.
 */
export interface SummaryEntry {
  label: string;
  value: React.ReactNode;
}

export function DetailPageLayout({
  documentNo,
  title,
  status,
  backHref,
  summary,
  actions = [],
  detailsSlot,
  lineItemsSlot,
  attachments = [],
  approvals = [],
  auditEntries = [],
  className,
}: {
  documentNo: string;
  title?: string;
  status: DocumentStatus;
  backHref?: string;
  summary: SummaryEntry[];
  actions?: PageAction[];
  detailsSlot?: React.ReactNode;
  lineItemsSlot?: React.ReactNode;
  attachments?: Attachment[];
  approvals?: ApprovalStep[];
  auditEntries?: AuditEntry[];
  className?: string;
}) {
  return (
    <article className={cn('flex flex-col gap-section', className)}>
      {/* Header */}
      <header className="flex flex-col gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" aria-hidden="true" />
            {t.common.backToList}
          </Link>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-lg font-heading text-foreground">{documentNo}</h1>
              <StatusChip status={status} />
            </div>
            {title && <p className="mt-1 text-sm text-muted-foreground">{title}</p>}
          </div>

          {/* Action bar */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <Printer />
              {t.common.print}
            </Button>
            {actions.map((action, i) => (
              <Button
                key={`${action.label}-${i}`}
                size="sm"
                variant={action.variant ?? (i === actions.length - 1 ? 'default' : 'outline')}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Key-value summary panel */}
      <section
        aria-label={t.detail.summary}
        className="rounded-lg border border-border bg-surface p-card"
      >
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
          {summary.map((entry) => (
            <div key={entry.label} className="min-w-0">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {entry.label}
              </dt>
              <dd className="mt-0.5 truncate text-sm font-medium text-foreground">{entry.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Tabbed body */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">{t.detail.tabDetails}</TabsTrigger>
          <TabsTrigger value="line-items">{t.detail.tabLineItems}</TabsTrigger>
          <TabsTrigger value="attachments">
            {t.detail.tabAttachments}
            {attachments.length > 0 && (
              <span className="rounded-sm bg-surface-muted px-1.5 text-xs text-muted-foreground">
                {attachments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approvals">{t.detail.tabApprovals}</TabsTrigger>
          <TabsTrigger value="audit">{t.detail.tabAudit}</TabsTrigger>
        </TabsList>

        <TabsContent value="details">{detailsSlot}</TabsContent>
        <TabsContent value="line-items">{lineItemsSlot}</TabsContent>
        <TabsContent value="attachments">
          <AttachmentsPanel attachments={attachments} />
        </TabsContent>
        <TabsContent value="approvals">
          <ApprovalTimeline steps={approvals} />
        </TabsContent>
        <TabsContent value="audit">
          <AuditTrailPanel entries={auditEntries} />
        </TabsContent>
      </Tabs>
    </article>
  );
}
