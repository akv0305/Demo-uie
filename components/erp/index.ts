/**
 * Shared component library — the frozen vocabulary every later module reuses.
 * All components are token-driven (theme.config.ts) and label-driven
 * (terminology.config.ts), and are responsive by design.
 */
export { PageHeader, type PageAction } from './page-header'; // 1
export { FilterBar, type FilterState, type FilterBarProps } from './filter-bar'; // 2
export { DataTable, type ColumnDef, type RowAction, type DataTableProps } from './data-table'; // 3
export { StatusChip, ALL_STATUSES } from './status-chip'; // 4
export { ApprovalTimeline } from './approval-timeline'; // 5
export { FormLayout, FormSection } from './form-layout'; // 6
export {
  FieldShell,
  TextField,
  NumberField,
  QuantityField,
  AmountField,
  SelectField,
  SearchableSelectField,
  DateField,
  DateRangeField,
  TextareaField,
  CheckboxField,
  RadioGroupField,
  FileUploadField,
  type Option,
} from './form-field'; // 7
export {
  LineItemsGrid,
  computeLine,
  validateLine,
  type LineRow,
  type LineRowComputed,
} from './line-items-grid'; // 8
export { DetailPageLayout, type SummaryEntry } from './detail-page-layout'; // 9
export { AttachmentsPanel } from './attachments-panel'; // 10
export { AuditTrailPanel } from './audit-trail-panel'; // 11
export { KpiCard } from './kpi-card'; // 12
export { EmptyState } from './empty-state'; // 13
export { LoadingSkeleton, TableSkeleton, FormSkeleton, CardSkeleton } from './loading-skeleton'; // 14
export { ErrorState } from './error-state'; // 15
export { ConfirmDialog, type ConfirmIntent } from './confirm-dialog'; // 16
export { ImportWizard, type ImportPreviewRow, type ImportWizardProps } from './import-wizard'; // 17
export { RecordContextBar } from './record-context-bar'; // 18
export { HelpHint, type HelpKey } from './help-hint'; // 19
