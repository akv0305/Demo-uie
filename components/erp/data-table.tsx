'use client';

import * as React from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
} from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { EmptyState } from './empty-state';
import { TableSkeleton } from './loading-skeleton';

/**
 * (3) DataTable — column definitions, server-style pagination, sortable
 * headers, row click, row actions menu, multi-select, sticky header, column
 * visibility, export buttons and a mobile card fallback below md.
 */
export interface ColumnDef<T> {
  /** Stable key, also used for sorting and column visibility. */
  key: string;
  /** Column title — must come from the terminology config. */
  header: string;
  /** Cell renderer. */
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  /** Hidden by default in the column chooser. */
  hiddenByDefault?: boolean;
  /** Keeps the column out of the mobile card summary. */
  hideOnCard?: boolean;
  className?: string;
  width?: string;
}

export interface RowAction<T> {
  label: string;
  onSelect: (row: T) => void;
  icon?: React.ReactNode;
  destructive?: boolean;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Total across all pages — pagination is server-style. */
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSortChange?: (key: string, dir: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
  rowActions?: RowAction<T>[];
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  isLoading?: boolean;
  showExport?: boolean;
  showColumnToggle?: boolean;
  emptyHeadline?: string;
  emptyDescription?: string;
  /** Primary field shown as the mobile card title. */
  cardTitle?: (row: T) => React.ReactNode;
  cardSubtitle?: (row: T) => React.ReactNode;
  className?: string;
}

const PAGE_SIZES = [10, 25, 50, 100];

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  total,
  page = 1,
  pageSize = 25,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortDir = 'asc',
  onSortChange,
  onRowClick,
  rowActions = [],
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  isLoading = false,
  showExport = true,
  showColumnToggle = true,
  emptyHeadline = t.common.noRecords,
  emptyDescription = t.common.noRecordsHint,
  cardTitle,
  cardSubtitle,
  className,
}: DataTableProps<T>) {
  const [hidden, setHidden] = React.useState<string[]>(() =>
    columns.filter((c) => c.hiddenByDefault).map((c) => c.key),
  );

  const visibleColumns = columns.filter((c) => !hidden.includes(c.key));
  const rowTotal = total ?? rows.length;
  const totalPages = Math.max(1, Math.ceil(rowTotal / pageSize));
  const firstRow = rowTotal === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRow = Math.min(page * pageSize, rowTotal);

  const allSelected = rows.length > 0 && rows.every((r) => selectedKeys.includes(rowKey(r)));
  const someSelected = rows.some((r) => selectedKeys.includes(rowKey(r))) && !allSelected;

  const toggleAll = () => {
    if (!onSelectionChange) return;
    const keys = rows.map(rowKey);
    onSelectionChange(allSelected ? selectedKeys.filter((k) => !keys.includes(k)) : Array.from(new Set([...selectedKeys, ...keys])));
  };

  const toggleOne = (key: string) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedKeys.includes(key) ? selectedKeys.filter((k) => k !== key) : [...selectedKeys, key],
    );
  };

  const handleSort = (col: ColumnDef<T>) => {
    if (!col.sortable || !onSortChange) return;
    const nextDir = sortBy === col.key && sortDir === 'asc' ? 'desc' : 'asc';
    onSortChange(col.key, nextDir);
  };

  const alignClass = (align?: 'left' | 'right' | 'center') =>
    align === 'right' ? 'text-right num' : align === 'center' ? 'text-center' : 'text-left';

  if (isLoading) {
    return <TableSkeleton rows={6} columns={Math.min(visibleColumns.length || 5, 6)} />;
  }

  return (
    <section className={cn('flex flex-col gap-3', className)}>
      {/* Toolbar */}
      {(showExport || showColumnToggle || selectedKeys.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground" role="status">
            {selectedKeys.length > 0
              ? `${selectedKeys.length} ${t.common.rowsSelected}`
              : `${t.common.showing} ${firstRow}–${lastRow} ${t.common.of} ${rowTotal} ${t.common.entries}`}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {showColumnToggle && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Columns3 />
                    <span className="hidden sm:inline">{t.common.columns}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>{t.common.columnVisibility}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columns.map((c) => (
                    <DropdownMenuCheckboxItem
                      key={c.key}
                      checked={!hidden.includes(c.key)}
                      onCheckedChange={(checked) =>
                        setHidden((prev) =>
                          checked ? prev.filter((k) => k !== c.key) : [...prev, c.key],
                        )
                      }
                      onSelect={(e) => e.preventDefault()}
                    >
                      {c.header}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {showExport && (
              <>
                {/* Export is non-functional in the demonstration build. */}
                <Button variant="outline" size="sm" type="button">
                  <FileSpreadsheet />
                  <span className="hidden sm:inline">{t.common.exportExcel}</span>
                </Button>
                <Button variant="outline" size="sm" type="button">
                  <FileText />
                  <span className="hidden sm:inline">{t.common.exportPdf}</span>
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState headline={emptyHeadline} description={emptyDescription} />
      ) : (
        <>
          {/* ---------- Desktop table (md and up) ---------- */}
          <div className="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
            <div className="max-h-[70vh] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-surface-muted">
                  <TableRow className="hover:bg-surface-muted">
                    {selectable && (
                      <TableHead className="w-10">
                        <Checkbox
                          checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                          onCheckedChange={toggleAll}
                          aria-label={t.common.all}
                        />
                      </TableHead>
                    )}
                    {visibleColumns.map((col) => (
                      <TableHead
                        key={col.key}
                        style={col.width ? { width: col.width } : undefined}
                        className={cn(alignClass(col.align), col.className)}
                        aria-sort={
                          sortBy === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined
                        }
                      >
                        {col.sortable ? (
                          <button
                            type="button"
                            onClick={() => handleSort(col)}
                            className={cn(
                              'inline-flex items-center gap-1 uppercase tracking-wide hover:text-foreground',
                              col.align === 'right' && 'flex-row-reverse',
                            )}
                          >
                            {col.header}
                            {sortBy === col.key ? (
                              sortDir === 'asc' ? (
                                <ArrowUp className="h-3 w-3" aria-hidden="true" />
                              ) : (
                                <ArrowDown className="h-3 w-3" aria-hidden="true" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden="true" />
                            )}
                          </button>
                        ) : (
                          col.header
                        )}
                      </TableHead>
                    ))}
                    {rowActions.length > 0 && (
                      <TableHead className="w-12 text-right">{t.common.actions}</TableHead>
                    )}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {rows.map((row) => {
                    const key = rowKey(row);
                    const isSelected = selectedKeys.includes(key);
                    return (
                      <TableRow
                        key={key}
                        data-state={isSelected ? 'selected' : undefined}
                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                        className={cn(onRowClick && 'cursor-pointer')}
                        style={{ height: 'var(--row-height)' }}
                      >
                        {selectable && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleOne(key)}
                              aria-label={key}
                            />
                          </TableCell>
                        )}
                        {visibleColumns.map((col) => (
                          <TableCell key={col.key} className={cn(alignClass(col.align), col.className)}>
                            {col.cell(row)}
                          </TableCell>
                        ))}
                        {rowActions.length > 0 && (
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="iconSm" aria-label={t.common.actions}>
                                  <MoreHorizontal />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {rowActions.map((action) => (
                                  <DropdownMenuItem
                                    key={action.label}
                                    onClick={() => action.onSelect(row)}
                                    className={cn(action.destructive && 'text-danger')}
                                  >
                                    {action.icon}
                                    {action.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* ---------- Mobile card fallback (below md) ---------- */}
          <ul className="flex flex-col gap-2 md:hidden">
            {rows.map((row) => {
              const key = rowKey(row);
              const isSelected = selectedKeys.includes(key);
              const cardColumns = visibleColumns.filter((c) => !c.hideOnCard);
              return (
                <li key={key}>
                  <article
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      'rounded-lg border border-border bg-surface p-3',
                      isSelected && 'border-primary bg-primary/5',
                      onRowClick && 'cursor-pointer',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-2">
                        {selectable && (
                          <span onClick={(e) => e.stopPropagation()} className="mt-0.5">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleOne(key)}
                              aria-label={key}
                            />
                          </span>
                        )}
                        <div className="min-w-0">
                          {cardTitle && (
                            <p className="truncate text-sm font-medium text-foreground">
                              {cardTitle(row)}
                            </p>
                          )}
                          {cardSubtitle && (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {cardSubtitle(row)}
                            </p>
                          )}
                        </div>
                      </div>
                      {rowActions.length > 0 && (
                        <span onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="iconSm" aria-label={t.common.actions}>
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {rowActions.map((action) => (
                                <DropdownMenuItem
                                  key={action.label}
                                  onClick={() => action.onSelect(row)}
                                  className={cn(action.destructive && 'text-danger')}
                                >
                                  {action.icon}
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </span>
                      )}
                    </div>

                    <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-border pt-2.5">
                      {cardColumns.map((col) => (
                        <div key={col.key} className="min-w-0">
                          <dt className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
                            {col.header}
                          </dt>
                          <dd
                            className={cn(
                              'truncate text-sm text-foreground',
                              col.align === 'right' && 'num',
                            )}
                          >
                            {col.cell(row)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </article>
                </li>
              );
            })}
          </ul>

          {/* ---------- Pagination ---------- */}
          <nav
            aria-label="Pagination"
            className="flex flex-col-reverse items-center justify-between gap-3 sm:flex-row"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{t.common.rowsPerPage}</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => onPageSizeChange?.(Number(v))}
              >
                <SelectTrigger className="h-8 w-[76px]" aria-label={t.common.rowsPerPage}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <span className="mr-2 text-xs text-muted-foreground">
                {t.common.page} {page} {t.common.of} {totalPages}
              </span>
              <Button
                variant="outline"
                size="iconSm"
                disabled={page <= 1}
                onClick={() => onPageChange?.(1)}
                aria-label="First page"
              >
                <ChevronsLeft />
              </Button>
              <Button
                variant="outline"
                size="iconSm"
                disabled={page <= 1}
                onClick={() => onPageChange?.(page - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="iconSm"
                disabled={page >= totalPages}
                onClick={() => onPageChange?.(page + 1)}
                aria-label="Next page"
              >
                <ChevronRight />
              </Button>
              <Button
                variant="outline"
                size="iconSm"
                disabled={page >= totalPages}
                onClick={() => onPageChange?.(totalPages)}
                aria-label="Last page"
              >
                <ChevronsRight />
              </Button>
            </div>
          </nav>
        </>
      )}
    </section>
  );
}
