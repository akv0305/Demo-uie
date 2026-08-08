'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatAmount, formatQuantity } from '@/lib/format';
import { cn } from '@/lib/utils';
import { EmptyState } from './empty-state';
import { SearchableSelectField, type Option } from './form-field';

/**
 * (8) LineItemsGrid — editable table for document line items.
 * Add row, delete row, inline validation, auto-calculated amount columns and a
 * totals footer. This is the single most used pattern in the application.
 *
 * Amount maths (all auto-calculated, never typed):
 *   gross    = quantity x rate
 *   discount = gross x discountPct / 100
 *   taxable  = gross - discount
 *   tax      = taxable x gstRate / 100
 *   total    = taxable + tax
 */
export interface LineRow {
  id: string;
  itemId?: string;
  itemCode?: string;
  description: string;
  uomCode: string;
  quantity: number | '';
  rate: number | '';
  discountPct?: number | '';
  gstRate?: number | '';
  wbsCode?: string;
  remarks?: string;
}

export interface LineRowComputed extends LineRow {
  gross: number;
  discountAmount: number;
  taxable: number;
  taxAmount: number;
  total: number;
}

export interface LineItemsGridProps {
  rows: LineRow[];
  onChange: (rows: LineRow[]) => void;
  /** Master item list for the searchable item picker. */
  itemOptions?: (Option & { uomCode?: string; gstRate?: number })[];
  wbsOptions?: Option[];
  showDiscount?: boolean;
  showTax?: boolean;
  showWbs?: boolean;
  readOnly?: boolean;
  className?: string;
}

function num(value: number | '' | undefined): number {
  return typeof value === 'number' && !Number.isNaN(value) ? value : 0;
}

export function computeLine(row: LineRow): LineRowComputed {
  const gross = num(row.quantity) * num(row.rate);
  const discountAmount = (gross * num(row.discountPct)) / 100;
  const taxable = gross - discountAmount;
  const taxAmount = (taxable * num(row.gstRate)) / 100;
  return { ...row, gross, discountAmount, taxable, taxAmount, total: taxable + taxAmount };
}

/** Row-level validation — returns a message per invalid field. */
export function validateLine(row: LineRow): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!row.description.trim() && !row.itemId) errors.description = t.common.requiredField;
  if (num(row.quantity) <= 0) errors.quantity = t.common.requiredField;
  if (num(row.rate) <= 0) errors.rate = t.common.requiredField;
  if (!row.uomCode) errors.uomCode = t.common.requiredField;
  return errors;
}

function newRow(): LineRow {
  return {
    id: `LN-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    description: '',
    uomCode: '',
    quantity: '',
    rate: '',
    discountPct: 0,
    gstRate: 18,
  };
}

export function LineItemsGrid({
  rows,
  onChange,
  itemOptions = [],
  wbsOptions = [],
  showDiscount = true,
  showTax = true,
  showWbs = true,
  readOnly = false,
  className,
}: LineItemsGridProps) {
  const computed = React.useMemo(() => rows.map(computeLine), [rows]);
  const errorsByRow = React.useMemo(
    () => Object.fromEntries(rows.map((r) => [r.id, validateLine(r)])),
    [rows],
  );

  const totals = React.useMemo(
    () =>
      computed.reduce(
        (acc, r) => ({
          quantity: acc.quantity + num(r.quantity),
          gross: acc.gross + r.gross,
          discount: acc.discount + r.discountAmount,
          taxable: acc.taxable + r.taxable,
          tax: acc.tax + r.taxAmount,
          total: acc.total + r.total,
        }),
        { quantity: 0, gross: 0, discount: 0, taxable: 0, tax: 0, total: 0 },
      ),
    [computed],
  );

  const update = (id: string, patch: Partial<LineRow>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addRow = () => onChange([...rows, newRow()]);
  const deleteRow = (id: string) => onChange(rows.filter((r) => r.id !== id));

  /** Selecting a master item pulls its UOM and GST rate through. */
  const pickItem = (id: string, itemId: string) => {
    const item = itemOptions.find((o) => o.value === itemId);
    update(id, {
      itemId,
      description: item?.label ?? '',
      itemCode: item?.hint,
      uomCode: item?.uomCode ?? '',
      gstRate: item?.gstRate ?? 18,
    });
  };

  const cellInput =
    'h-8 rounded-sm border-input px-2 text-sm shadow-none focus-visible:ring-1';

  if (rows.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          icon={Plus}
          headline={t.common.noRecords}
          description={t.common.noRecordsHint}
          actionLabel={readOnly ? undefined : t.common.addRow}
          onAction={addRow}
        />
      </div>
    );
  }

  return (
    <section className={cn('flex flex-col gap-3', className)}>
      {/* ---------- Desktop grid ---------- */}
      <div className="hidden overflow-hidden rounded-lg border border-border bg-surface lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted">
              <tr className="border-b border-border">
                <th className="w-10 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  #
                </th>
                <th className="min-w-[240px] px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t.common.description}
                </th>
                <th className="w-24 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t.common.uom}
                </th>
                <th className="w-32 px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t.common.quantity}
                </th>
                <th className="w-32 px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t.common.rate}
                </th>
                {showDiscount && (
                  <th className="w-24 px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.procurement.discount} %
                  </th>
                )}
                {showTax && (
                  <th className="w-24 px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.masters.gstRate} %
                  </th>
                )}
                {showWbs && (
                  <th className="w-36 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.inventory.costCode}
                  </th>
                )}
                <th className="w-32 px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t.common.amount}
                </th>
                {!readOnly && <th className="w-10 px-2 py-2" />}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {computed.map((row, index) => {
                const errors = errorsByRow[row.id] ?? {};
                return (
                  <tr key={row.id} className="align-top">
                    <td className="px-2 py-2 text-center text-xs text-muted-foreground">{index + 1}</td>

                    {/* Description / item picker */}
                    <td className="px-2 py-2">
                      {itemOptions.length > 0 && !readOnly ? (
                        <SearchableSelectField
                          id={`line-item-${row.id}`}
                          label=""
                          value={row.itemId}
                          onChange={(v) => pickItem(row.id, v)}
                          options={itemOptions}
                          error={errors.description}
                          className="[&_label]:hidden"
                        />
                      ) : (
                        <>
                          <Input
                            value={row.description}
                            onChange={(e) => update(row.id, { description: e.target.value })}
                            readOnly={readOnly}
                            aria-label={t.common.description}
                            className={cn(cellInput, errors.description && 'border-danger')}
                          />
                          {errors.description && (
                            <p role="alert" className="mt-1 text-xs text-danger">
                              {errors.description}
                            </p>
                          )}
                        </>
                      )}
                      {row.itemCode && (
                        <p className="mt-1 text-xs text-muted-foreground">{row.itemCode}</p>
                      )}
                    </td>

                    {/* UOM */}
                    <td className="px-2 py-2">
                      <Input
                        value={row.uomCode}
                        onChange={(e) => update(row.id, { uomCode: e.target.value.toUpperCase() })}
                        readOnly={readOnly}
                        aria-label={t.common.uom}
                        className={cn(cellInput, errors.uomCode && 'border-danger')}
                      />
                    </td>

                    {/* Quantity — 3 decimals */}
                    <td className="px-2 py-2">
                      <Input
                        type="number"
                        step="0.001"
                        value={row.quantity}
                        onChange={(e) =>
                          update(row.id, {
                            quantity: e.target.value === '' ? '' : Number(e.target.value),
                          })
                        }
                        readOnly={readOnly}
                        aria-label={t.common.quantity}
                        className={cn(cellInput, 'num', errors.quantity && 'border-danger')}
                      />
                      {errors.quantity && (
                        <p role="alert" className="mt-1 text-xs text-danger">
                          {errors.quantity}
                        </p>
                      )}
                    </td>

                    {/* Rate — 2 decimals */}
                    <td className="px-2 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={row.rate}
                        onChange={(e) =>
                          update(row.id, { rate: e.target.value === '' ? '' : Number(e.target.value) })
                        }
                        readOnly={readOnly}
                        aria-label={t.common.rate}
                        className={cn(cellInput, 'num', errors.rate && 'border-danger')}
                      />
                      {errors.rate && (
                        <p role="alert" className="mt-1 text-xs text-danger">
                          {errors.rate}
                        </p>
                      )}
                    </td>

                    {showDiscount && (
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={row.discountPct ?? ''}
                          onChange={(e) =>
                            update(row.id, {
                              discountPct: e.target.value === '' ? '' : Number(e.target.value),
                            })
                          }
                          readOnly={readOnly}
                          aria-label={t.procurement.discount}
                          className={cn(cellInput, 'num')}
                        />
                      </td>
                    )}

                    {showTax && (
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={row.gstRate ?? ''}
                          onChange={(e) =>
                            update(row.id, {
                              gstRate: e.target.value === '' ? '' : Number(e.target.value),
                            })
                          }
                          readOnly={readOnly}
                          aria-label={t.masters.gstRate}
                          className={cn(cellInput, 'num')}
                        />
                      </td>
                    )}

                    {showWbs && (
                      <td className="px-2 py-2">
                        <Input
                          value={row.wbsCode ?? ''}
                          onChange={(e) => update(row.id, { wbsCode: e.target.value })}
                          readOnly={readOnly}
                          aria-label={t.inventory.costCode}
                          className={cn(cellInput)}
                          list={wbsOptions.length ? `wbs-options-${row.id}` : undefined}
                        />
                        {wbsOptions.length > 0 && (
                          <datalist id={`wbs-options-${row.id}`}>
                            {wbsOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </datalist>
                        )}
                      </td>
                    )}

                    {/* Auto-calculated amount */}
                    <td className="px-2 py-2 text-right">
                      <span className="num block text-sm font-medium text-foreground">
                        {formatAmount(row.total)}
                      </span>
                      {(row.discountAmount > 0 || row.taxAmount > 0) && (
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {formatAmount(row.taxable)}
                          {row.taxAmount > 0 && ` + ${formatAmount(row.taxAmount)}`}
                        </span>
                      )}
                    </td>

                    {!readOnly && (
                      <td className="px-2 py-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="iconSm"
                          aria-label={t.common.deleteRow}
                          className="text-danger"
                          onClick={() => deleteRow(row.id)}
                        >
                          <Trash2 />
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>

            {/* Totals footer */}
            <tfoot className="border-t-2 border-border bg-surface-muted">
              <tr>
                <td colSpan={3} className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t.common.total}
                </td>
                <td className="num px-2 py-2 text-right text-sm font-medium text-foreground">
                  {formatQuantity(totals.quantity)}
                </td>
                <td />
                {showDiscount && (
                  <td className="num px-2 py-2 text-right text-xs text-muted-foreground">
                    {formatAmount(totals.discount)}
                  </td>
                )}
                {showTax && (
                  <td className="num px-2 py-2 text-right text-xs text-muted-foreground">
                    {formatAmount(totals.tax)}
                  </td>
                )}
                {showWbs && <td />}
                <td className="num px-2 py-2 text-right text-base font-heading text-foreground">
                  {formatAmount(totals.total)}
                </td>
                {!readOnly && <td />}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ---------- Mobile / tablet cards ---------- */}
      <ul className="flex flex-col gap-2 lg:hidden">
        {computed.map((row, index) => {
          const errors = errorsByRow[row.id] ?? {};
          return (
            <li key={row.id} className="rounded-lg border border-border bg-surface p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  #{index + 1}
                </span>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="iconSm"
                    aria-label={t.common.deleteRow}
                    className="text-danger"
                    onClick={() => deleteRow(row.id)}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  {itemOptions.length > 0 && !readOnly ? (
                    <SearchableSelectField
                      id={`m-line-item-${row.id}`}
                      label={t.common.description}
                      value={row.itemId}
                      onChange={(v) => pickItem(row.id, v)}
                      options={itemOptions}
                      error={errors.description}
                    />
                  ) : (
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t.common.description}
                      </span>
                      <Input
                        value={row.description}
                        onChange={(e) => update(row.id, { description: e.target.value })}
                        readOnly={readOnly}
                        className={cn(errors.description && 'border-danger')}
                      />
                    </label>
                  )}
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t.common.quantity}
                  </span>
                  <Input
                    type="number"
                    step="0.001"
                    value={row.quantity}
                    onChange={(e) =>
                      update(row.id, { quantity: e.target.value === '' ? '' : Number(e.target.value) })
                    }
                    readOnly={readOnly}
                    className={cn('num', errors.quantity && 'border-danger')}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t.common.uom}
                  </span>
                  <Input
                    value={row.uomCode}
                    onChange={(e) => update(row.id, { uomCode: e.target.value.toUpperCase() })}
                    readOnly={readOnly}
                    className={cn(errors.uomCode && 'border-danger')}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t.common.rate}
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    value={row.rate}
                    onChange={(e) =>
                      update(row.id, { rate: e.target.value === '' ? '' : Number(e.target.value) })
                    }
                    readOnly={readOnly}
                    className={cn('num', errors.rate && 'border-danger')}
                  />
                </label>

                {showTax && (
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t.masters.gstRate} %
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      value={row.gstRate ?? ''}
                      onChange={(e) =>
                        update(row.id, { gstRate: e.target.value === '' ? '' : Number(e.target.value) })
                      }
                      readOnly={readOnly}
                      className="num"
                    />
                  </label>
                )}
              </div>

              <p className="mt-3 flex items-baseline justify-between border-t border-border pt-2">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t.common.amount}
                </span>
                <span className="num text-base font-heading text-foreground">
                  {formatAmount(row.total)}
                </span>
              </p>
            </li>
          );
        })}

        {/* Mobile totals */}
        <li className="rounded-lg border-2 border-border bg-surface-muted p-3">
          <dl className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t.common.subtotal}</dt>
              <dd className="num font-medium text-foreground">{formatAmount(totals.taxable)}</dd>
            </div>
            {showTax && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t.masters.gstRate}</dt>
                <dd className="num text-foreground">{formatAmount(totals.tax)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-1.5">
              <dt className="font-medium text-foreground">{t.common.grandTotal}</dt>
              <dd className="num text-base font-heading text-foreground">
                {formatAmount(totals.total)}
              </dd>
            </div>
          </dl>
        </li>
      </ul>

      {!readOnly && (
        <div>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus />
            {t.common.addRow}
          </Button>
        </div>
      )}
    </section>
  );
}
