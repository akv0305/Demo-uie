# DESIGN SYSTEM — FROZEN COMPONENT CATALOGUE
Version 1.0 · 2026-08-21 · Source of truth: the code in `components/erp/`.

**Read this before writing any screen.** Every module reuses this vocabulary.
Do not create a new component when one of these fits. If a component genuinely
cannot express a requirement, extend it with an OPTIONAL prop (never a breaking
change, never a fork) and record the change here plus a D-xxx in the decision log.

Signatures below are transcribed from source. Where a signature is marked
`NOT TRANSCRIBED`, open the file before first use — do not guess.

---

## 1. Layer rules (recap of 02-ARCHITECTURE §2)
- `app/**/page.tsx` = container. Fetches via `lib/data`, owns state, passes props.
- `features/<module>/*` = presenter. Props only. May import types from `@/lib/data/types`; must NOT import `@/lib/data`, `@/lib/data/store`, or any adapter.
- `components/erp/*` = frozen vocabulary. Generic, domain-agnostic, token-driven.
- `components/ui/*` = shadcn primitives. Do not use directly in a screen if an `erp` wrapper exists.
- Lint enforces the boundaries (D-014).

---

## 2. Token reference

All colour/spacing/typography flows from `config/theme.config.ts` → `lib/theme.ts`
→ CSS variables → Tailwind semantic classes. Never write a hex value or a palette
class (`bg-blue-600`); ESLint will reject it.

**Surface & text**
`bg-background` · `bg-surface` · `bg-surface-muted` · `text-foreground` ·
`text-muted-foreground` · `border-border` · `border-input` · `ring-ring`

**Intent**
`bg-primary` / `text-primary-foreground` · `bg-secondary` / `text-secondary-foreground` ·
`bg-accent` · `text-success` · `text-warning` · `text-danger` · `text-info`

**Status (nine, one per DocumentStatus)**
`status-draft` · `status-submitted` · `status-pendingApproval` · `status-approved` ·
`status-rejected` · `status-returned` · `status-revised` · `status-cancelled` · `status-closed`

**Opacity composition is intended.** Tokens are HSL triplets, so `bg-primary/10`,
`border-danger/30` work. StatusChip uses the `/10` fill + `/30` border + solid text pattern.

**PAIRING RULE (from DEF-014).** Any surface that is not `bg-background` or
`bg-surface` must use its paired foreground token. Navy panel → `text-primary-foreground`,
never `text-foreground`. This caused unreadable text once already.

**Density & layout utilities** (driven by `density: 'comfortable' | 'compact'`)
| Class | Meaning |
|---|---|
| `page-padding` | Page gutters from density tokens |
| `stack-section` | Vertical rhythm between sections |
| `mb-section` | Section bottom gap (used by PageHeader, FilterBar) |
| `p-card` / `px-card` | Card padding |
| `px-page-x` / `-mx-page-x` | Page gutter (sticky footers bleed with the negative form) |
| `h-field` | Standard control height |
| `var(--row-height)` | Table row height |
| `num` | Tabular numerals + right align — **use on every numeric cell** |

**Typography** Inter (self-hosted via `next/font`, D-016), JetBrains Mono for
monospace, 14px base. Headings use `font-heading`.

---

## 3. Component catalogue

Import everything from the barrel: `import { PageHeader, DataTable } from '@/components/erp';`

### (1) PageHeader
```ts
{ title: string; subtitle?: string;
  breadcrumb?: { label: string; href?: string }[];
  primaryAction?: PageAction; secondaryActions?: PageAction[];
  helpTopic?: HelpKey; className?: string }

PageAction = { label: string; onClick?: () => void; href?: string;
  icon?: React.ReactNode; variant?: 'default'|'outline'|'secondary'|'ghost'|'destructive';
  disabled?: boolean }

Secondary actions default to outline, primary to default. Renders <Link> when href given.

(2) FilterBar
FilterState = { companyId?, projectId?, status?: DocumentStatus|'ALL',
                fromDate?, toDate?, search? }  // all string except status
FilterBarProps = { value: FilterState; onChange: (next: FilterState) => void;
  companyOptions?: Option[]; projectOptions?: Option[];
  showStatus?: boolean; showDateRange?: boolean; className?: string }

Controlled. Company/project selects render only if options are supplied. Renders clearable active-filter chips. Search box always visible; other fields collapse below md. Limitation: the shape is fixed — no arbitrary extra filters. Master screens needing e.g. "Item Group" must render an extra SelectField beside it, or we extend FilterState additively (decide at UOM Master, Step 5).

(3) DataTable
ColumnDef<T> = { key: string; header: string; cell: (row: T) => ReactNode;
  sortable?: boolean; align?: 'left'|'right'|'center';
  hiddenByDefault?: boolean; hideOnCard?: boolean; className?: string; width?: string }

RowAction<T> = { label: string; onSelect: (row: T) => void;
  icon?: ReactNode; destructive?: boolean }

DataTableProps<T> = { columns; rows: T[]; rowKey: (row: T) => string;
  total?; page?; pageSize?; onPageChange?; onPageSizeChange?;
  sortBy?; sortDir?: 'asc'|'desc'; onSortChange?: (key, dir) => void;
  onRowClick?; rowActions?; selectable?; selectedKeys?; onSelectionChange?;
  isLoading?; showExport?; showColumnToggle?;
  emptyHeadline?; emptyDescription?;
  cardTitle?: (row: T) => ReactNode; cardSubtitle?: (row: T) => ReactNode; className? }

Pagination is server-style: pass total from the query, not rows.length. Renders TableSkeleton when isLoading, EmptyState when rows is empty. Below md it renders cards — always supply cardTitle/cardSubtitle, and mark noisy columns hideOnCard. Export buttons are decorative in the demo (no handler). align: 'right' automatically applies num.

(4) StatusChip

{ status: DocumentStatus; size?: 'default'|'sm'; className? }
export const ALL_STATUSES: DocumentStatus[]   // the nine, in workflow order

Labels come from terminology.status[...]. Never hand-roll a status pill.

(5) ApprovalTimeline — NOT TRANSCRIBED. Read before use.
(6) FormLayout + FormSection

FormSection { title: string; description?: string; helpTopic?: HelpKey;
  columns?: 1 | 2; children; className? }

FormLayout { children; isDirty?: boolean;
  onSaveDraft?: () => void; onSubmit?: () => void; onCancel?: () => void;
  submitLabel?: string; saveDraftLabel?: string; isSaving?: boolean; className? }
FormLayout renders a <form>, a sticky footer (Cancel / Save Draft / Submit), a beforeunload guard and a discard-changes dialog when isDirty. Buttons appear only if their handler is passed. Use columns={1} for notes, grids and wide tables.

(7) Form fields — all share FieldShell
Common props on every field: id (required), label (required), required?, helperText?, error?, helpTopic?, className?.

Component	Value prop	onChange signature	Notes
TextField	value?: string	(v: string) => void	placeholder, maxLength, disabled
NumberField	value?: number | ''	(v: number | '') => void	0 decimals
QuantityField	value?: number | ''	same	3 decimals, uom? suffix
AmountField	value?: number | ''	same	2 decimals, ₹ prefix
SelectField	value?: string	(v: string) => void	options: Option[]
SearchableSelectField	value?: string	same	type-to-filter; use for any list > ~15
DateField	value?: string (ISO)	(v: string) => void	min, max
DateRangeField	fromValue/toValue	onFromChange/onToChange	
TextareaField	value?: string	(v: string) => void	rows default 3
CheckboxField	checked?: boolean	(c: boolean) => void	flat props, no FieldShell — takes description, not helperText
RadioGroupField	value?: string	(v: string) => void	orientation, Option.hint renders as sub-text
FileUploadField	files?: {name,sizeKb}[]	onFilesChange	drag/drop, demo-only metadata

Option = { value: string; label: string; hint?: string }

hint is shown by SearchableSelectField and RadioGroupField, and is searchable — not by plain SelectField. Errors: pass error (string) and the border turns border-danger with role="alert" text; helperText is hidden while an error shows.

(8) LineItemsGrid — NOT TRANSCRIBED (22 KB, the most complex component).
Exports LineItemsGrid, computeLine, validateLine, types LineRow, LineRowComputed. Read in full before the first PO/PR screen; treat its line maths as the standard for every document with items.

(9) DetailPageLayout — NOT TRANSCRIBED. Exports type SummaryEntry.
(10) AttachmentsPanel · (11) AuditTrailPanel — NOT TRANSCRIBED.
(12) KpiCard · (13) EmptyState · (15) ErrorState · (14) LoadingSkeleton family
(LoadingSkeleton, TableSkeleton, FormSkeleton, CardSkeleton) — NOT TRANSCRIBED. EmptyState takes at least headline and description (used by DataTable).

(16) ConfirmDialog

ConfirmIntent = 'SUBMIT'|'APPROVE'|'REJECT'|'RETURN'|'CANCEL'|'REVISE'|'DELETE'
{ open: boolean; onOpenChange: (open: boolean) => void; intent: ConfirmIntent;
  documentLabel?: string; description?: string;
  onConfirm: (remarks: string) => void }

Remarks are mandatory for REJECT, RETURN, CANCEL, REVISE and enforced inside the component. Title, icon, button variant all derive from intent. Every state transition in the app goes through this dialog — do not build bespoke confirmations.

(17) ImportWizard — NOT TRANSCRIBED. Exports ImportPreviewRow, ImportWizardProps.
Every master with Excel import uses it; read before the Item Master import step.

(18) RecordContextBar — NOT TRANSCRIBED.
(19) HelpHint

{ topic: HelpKey; className? }        // HelpKey = keyof terminology.help

The first-time-ERP-user affordance. Add a help.* terminology key and attach a helpTopic to every non-obvious field, section and page. This is a project requirement, not decoration.

Not in the barrel: components/erp/placeholder-page.tsx (see DEF-018).

4. Standard recipes
List screen — PageHeader (primary action New) → FilterBar → DataTable (rowActions Edit/Activate/Deactivate, onRowClick → detail, cardTitle/cardSubtitle set) → ConfirmDialog for destructive actions. Optional KpiCard row above the filter bar.

Form screen — PageHeader with breadcrumb → FormLayout (isDirty wired to RHF's formState.isDirty) containing 2–6 FormSections → fields with error bound to formState.errors.<field>?.message → footer handles Save Draft / Submit.

Detail screen — PageHeader → RecordContextBar → DetailPageLayout with tabs (Details / linked docs / Attachments / Audit Trail) → ApprovalTimeline where a workflow applies.

5. Rules for changing this system
Additive optional props only. No forks, no breaking signature changes.
Any new component must be justified in a D-xxx and added here in the same commit.
All labels come from terminology.config.ts. No hard-coded English in a component.
Update this file in the same commit as the code change.


**Three findings to record**

`components/erp/placeholder-page.tsx` exists but is missing from the barrel export, so screens must deep-import it — inconsistent with the frozen-vocabulary rule. `PageAction.variant` omits `'success'`, though `Button` clearly supports it (ConfirmDialog uses it), so an Approve action in a page header can't be green without a cast. And `FilterState` is a closed shape, which will bite at the first master needing a domain-specific filter; I'd rather decide that at UOM Master with a real case in front of us than guess now.
