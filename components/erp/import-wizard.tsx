'use client';

import * as React from 'react';
import { AlertCircle, Check, Download, FileUp, ListChecks, Upload } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * (17) ImportWizard — four steps: download template, upload file, preview with
 * row-level validation errors, confirm import; ending in a result summary
 * showing rows imported and rows failed.
 */
export interface ImportPreviewRow {
  rowNo: number;
  values: Record<string, string>;
  errors?: string[];
}

export interface ImportWizardProps {
  /** Column headings shown in the preview table. */
  columns: { key: string; header: string }[];
  /** Preview rows produced after the file is read. */
  previewRows: ImportPreviewRow[];
  onDownloadTemplate?: () => void;
  onFileSelected?: (file: { name: string; sizeKb: number }) => void;
  onConfirm?: (validRowCount: number) => void;
  className?: string;
}

const STEPS = [
  { id: 1, label: t.importWizard.step1, hint: t.importWizard.step1Hint, icon: Download },
  { id: 2, label: t.importWizard.step2, hint: t.importWizard.step2Hint, icon: Upload },
  { id: 3, label: t.importWizard.step3, hint: t.importWizard.step3Hint, icon: ListChecks },
  { id: 4, label: t.importWizard.step4, hint: t.importWizard.step4Hint, icon: Check },
] as const;

export function ImportWizard({
  columns,
  previewRows,
  onDownloadTemplate,
  onFileSelected,
  onConfirm,
  className,
}: ImportWizardProps) {
  const [step, setStep] = React.useState(1);
  const [file, setFile] = React.useState<{ name: string; sizeKb: number } | null>(null);
  const [completed, setCompleted] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validRows = previewRows.filter((r) => !r.errors || r.errors.length === 0);
  const failedRows = previewRows.filter((r) => r.errors && r.errors.length > 0);

  const handleFile = (list: FileList | null) => {
    const picked = list?.[0];
    if (!picked) return;
    const next = { name: picked.name, sizeKb: Math.round(picked.size / 1024) };
    setFile(next);
    onFileSelected?.(next);
    setStep(3);
  };

  return (
    <section className={cn('flex flex-col gap-section', className)}>
      {/* Stepper */}
      <ol className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-card sm:flex-row sm:items-center sm:gap-0">
        {STEPS.map((s, index) => {
          const Icon = s.icon;
          const isDone = completed || step > s.id;
          const isCurrent = !completed && step === s.id;
          return (
            <li key={s.id} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
                  isDone
                    ? 'border-success bg-success text-primary-foreground'
                    : isCurrent
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-surface-muted text-muted-foreground',
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block truncate text-sm',
                    isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {s.label}
                </span>
              </span>
              {index < STEPS.length - 1 && (
                <span className="hidden h-px flex-1 bg-border sm:block" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>

      {/* Result summary */}
      {completed ? (
        <div className="rounded-lg border border-success/30 bg-success/5 p-card">
          <h3 className="flex items-center gap-2 text-sm font-heading text-foreground">
            <Check className="h-4 w-4 text-success" aria-hidden="true" />
            {t.importWizard.importComplete}
          </h3>
          <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border bg-surface px-3 py-2">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {t.importWizard.rowsImported}
              </dt>
              <dd className="num mt-0.5 text-xl font-heading text-success">{validRows.length}</dd>
            </div>
            <div className="rounded-md border border-border bg-surface px-3 py-2">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {t.importWizard.rowsFailed}
              </dt>
              <dd className="num mt-0.5 text-xl font-heading text-danger">{failedRows.length}</dd>
            </div>
          </dl>
          <Button
            className="mt-4"
            size="sm"
            variant="outline"
            onClick={() => {
              setCompleted(false);
              setStep(1);
              setFile(null);
            }}
          >
            {t.importWizard.done}
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface p-card">
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            {STEPS[step - 1]?.hint}
          </p>

          {/* Step 1 — template */}
          {step === 1 && (
            <Button onClick={onDownloadTemplate}>
              <Download />
              {t.importWizard.downloadTemplate}
            </Button>
          )}

          {/* Step 2 — upload */}
          {step === 2 && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files);
              }}
              className="flex flex-col items-center gap-2 rounded-md border border-dashed border-input bg-surface-muted px-4 py-8 text-center"
            >
              <FileUp className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">{t.common.dragDropHint}</p>
              <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                {t.common.upload}
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.csv"
                className="hidden"
                aria-label={t.common.upload}
                onChange={(e) => handleFile(e.target.files)}
              />
              {file && <p className="text-xs text-foreground">{file.name}</p>}
            </div>
          )}

          {/* Step 3 — preview with row-level errors */}
          {step === 3 && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success">
                  {t.importWizard.rowsValid}: {validRows.length}
                </Badge>
                <Badge variant="danger">
                  {t.importWizard.rowsFailed}: {failedRows.length}
                </Badge>
              </div>

              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-surface-muted">
                    <tr className="border-b border-border">
                      <th className="w-14 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t.importWizard.rowNo}
                      </th>
                      {columns.map((c) => (
                        <th
                          key={c.key}
                          className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                          {c.header}
                        </th>
                      ))}
                      <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t.importWizard.validationError}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewRows.map((row) => {
                      const hasError = Boolean(row.errors?.length);
                      return (
                        <tr key={row.rowNo} className={cn(hasError && 'bg-danger/5')}>
                          <td className="px-2 py-1.5 text-xs text-muted-foreground">{row.rowNo}</td>
                          {columns.map((c) => (
                            <td key={c.key} className="whitespace-nowrap px-2 py-1.5 text-foreground">
                              {row.values[c.key] ?? '—'}
                            </td>
                          ))}
                          <td className="px-2 py-1.5">
                            {hasError ? (
                              <span className="flex items-start gap-1.5 text-xs text-danger">
                                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                                <span>{row.errors?.join('; ')}</span>
                              </span>
                            ) : (
                              <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 4 — confirm */}
          {step === 4 && (
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-surface-muted px-3 py-2">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t.importWizard.rowsValid}
                </dt>
                <dd className="num mt-0.5 text-xl font-heading text-foreground">{validRows.length}</dd>
              </div>
              <div className="rounded-md border border-border bg-surface-muted px-3 py-2">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t.importWizard.rowsFailed}
                </dt>
                <dd className="num mt-0.5 text-xl font-heading text-foreground">{failedRows.length}</dd>
              </div>
            </dl>
          )}

          {/* Navigation */}
          <div className="mt-5 flex items-center justify-between gap-2 border-t border-border pt-4">
            <Button variant="ghost" size="sm" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
              {t.importWizard.back}
            </Button>
            {step < 4 ? (
              <Button
                size="sm"
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 2 && !file}
              >
                {t.importWizard.next}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  onConfirm?.(validRows.length);
                  setCompleted(true);
                }}
              >
                {t.importWizard.startImport}
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
