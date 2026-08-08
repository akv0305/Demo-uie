'use client';

import * as React from 'react';
import { Calendar, Check, ChevronsUpDown, Search, Upload, X } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HelpHint, type HelpKey } from './help-hint';

/**
 * (7) FormField wrappers — every variant shows label, required marker,
 * helper text and inline error.
 */
export interface FieldShellProps {
  id: string;
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  helpTopic?: HelpKey;
  className?: string;
  children: React.ReactNode;
}

export function FieldShell({
  id,
  label,
  required,
  helperText,
  error,
  helpTopic,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </Label>
        {helpTopic && <HelpHint topic={helpTopic} />}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : (
        helperText && (
          <p id={`${id}-helper`} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )
      )}
    </div>
  );
}

type BaseProps = Omit<FieldShellProps, 'children'>;

// --- Text ------------------------------------------------------------------
export function TextField({
  value,
  onChange,
  placeholder,
  disabled,
  maxLength,
  ...shell
}: BaseProps & {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}) {
  return (
    <FieldShell {...shell}>
      <Input
        id={shell.id}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={Boolean(shell.error)}
        aria-describedby={shell.error ? `${shell.id}-error` : undefined}
        className={cn(shell.error && 'border-danger')}
      />
    </FieldShell>
  );
}

// --- Number / Quantity / Amount -------------------------------------------
function NumericInput({
  id,
  value,
  onChange,
  decimals,
  placeholder,
  disabled,
  hasError,
  prefix,
  suffix,
}: {
  id: string;
  value?: number | '';
  onChange?: (value: number | '') => void;
  decimals: number;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {prefix}
        </span>
      )}
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        step={decimals > 0 ? `0.${'0'.repeat(decimals - 1)}1` : '1'}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value === '' ? '' : Number(e.target.value))}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={hasError}
        className={cn(
          'num [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none',
          prefix && 'pl-7',
          suffix && 'pr-12',
          hasError && 'border-danger',
        )}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
}

export function NumberField({
  value,
  onChange,
  placeholder,
  disabled,
  ...shell
}: BaseProps & {
  value?: number | '';
  onChange?: (value: number | '') => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <FieldShell {...shell}>
      <NumericInput
        id={shell.id}
        value={value}
        onChange={onChange}
        decimals={0}
        placeholder={placeholder}
        disabled={disabled}
        hasError={Boolean(shell.error)}
      />
    </FieldShell>
  );
}

/** Quantity — 3 decimal places, optional UOM suffix. */
export function QuantityField({
  value,
  onChange,
  uom,
  disabled,
  ...shell
}: BaseProps & {
  value?: number | '';
  onChange?: (value: number | '') => void;
  uom?: string;
  disabled?: boolean;
}) {
  return (
    <FieldShell {...shell}>
      <NumericInput
        id={shell.id}
        value={value}
        onChange={onChange}
        decimals={3}
        disabled={disabled}
        hasError={Boolean(shell.error)}
        suffix={uom}
      />
    </FieldShell>
  );
}

/** Amount — 2 decimal places, rupee prefix. */
export function AmountField({
  value,
  onChange,
  disabled,
  ...shell
}: BaseProps & {
  value?: number | '';
  onChange?: (value: number | '') => void;
  disabled?: boolean;
}) {
  return (
    <FieldShell {...shell}>
      <NumericInput
        id={shell.id}
        value={value}
        onChange={onChange}
        decimals={2}
        disabled={disabled}
        hasError={Boolean(shell.error)}
        prefix={t.common.currencySymbol}
      />
    </FieldShell>
  );
}

// --- Select ----------------------------------------------------------------
export interface Option {
  value: string;
  label: string;
  hint?: string;
}

export function SelectField({
  value,
  onChange,
  options,
  placeholder = t.common.selectPlaceholder,
  disabled,
  ...shell
}: BaseProps & {
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <FieldShell {...shell}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={shell.id} className={cn(shell.error && 'border-danger')}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}

/** Searchable select — type to filter a long master list. */
export function SearchableSelectField({
  value,
  onChange,
  options,
  placeholder = t.common.selectPlaceholder,
  disabled,
  ...shell
}: BaseProps & {
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.hint ?? '').toLowerCase().includes(q),
    );
  }, [options, query]);

  const selected = options.find((o) => o.value === value);

  return (
    <FieldShell {...shell}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={shell.id}
            disabled={disabled}
            aria-expanded={open}
            className={cn(
              'flex h-field w-full items-center justify-between gap-2 rounded-md border border-input bg-surface px-3 text-sm shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-70',
              shell.error && 'border-danger',
            )}
          >
            <span className={cn('truncate text-left', !selected && 'text-muted-foreground')}>
              {selected ? selected.label : placeholder}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(420px,90vw)] p-0">
          <div className="relative border-b border-border">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.common.searchSelectPlaceholder}
              aria-label={t.common.search}
              className="h-9 w-full bg-transparent pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <li className="px-2 py-3 text-center text-sm text-muted-foreground">
                {t.common.noOptions}
              </li>
            )}
            {filtered.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange?.(o.value);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="flex w-full items-start gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
                >
                  <Check
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0',
                      o.value === value ? 'opacity-100 text-primary' : 'opacity-0',
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-foreground">{o.label}</span>
                    {o.hint && (
                      <span className="block truncate text-xs text-muted-foreground">{o.hint}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </FieldShell>
  );
}

// --- Date / Date range -----------------------------------------------------
export function DateField({
  value,
  onChange,
  disabled,
  min,
  max,
  ...shell
}: BaseProps & {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  min?: string;
  max?: string;
}) {
  return (
    <FieldShell {...shell}>
      <div className="relative">
        <Input
          id={shell.id}
          type="date"
          value={value ?? ''}
          min={min}
          max={max}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(shell.error)}
          className={cn('pr-9', shell.error && 'border-danger')}
        />
        <Calendar
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </FieldShell>
  );
}

export function DateRangeField({
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  disabled,
  ...shell
}: BaseProps & {
  fromValue?: string;
  toValue?: string;
  onFromChange?: (value: string) => void;
  onToChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <FieldShell {...shell}>
      <div className="flex items-center gap-2">
        <Input
          id={shell.id}
          type="date"
          value={fromValue ?? ''}
          onChange={(e) => onFromChange?.(e.target.value)}
          disabled={disabled}
          aria-label={t.common.fromDate}
          className={cn(shell.error && 'border-danger')}
        />
        <span className="shrink-0 text-xs text-muted-foreground">{t.common.to}</span>
        <Input
          type="date"
          value={toValue ?? ''}
          min={fromValue}
          onChange={(e) => onToChange?.(e.target.value)}
          disabled={disabled}
          aria-label={t.common.toDate}
          className={cn(shell.error && 'border-danger')}
        />
      </div>
    </FieldShell>
  );
}

// --- Textarea --------------------------------------------------------------
export function TextareaField({
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled,
  maxLength,
  ...shell
}: BaseProps & {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  maxLength?: number;
}) {
  return (
    <FieldShell {...shell}>
      <Textarea
        id={shell.id}
        rows={rows}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={Boolean(shell.error)}
        className={cn(shell.error && 'border-danger')}
      />
    </FieldShell>
  );
}

// --- Checkbox --------------------------------------------------------------
export function CheckboxField({
  checked,
  onChange,
  description,
  disabled,
  id,
  label,
  error,
  helpTopic,
  className,
}: {
  id: string;
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
  error?: string;
  helpTopic?: HelpKey;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-start gap-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(v) => onChange?.(v === true)}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className="mt-0.5"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Label htmlFor={id} className="cursor-pointer">
              {label}
            </Label>
            {helpTopic && <HelpHint topic={helpTopic} />}
          </div>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

// --- Radio group -----------------------------------------------------------
export function RadioGroupField({
  value,
  onChange,
  options,
  orientation = 'vertical',
  disabled,
  ...shell
}: BaseProps & {
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  orientation?: 'vertical' | 'horizontal';
  disabled?: boolean;
}) {
  return (
    <FieldShell {...shell}>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        className={cn(orientation === 'horizontal' && 'flex flex-wrap gap-4')}
      >
        {options.map((o) => (
          <div key={o.value} className="flex items-start gap-2">
            <RadioGroupItem value={o.value} id={`${shell.id}-${o.value}`} className="mt-0.5" />
            <div className="min-w-0">
              <Label htmlFor={`${shell.id}-${o.value}`} className="cursor-pointer">
                {o.label}
              </Label>
              {o.hint && <p className="mt-0.5 text-xs text-muted-foreground">{o.hint}</p>}
            </div>
          </div>
        ))}
      </RadioGroup>
    </FieldShell>
  );
}

// --- File upload -----------------------------------------------------------
export function FileUploadField({
  files = [],
  onFilesChange,
  accept,
  multiple = true,
  disabled,
  ...shell
}: BaseProps & {
  files?: { name: string; sizeKb: number }[];
  onFilesChange?: (files: { name: string; sizeKb: number }[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list).map((f) => ({ name: f.name, sizeKb: Math.round(f.size / 1024) }));
    onFilesChange?.(multiple ? [...files, ...next] : next.slice(0, 1));
  };

  return (
    <FieldShell {...shell}>
      <div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-input bg-surface-muted px-4 py-5 text-center transition-colors',
            'hover:border-primary/50 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-70',
            shell.error && 'border-danger',
          )}
        >
          <Upload className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">{t.common.dragDropHint}</span>
        </button>
        <input
          ref={inputRef}
          id={shell.id}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {files.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between gap-2 rounded-sm border border-border bg-surface px-2 py-1.5 text-sm"
              >
                <span className="truncate text-foreground">{f.name}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">{f.sizeKb} KB</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="iconSm"
                    aria-label={t.common.remove}
                    onClick={() => onFilesChange?.(files.filter((_, index) => index !== i))}
                  >
                    <X />
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </FieldShell>
  );
}
