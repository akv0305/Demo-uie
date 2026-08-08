'use client';

import * as React from 'react';
import { Save, Send, X } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { HelpHint, type HelpKey } from './help-hint';

/**
 * (6) FormLayout — section headings, two columns on desktop and one on mobile,
 * a sticky footer with Save Draft / Submit / Cancel, and an unsaved-changes
 * warning.
 */
export function FormSection({
  title,
  description,
  helpTopic,
  columns = 2,
  children,
  className,
}: {
  title: string;
  description?: string;
  helpTopic?: HelpKey;
  /** 1 = full width (useful for notes and grids), 2 = two columns on desktop. */
  columns?: 1 | 2;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-lg border border-border bg-surface', className)}>
      <header className="border-b border-border bg-surface-muted px-card py-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-heading text-foreground">{title}</h2>
          {helpTopic && <HelpHint topic={helpTopic} />}
        </div>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </header>
      <div
        className={cn(
          'grid gap-4 p-card',
          columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1',
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function FormLayout({
  children,
  isDirty = false,
  onSaveDraft,
  onSubmit,
  onCancel,
  submitLabel = t.common.submit,
  saveDraftLabel = t.common.saveDraft,
  isSaving = false,
  className,
}: {
  children: React.ReactNode;
  /** Enables the unsaved-changes warning when cancelling. */
  isDirty?: boolean;
  onSaveDraft?: () => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  saveDraftLabel?: string;
  isSaving?: boolean;
  className?: string;
}) {
  const [warnOpen, setWarnOpen] = React.useState(false);

  // Warn on browser navigation away while the form holds unsaved input.
  React.useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const requestCancel = () => {
    if (isDirty) setWarnOpen(true);
    else onCancel?.();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className={cn('flex flex-col', className)}
    >
      {/* Body */}
      <div className="stack-section pb-24">{children}</div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 z-10 -mx-page-x -mb-page-y border-t border-border bg-surface px-page-x py-3">
        <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
          {isDirty && (
            <p className="mr-auto text-xs text-warning sm:text-sm">{t.common.unsavedChanges}</p>
          )}
          <Button type="button" variant="ghost" onClick={requestCancel} disabled={isSaving}>
            <X />
            {t.common.cancel}
          </Button>
          {onSaveDraft && (
            <Button type="button" variant="outline" onClick={onSaveDraft} disabled={isSaving}>
              <Save />
              {saveDraftLabel}
            </Button>
          )}
          {onSubmit && (
            <Button type="submit" disabled={isSaving}>
              <Send />
              {submitLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Unsaved-changes warning */}
      <Dialog open={warnOpen} onOpenChange={setWarnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.common.unsavedChanges}</DialogTitle>
            <DialogDescription>{t.common.unsavedChangesHint}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarnOpen(false)}>
              {t.common.stayOnPage}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setWarnOpen(false);
                onCancel?.();
              }}
            >
              {t.common.discardChanges}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
