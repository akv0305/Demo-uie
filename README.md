# Infra ERP — Stage 1 (Shell & Design System)

## Project Overview
- **Name**: Infra ERP (generic application name, taken from `config/theme.config.ts`)
- **Goal**: Foundation shell and design system for a web-based ERP for an Indian
  infrastructure / EPC construction contractor. **Stage 1 only** — no business
  module screens.
- **Stack**: Next.js (App Router, `output: 'export'`), TypeScript strict,
  Tailwind CSS, shadcn/ui, lucide-react, date-fns. No state library, no chart
  library, no backend, no database, no auth library.

## Completed in this stage
1. **`config/theme.config.ts`** — single source of truth for colours (incl. all
   9 workflow status tokens + success/warning/danger/info), typography, shape,
   density and brand. `lib/theme.ts` converts it to CSS custom properties;
   `tailwind.config.ts` maps semantic names onto those variables.
2. **`config/terminology.config.ts`** — flat typed dictionary of every visible
   label, grouped by area, with `// client may call this …` alias comments.
3. **Data access layer** — `lib/data/types.ts`, `lib/data/adapters/fixtures/*`,
   `lib/data/index.ts` (async-only exports), plus a generic
   localStorage store (`lib/data/store.ts`).
4. **Application shell** — collapsible grouped sidebar, top bar with breadcrumb,
   prominent company + project selectors, global search placeholder,
   notification bell with count, user menu, and a dismissible
   "Sample data — for requirement discussion only." banner.
5. **Shared component library** — all 19 components in `components/erp/`.
6. **Login page** — `/login`, with a 9-role picker that changes navigation.
7. **Task-centric Home** — `/home`: greeting, "Waiting for my action",
   "My pending tasks", "Alerts", role-specific KPI cards, Quick Create row.
8. **Placeholder pages** — 70 routes, each a page header + "In preparation".
9. **Component showcase** — `/_showcase` renders every shared component.

## URLs (local)
| Route | Purpose |
|---|---|
| `/` | Redirects to `/login` |
| `/login` | Sign-in with role picker |
| `/home` | Task-centric home (to-do list, not a menu) |
| `/_showcase` | Full shared component library |
| `/masters/*`, `/project-controls/*`, `/procurement/*`, `/inventory/*`, `/subcontract/*`, `/plant/*`, `/hr/*`, `/documents/*`, `/order-book/*`, `/reports/*`, `/accounts-handover/*`, `/administration/*`, `/portals/*` | Placeholder pages |

## Shared component library (`components/erp/`)
`PageHeader` · `FilterBar` · `DataTable` · `StatusChip` · `ApprovalTimeline` ·
`FormLayout`/`FormSection` · FormField wrappers (text, number, quantity, amount,
select, searchable select, date, date range, textarea, checkbox, radio group,
file upload) · `LineItemsGrid` · `DetailPageLayout` · `AttachmentsPanel` ·
`AuditTrailPanel` · `KpiCard` · `EmptyState` · `LoadingSkeleton`
(table/form/card) · `ErrorState` · `ConfirmDialog` · `ImportWizard` ·
`RecordContextBar` · `HelpHint`

## Data Architecture
- **Models** (`lib/data/types.ts`): Company, Project, Site, Department,
  Employee, CurrentUser, Vendor, Subcontractor, Item, Uom, HsnSac,
  StockBalance, Equipment, WbsNode, DocumentSummary, DocumentLine,
  ApprovalStep, Attachment, AuditEntry, and home-feed types.
- **Storage**: fixtures only (typed TS objects) + `localStorage` for records
  created during the demo and UI preferences. No database in this stage.
- **Flow**: screen → `lib/data` (async) → fixture adapter. Screens never import
  from `adapters/` directly, so a database adapter can replace it later without
  touching any screen.

## Fixture data
Hyderabad-based contractor: 1 parent + 1 SPV + 1 JV company; 4 projects
(SH-19 widening with chainage, ROB Medak, Zaheerabad industrial park,
Batasingaram warehouse); main + site stores; 28 items (OPC 53/PPC cement, TMT
Fe500D 8–25 mm, 20/40 mm aggregate, river/M-sand, GSB, WMM, VG-30 bitumen,
emulsion, RMC M20/M25/M30, AAC blocks, ply, binding wire, HSD, admixture, GI
pipe, electrodes, safety items); 21 plant/fleet items (owned & hired); 10
vendors and 9 subcontractors with valid-format GSTINs; 24 employees;
hierarchical WBS (road: earthwork→GSB→WMM→DBM→BC; bridge:
pile→pile cap→pier→pier cap→girder→deck slab); documents numbered
`UIE/PR/2526/0001`, `UIE/PO/2526/0014`, `UIE/GRN/2526/0032`,
`UIE/WO/2526/0007` spread across **all nine statuses**.

## Conventions enforced
- No hex/rgb literals and no Tailwind palette classes anywhere in
  `app/` or `components/` (verified by grep).
- No hardcoded user-visible strings in components.
- INR with en-IN grouping (`12,45,600`), dates `dd-MMM-yyyy`, quantities 3 dp,
  amounts 2 dp — all via `lib/format.ts`.
- Tables collapse to stacked cards below `md`.
- `noindex, nofollow` on every page; no client company name in titles/metadata.

## Commands
```bash
npm install
npm run build       # static export to ./out
npm run typecheck   # tsc --noEmit (clean)
pm2 start ecosystem.config.cjs   # serves ./out on port 3000
```

## Deployment
- **Platform**: static export (`out/`) — deployable to any static host.
- **Status**: builds clean; 75 routes generated, all returning 200 locally.
- **Note**: the platform's one-click Preview/Deploy is wired for the default
  Hono stack, so this Next.js export needs an explicit static-assets deploy
  step (not part of Stage 1).
- **Last Updated**: 08-Aug-2026

## Not in this stage / recommended next steps
Out of scope now: module transaction screens, charts, real authentication, API
routes, database code, business logic.

Suggested order for Stage 2:
1. Confirm terminology aliases with the client (Indent/MB/RA Bill etc.).
2. Masters CRUD (Items, Vendors, WBS) reusing `FormLayout` + `ImportWizard`.
3. Procurement chain: PR → RFQ → Quotation Comparison → PO.
4. Stores: GRN → Issue → Stock Summary/Ledger.
5. Subcontract: WO → Measurements → RA Bills → Deductions.
6. Replace the fixture adapter with a real database adapter behind the existing
   `lib/data` contract.
7. Wire real approval routing from the Approval Matrix.
