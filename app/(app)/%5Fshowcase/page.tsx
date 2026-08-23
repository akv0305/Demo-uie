'use client';

import * as React from 'react';
import { Check, Download, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import { themeConfig } from '@/config/theme.config';
import {
  getCurrentUser,
  listAttachments,
  listAuditEntries,
  listCompanies,
  listDocumentLines,
  listDocuments,
  listItems,
  listProjects,
} from '@/lib/data';
import type {
  Attachment,
  AuditEntry,
  DocumentSummary,
} from '@/lib/data/types';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  ALL_STATUSES,
  AmountField,
  ApprovalTimeline,
  AttachmentsPanel,
  AuditTrailPanel,
  CheckboxField,
  ConfirmDialog,
  type ConfirmIntent,
  type ColumnDef,
  DataTable,
  DateField,
  DateRangeField,
  DetailPageLayout,
  EmptyState,
  ErrorState,
  FilterBar,
  type FilterState,
  FormLayout,
  FormSection,
  HelpHint,
  ImportWizard,
  KpiCard,
  LineItemsGrid,
  type LineRow,
  type Option,
  NumberField,
  PageHeader,
  QuantityField,
  RadioGroupField,
  RecordContextBar,
  SearchableSelectField,
  SelectField,
  StatusChip,
  TableSkeleton,
  FormSkeleton,
  CardSkeleton,
  TextField,
  TextareaField,
  FileUploadField,
} from '@/components/erp';
import { Button } from '@/components/ui/button';
import { useApp } from '@/components/shell/app-context';

/** Section wrapper used only by this showcase page. */
function Showcase({
  id,
  index,
  title,
  note,
  children,
}: {
  id: string;
  index: number;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32 border-t border-border pt-section">
      <h2 className="text-base font-heading text-foreground">
        <span className="mr-2 text-muted-foreground">{index}.</span>
        {title}
      </h2>
      {note && <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ShowcasePage() {
  const { company, project, site } = useApp();

  const [documents, setDocuments] = React.useState<DocumentSummary[]>([]);
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [audit, setAudit] = React.useState<AuditEntry[]>([]);
  const [itemOptions, setItemOptions] = React.useState<
    (Option & { uomCode?: string; gstRate?: number })[]
  >([]);
  const [companyOptions, setCompanyOptions] = React.useState<Option[]>([]);
  const [projectOptions, setProjectOptions] = React.useState<Option[]>([]);
  const [lines, setLines] = React.useState<LineRow[]>([]);

  // Interactive state
  const [filters, setFilters] = React.useState<FilterState>({});
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [sortBy, setSortBy] = React.useState('date');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = React.useState<string[]>([]);
  const [dialogIntent, setDialogIntent] = React.useState<ConfirmIntent | null>(null);
  const [text, setText] = React.useState('');
  const [amount, setAmount] = React.useState<number | ''>(1245600);
  const [quantity, setQuantity] = React.useState<number | ''>(285.5);
  const [count, setCount] = React.useState<number | ''>(12);
  const [date, setDate] = React.useState('2026-08-08');
  const [rangeFrom, setRangeFrom] = React.useState('2026-08-01');
  const [rangeTo, setRangeTo] = React.useState('2026-08-31');
  const [selectValue, setSelectValue] = React.useState('');
  const [searchValue, setSearchValue] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [checked, setChecked] = React.useState(true);
  const [radio, setRadio] = React.useState('OWNED');
  const [files, setFiles] = React.useState<{ name: string; sizeKb: number }[]>([]);

  React.useEffect(() => {
    void (async () => {
      const [docs, atts, auditRows, items, companies, projects, docLines] = await Promise.all([
        listDocuments({ pageSize: 100 }),
        listAttachments('documents', 'DOC-PO-0014'),
        listAuditEntries('documents', 'DOC-PO-0014'),
        listItems({ pageSize: 100 }),
        listCompanies(),
        listProjects(),
        listDocumentLines('DOC-PO-0014'),
        getCurrentUser(),
      ]);
      setDocuments(docs.rows);
      setAttachments(atts);
      setAudit(auditRows);
      setItemOptions(
        items.rows.map((i) => ({
          value: i.id,
          label: i.name,
          hint: `${i.code} · ${i.stockUomCode}`,
          uomCode: i.stockUomCode,
          gstRate: i.gstRate,
        })),
      );
      setCompanyOptions(companies.map((c) => ({ value: c.id, label: c.name })));
      setProjectOptions(projects.map((p) => ({ value: p.id, label: p.shortName })));
      setLines(
        docLines.map((l) => ({
          id: l.id,
          itemCode: l.itemCode,
          description: l.description,
          uomCode: l.uomCode,
          quantity: l.quantity,
          rate: l.rate,
          discountPct: l.discountPct ?? 0,
          gstRate: l.gstRate ?? 18,
          wbsCode: l.wbsCode,
        })),
      );
    })();
  }, []);

  // Client-side slice purely to demonstrate server-style pagination controls.
  const pagedDocuments = React.useMemo(
    () => documents.slice((page - 1) * pageSize, page * pageSize),
    [documents, page, pageSize],
  );

  const columns: ColumnDef<DocumentSummary>[] = React.useMemo(
    () => [
      {
        key: 'documentNo',
        header: t.common.documentNo,
        sortable: true,
        cell: (row) => <span className="font-mono text-xs text-foreground">{row.documentNo}</span>,
      },
      { key: 'date', header: t.common.date, sortable: true, cell: (row) => formatDate(row.date) },
      {
        key: 'title',
        header: t.common.description,
        cell: (row) => <span className="block max-w-[320px] truncate">{row.title}</span>,
        hideOnCard: true,
      },
      {
        key: 'partyName',
        header: t.masters.vendorName,
        cell: (row) => row.partyName ?? '—',
        hiddenByDefault: true,
      },
      {
        key: 'amount',
        header: t.common.amount,
        align: 'right',
        sortable: true,
        cell: (row) => (row.amount ? formatCurrency(row.amount) : '—'),
      },
      { key: 'status', header: t.common.status, cell: (row) => <StatusChip status={row.status} size="sm" /> },
      {
        key: 'createdByName',
        header: t.common.createdBy,
        cell: (row) => row.createdByName,
        hiddenByDefault: true,
      },
    ],
    [],
  );

  const approvalSample = documents.find((d) => d.status === 'PENDING_APPROVAL')?.approvals ?? [];
  const detailDoc = documents.find((d) => d.id === 'DOC-PO-0014');

  return (
    <div className="stack-section">
      <PageHeader
        title={t.nav.showcase}
        subtitle={`${themeConfig.brand.appName} — every shared component below is driven only by config/theme.config.ts and config/terminology.config.ts. Changing either file restyles or relabels all of them.`}
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.showcase }]}
        primaryAction={{ label: t.common.save, icon: <Check /> }}
        secondaryActions={[{ label: t.common.exportExcel, icon: <Download /> }]}
      />

      {/* ---- Design tokens ---- */}
      <section className="rounded-lg border border-border bg-surface p-card">
        <h2 className="text-base font-heading text-foreground">Design tokens</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Semantic colours resolved from the theme config. No component contains a literal colour.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {[
            ['background', 'bg-background'],
            ['surface', 'bg-surface'],
            ['surfaceMuted', 'bg-surface-muted'],
            ['primary', 'bg-primary'],
            ['secondary', 'bg-secondary'],
            ['accent', 'bg-accent'],
            ['border', 'bg-border'],
            ['success', 'bg-success'],
            ['warning', 'bg-warning'],
            ['danger', 'bg-danger'],
            ['info', 'bg-info'],
            ['ring', 'bg-ring'],
          ].map(([name, cls]) => (
            <div key={name} className="flex flex-col gap-1.5">
              <span className={`h-10 w-full rounded-md border border-border ${cls}`} />
              <span className="truncate text-xs text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Density</dt>
            <dd className="text-foreground">{themeConfig.density}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Base size</dt>
            <dd className="text-foreground">{themeConfig.typography.baseFontSize}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Radius</dt>
            <dd className="text-foreground">{themeConfig.shape.radiusMd}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Heading weight</dt>
            <dd className="text-foreground">{themeConfig.typography.headingWeight}</dd>
          </div>
        </dl>
      </section>

      {/* 1 */}
      <Showcase id="page-header" index={1} title="PageHeader" note="Rendered at the top of this page.">
        <PageHeader
          title={t.procurement.purchaseOrders}
          subtitle="Title, subtitle, breadcrumb, primary and secondary actions."
          breadcrumb={[{ label: t.nav.groupProcurement }, { label: t.procurement.purchaseOrders }]}
          primaryAction={{ label: t.common.addRow, icon: <Plus /> }}
          secondaryActions={[{ label: t.common.exportPdf, icon: <Download /> }]}
          helpTopic="purchaseOrder"
          className="mb-0 rounded-lg border border-border bg-surface p-card"
        />
      </Showcase>

      {/* 18 — shown early because it belongs above transaction content */}
      <Showcase
        id="record-context-bar"
        index={18}
        title="RecordContextBar"
        note="Thin strip showing Company, Project and Site so users never lose context."
      >
        <RecordContextBar
          companyName={company?.name}
          projectName={project?.shortName}
          siteName={site?.name}
          className="mb-0"
        />
      </Showcase>

      {/* 2 */}
      <Showcase
        id="filter-bar"
        index={2}
        title="FilterBar"
        note="Collapsible below md. Active filters appear as clearable chips."
      >
        <FilterBar
          value={filters}
          onChange={setFilters}
          companyOptions={companyOptions}
          projectOptions={projectOptions}
          className="mb-0"
        />
      </Showcase>

      {/* 3 */}
      <Showcase
        id="data-table"
        index={3}
        title="DataTable"
        note="Sortable headers, multi-select, row actions, column visibility, sticky header, pagination and a stacked card layout below md."
      >
        <DataTable
          columns={columns}
          rows={pagedDocuments}
          rowKey={(row) => row.id}
          total={documents.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
          sortBy={sortBy}
          sortDir={sortDir}
          onSortChange={(key, dir) => {
            setSortBy(key);
            setSortDir(dir);
          }}
          selectable
          selectedKeys={selected}
          onSelectionChange={setSelected}
          rowActions={[
            { label: t.common.view, icon: <Eye />, onSelect: () => undefined },
            { label: t.common.edit, icon: <Pencil />, onSelect: () => undefined },
            { label: t.common.delete, icon: <Trash2 />, onSelect: () => undefined, destructive: true },
          ]}
          onRowClick={() => undefined}
          cardTitle={(row) => row.documentNo}
          cardSubtitle={(row) => row.title}
        />
      </Showcase>

      {/* 4 */}
      <Showcase
        id="status-chip"
        index={4}
        title="StatusChip"
        note="All nine workflow statuses, each using its own status token."
      >
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface p-card">
          {ALL_STATUSES.map((s) => (
            <StatusChip key={s} status={s} />
          ))}
        </div>
      </Showcase>

      {/* 5 */}
      <Showcase
        id="approval-timeline"
        index={5}
        title="ApprovalTimeline"
        note="The pending level is highlighted and a plain-language line names who the document waits with."
      >
        <div className="rounded-lg border border-border bg-surface p-card">
          <ApprovalTimeline steps={approvalSample} />
        </div>
      </Showcase>

      {/* 6 + 7 */}
      <Showcase
        id="form-layout"
        index={6}
        title="FormLayout & FormField wrappers (7)"
        note="Two columns on desktop, one on mobile, sticky footer with Save Draft / Submit / Cancel, and an unsaved-changes warning. Every field shows label, required marker, helper text and inline error."
      >
        <FormLayout
          isDirty={text.length > 0}
          onSaveDraft={() => undefined}
          onSubmit={() => undefined}
          onCancel={() => undefined}
        >
          <FormSection title={t.detail.tabDetails} helpTopic="purchaseRequisition">
            <TextField
              id="sc-text"
              label={t.masters.vendorName}
              value={text}
              onChange={setText}
              required
              helperText="Free text field."
            />
            <TextField
              id="sc-text-error"
              label={t.masters.gstin}
              value=""
              error={t.common.requiredField}
              required
            />
            <NumberField id="sc-number" label={t.masters.creditDays} value={count} onChange={setCount} />
            <QuantityField
              id="sc-qty"
              label={t.common.quantity}
              value={quantity}
              onChange={setQuantity}
              uom="CUM"
              helperText="Three decimal places."
            />
            <AmountField
              id="sc-amount"
              label={t.common.amount}
              value={amount}
              onChange={setAmount}
              helperText="Two decimals, en-IN grouping."
            />
            <SelectField
              id="sc-select"
              label={t.nav.project}
              value={selectValue}
              onChange={setSelectValue}
              options={projectOptions}
              required
            />
            <SearchableSelectField
              id="sc-search-select"
              label={t.masters.items}
              value={searchValue}
              onChange={setSearchValue}
              options={itemOptions}
              helperText="Type to filter a long master list."
            />
            <DateField id="sc-date" label={t.common.date} value={date} onChange={setDate} required />
            <DateRangeField
              id="sc-date-range"
              label={t.common.dateRange}
              fromValue={rangeFrom}
              toValue={rangeTo}
              onFromChange={setRangeFrom}
              onToChange={setRangeTo}
            />
            <RadioGroupField
              id="sc-radio"
              label={t.plant.ownership}
              value={radio}
              onChange={setRadio}
              orientation="horizontal"
              options={[
                { value: 'OWNED', label: t.plant.owned },
                { value: 'HIRED', label: t.plant.hired },
              ]}
            />
          </FormSection>

          <FormSection title={t.common.narration} columns={1}>
            <TextareaField
              id="sc-textarea"
              label={t.common.remarks}
              value={notes}
              onChange={setNotes}
              rows={3}
            />
            <CheckboxField
              id="sc-checkbox"
              label={t.masters.isCapitalItem}
              checked={checked}
              onChange={setChecked}
              description="Capital items are tracked in the asset register."
            />
            <FileUploadField
              id="sc-file"
              label={t.common.attachments}
              files={files}
              onFilesChange={setFiles}
            />
          </FormSection>
        </FormLayout>
      </Showcase>

      {/* 8 */}
      <Showcase
        id="line-items-grid"
        index={8}
        title="LineItemsGrid"
        note="Add and delete rows, inline validation, auto-calculated amount columns and a totals footer. Selecting a master item pulls its UOM and GST rate through."
      >
        <LineItemsGrid rows={lines} onChange={setLines} itemOptions={itemOptions} />
      </Showcase>

      {/* 9 */}
      <Showcase
        id="detail-page-layout"
        index={9}
        title="DetailPageLayout"
        note="Document number and status, key-value summary, and tabbed body: Details, Line Items, Attachments, Approvals, Audit Trail."
      >
        {detailDoc && (
          <div className="rounded-lg border border-border bg-surface p-card">
            <DetailPageLayout
              documentNo={detailDoc.documentNo}
              title={detailDoc.title}
              status={detailDoc.status}
              summary={[
                { label: t.common.date, value: formatDate(detailDoc.date) },
                { label: t.masters.vendorName, value: detailDoc.partyName ?? '—' },
                { label: t.common.amount, value: formatCurrency(detailDoc.amount ?? 0) },
                { label: t.common.createdBy, value: detailDoc.createdByName },
                { label: t.masters.paymentTerms, value: '30 days from invoice' },
                { label: t.nav.project, value: project?.shortName ?? '—' },
                { label: t.inventory.fromStore, value: site?.name ?? '—' },
                { label: t.common.status, value: <StatusChip status={detailDoc.status} size="sm" /> },
              ]}
              actions={[
                { label: t.common.edit, icon: <Pencil /> },
                { label: t.common.approve, icon: <Check /> },
              ]}
              detailsSlot={
                <p className="text-sm text-muted-foreground">
                  Module-specific detail content is placed here by each screen.
                </p>
              }
              lineItemsSlot={<LineItemsGrid rows={lines} onChange={setLines} readOnly />}
              attachments={attachments}
              approvals={detailDoc.approvals}
              auditEntries={audit}
            />
          </div>
        )}
      </Showcase>

      {/* 10 */}
      <Showcase
        id="attachments-panel"
        index={10}
        title="AttachmentsPanel"
        note="File list with category, uploader, date and expiry flags, plus a drag-and-drop upload area."
      >
        <AttachmentsPanel attachments={attachments} />
      </Showcase>

      {/* 11 */}
      <Showcase
        id="audit-trail-panel"
        index={11}
        title="AuditTrailPanel"
        note="Chronological actions with user, timestamp and changed-field summary."
      >
        <AuditTrailPanel entries={audit} />
      </Showcase>

      {/* 12 */}
      <Showcase
        id="kpi-card"
        index={12}
        title="KpiCard"
        note="Label, large value, unit, comparison line, trend indicator and drill-down link. A rising figure is not always good news, so the trend colour is driven separately."
      >
        <div className="grid grid-cols-1 gap-section sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label={t.masters.physicalProgress}
            value="46.8"
            unit="%"
            comparison="3.2% gained in July 2026"
            trend="UP"
            trendIsGood
            href="/project-controls/project-dashboard"
          />
          <KpiCard
            label={t.project.actualCost}
            value="78.24"
            unit={t.common.inCrore}
            comparison="4.6% above budget to date"
            trend="UP"
            trendIsGood={false}
          />
          <KpiCard
            label={t.inventory.stockValue}
            value="1,42,68,540"
            unit={t.common.currencySymbol}
            comparison="Across 4 stores"
            trend="FLAT"
          />
          <KpiCard
            label={t.home.lowStock}
            value="8"
            unit="items"
            comparison="3 more than last week"
            trend="DOWN"
            trendIsGood
          />
        </div>
      </Showcase>

      {/* 13 */}
      <Showcase id="empty-state" index={13} title="EmptyState">
        <EmptyState
          headline={t.common.noRecords}
          description={t.common.noRecordsHint}
          actionLabel={t.common.addRow}
          onAction={() => undefined}
        />
      </Showcase>

      {/* 14 */}
      <Showcase id="loading-skeleton" index={14} title="LoadingSkeleton" note="Table, form and card variants.">
        <div className="stack-section">
          <TableSkeleton rows={4} columns={5} />
          <FormSkeleton fields={4} />
          <CardSkeleton count={4} />
        </div>
      </Showcase>

      {/* 15 */}
      <Showcase id="error-state" index={15} title="ErrorState">
        <ErrorState onRetry={() => undefined} />
      </Showcase>

      {/* 16 */}
      <Showcase
        id="confirm-dialog"
        index={16}
        title="ConfirmDialog"
        note="Reject, Return, Cancel and Revise require remarks; Submit and Approve do not."
      >
        <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-surface p-card">
          {(['SUBMIT', 'APPROVE', 'REJECT', 'RETURN', 'CANCEL', 'REVISE'] as ConfirmIntent[]).map(
            (intent) => (
              <Button key={intent} variant="outline" size="sm" onClick={() => setDialogIntent(intent)}>
                {intent}
              </Button>
            ),
          )}
        </div>
        <ConfirmDialog
          open={dialogIntent !== null}
          onOpenChange={(open) => !open && setDialogIntent(null)}
          intent={dialogIntent ?? 'SUBMIT'}
          documentLabel="UIE/PO/2526/0014"
          onConfirm={() => undefined}
        />
      </Showcase>

      {/* 17 */}
      <Showcase
        id="import-wizard"
        index={17}
        title="ImportWizard"
        note="Four steps ending in a result summary of rows imported and rows failed."
      >
        <ImportWizard
          columns={[
            { key: 'code', header: t.masters.itemCode },
            { key: 'name', header: t.masters.itemName },
            { key: 'uom', header: t.common.uom },
            { key: 'rate', header: t.common.rate },
          ]}
          previewRows={[
            { rowNo: 2, values: { code: 'CEM-OPC53', name: 'Cement OPC 53 Grade', uom: 'BAG', rate: '392.50' } },
            { rowNo: 3, values: { code: 'STL-TMT12', name: 'TMT Bar Fe500D 12 mm', uom: 'MT', rate: '58400.00' } },
            {
              rowNo: 4,
              values: { code: '', name: 'Coarse Aggregate 20 mm', uom: 'CUM', rate: '1180.00' },
              errors: [`${t.masters.itemCode}: ${t.common.requiredField}`],
            },
            {
              rowNo: 5,
              values: { code: 'BIT-VG30', name: 'Bitumen VG-30', uom: 'XX', rate: '-52800' },
              errors: [`${t.common.uom}: invalid value`, `${t.common.rate}: must be greater than zero`],
            },
          ]}
        />
      </Showcase>

      {/* 19 */}
      <Showcase
        id="help-hint"
        index={19}
        title="HelpHint"
        note="Short plain-English explanations for first-time ERP users, sourced from the terminology config."
      >
        <ul className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-card">
          {(
            [
              ['purchaseRequisition', t.procurement.purchaseRequisition],
              ['grn', t.inventory.grn],
              ['measurementSheet', t.subcontract.measurementSheet],
              ['retention', t.subcontract.retention],
              ['wbs', t.masters.wbs],
            ] as const
          ).map(([topic, label]) => (
            <li key={topic} className="flex items-center gap-2 text-sm text-foreground">
              {label}
              <HelpHint topic={topic} />
            </li>
          ))}
        </ul>
      </Showcase>
    </div>
  );
}
