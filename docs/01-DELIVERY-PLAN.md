# DELIVERY PLAN — Demo / Requirement-Gathering Phase
Version 1.0 · Owner: PNM Smart Solutions · Living document, amend as we go.

## 1. Objective
Produce a clickable, realistically populated ERP front-end covering the
Phase 1 module map, and use it to run structured requirement walkthroughs
with the client. Output of this phase = signed-off module specs +
field dictionary, which become the input to the 26-week build.

## 2. Why a clickable spec, not a working MVP
The client has strong domain knowledge and no ERP experience. Abstract
questionnaires will return blank or misleading answers. Showing a screen
populated with *their* materials, *their* road layers and *their*
document numbers makes them correct us — and corrections are requirements.

## 3. Two-instrument rule (important)
A convincing demo makes invisible logic invisible. Every module therefore
needs BOTH:
- **Screen questionnaire** — fields, labels, layout, who does what.
- **Rules questionnaire** — numbering, approval resolution, period
  locking, rate/valuation policy, recovery calculations, edit-after-
  approval behaviour, negative stock, backdating.
Never run a walkthrough with only the first.

## 4. Deliberate probe screens
The client will not raise gaps the demo omits. We therefore plant probes
for known scope risks: plant production output (batching/hot-mix/crusher),
returnable material tracking (shuttering, staging), client billing
register, service POs, hired-equipment hire bills, period/month lock.
These are marked "to be confirmed" on screen — they exist to start a
conversation, not to promise a feature.

## 5. Demo depth tiering (agreed)
- **Deep** (list → form → detail → submit → approval advances → linked
  downstream doc): Masters, Procurement, Inventory/Stores, Subcontractor,
  Project Controls/DPR.
- **Medium** (screens, no chained flow): Core Platform (users/roles/
  approval matrix), Document Management, Plant & Fuel, HRMS/Labour/Expenses.
- **Light** (one representative screen or mock report): Vendor Portal,
  Subcontractor Portal, Tally Export, Order Book MIS, Reports Catalogue.
- **Dashboards**: built properly regardless of tier — management judges the
  whole system by these.

## 6. Build sequence
Each step ends with a tracker update and a session-log entry.

| # | Step | Mode | Status gate |
|---|------|------|-------------|
| 0 | Dev environment working (`dev`, `build`, `typecheck` pass) | Owner | BLOCKER for all code |
| 1 | Rebrand `theme.config.ts` + logo assets | Co-pilot | Navy shell renders from tokens |
| 2 | Self-enforcing lint rules (colour literals, adapter imports) | Co-pilot | `npm run lint` fails on violation |
| 3 | Freeze docs: `03-DESIGN-SYSTEM`, `04-DATA-CONTRACT` | Co-pilot | Signatures recorded from real code |
| 4 | Consolidated `types.ts` extension (UOM + HSN + Item) | Co-pilot | typecheck clean |
| 4b | Install zod, react-hook-form, @hookform/resolvers; write `item.schema.ts` as the reference Zod schema | Co-pilot | typecheck clean |
| 4c | Adopt `features/` folder structure with UOM Master | Co-pilot | Structure frozen before replication |
| 5 | UOM Master — pattern-proving screen | Co-pilot | Round-trip calibration done |
| 6 | HSN/SAC Master | Co-pilot | |
| 7 | **Item Master (full depth) = GOLDEN PATH** | Co-pilot | Frozen as the master template |
| 8 | Remaining 12 masters | Co-pilot | Pattern replication |
| 9 | Document Management | Co-pilot | |
| 10 | Project Controls + DPR | Genspark (novel layout) + co-pilot | |
| 11 | Procurement chain PR→RFQ→Quote→Compare→PO | Co-pilot; Genspark for comparison matrix | |
| 12 | Stores: GRN, Issue, Return, Transfer, Adjustment, Ledger | Co-pilot; Genspark for ledger | |
| 13 | Subcontractor: WO, MB, Bill, Deductions | Co-pilot | |
| 14 | Plant & Fuel | Co-pilot | |
| 15 | HRMS, Labour, Expenses | Co-pilot | |
| 16 | Portals (vendor, subcontractor) | Co-pilot | Isolation demonstrated |
| 17 | Order Book MIS + Tally Export + Reports Catalogue | Co-pilot | |
| 18 | Dashboards (4) | Genspark (charts) | Charting dep decision needed |
| 19 | Netlify deploy + demo walkthrough script | Owner + co-pilot | |
| 20 | Client walkthroughs + questionnaires per module | Owner-led | Sign-off per module |

## 7. Tool policy
- **Co-pilot (default)**: anything matching an existing frozen pattern.
  Zero credit cost. Bottleneck is owner review time, not generation.
- **Genspark AI Developer (rationed)**: novel layouts and charts only —
  dashboards, quotation comparison matrix, stock ledger, DPR. Bank the
  monthly credit refresh for these. Never spend credits on CRUD.
- Historical cost reference: shell ≈ 7,400 credits; rebrand + one partial
  file ≈ 2,500. Assume ~10,000/month available.
- Every Genspark run must end with a status report pasted into
  `09-SESSION-LOG.md`, because that tool loses context between runs.

## 8. Co-pilot working protocol
1. Co-pilot outputs **complete files with exact paths** — not fragments.
2. Owner pastes, runs `npm run typecheck` then `npm run build`.
3. Owner reports **verbatim errors**. No paraphrasing.
4. Co-pilot fixes. Repeat until clean.
5. Owner commits with a message referencing the tracker step.
6. Co-pilot ends every message with a STATE block (see §10).
7. One task per session. When a session gets long, stop, write the
   handoff note, and start fresh with the primer.
8. Co-pilot must ask for any file it needs to modify but has not read.

## 9. Amnesia countermeasures
| Risk | Countermeasure |
|------|----------------|
| Conversation amnesia | Repo is memory. Primer + tracker rebuild context in one paste. |
| Pattern drift across modules | Golden path (Item Master) frozen and referenced by name. |
| Forgotten decisions | `06-DECISION-LOG.md`, numbered D-xxx, never relitigated. |
| Lost open questions | `07-OPEN-QUESTIONS.md`, numbered Q-xxx, with owner. |
| Silent scope creep | Exclusion list in the primer; anything new becomes a CR. |
| Hallucinated component APIs | `03-DESIGN-SYSTEM.md` holds real signatures copied from code. |
| Invented data-layer functions | `04-DATA-CONTRACT.md` holds the real export list. |
| Dependency sprawl | Allowlist in `02-ARCHITECTURE.md`; approval required. |
| Style drift | Lint rules fail the build, not a document. |
| Over-generation beyond review capacity | One file or one screen per exchange. |
| Terminology drift | All labels via `terminology.config.ts` + glossary. |
| Demo work discarded at production handover | Carryover contract in `02-ARCHITECTURE.md`; container/presenter split; Zod shared; fixtures as seed. |
| Second AI agent making unsupervised edits | Agentic IDE features stay OFF. One change at a time, reviewed. See §12. |

## 10. STATE block (co-pilot ends every message with this)

STATE · Step of build sequence · DONE this message: AWAITING: <what the owner must do/report> NEXT: NEW: D-xxx | Q-xxx | DEF-xxx


## 11. Phase 1 exclusions (do not build, do not promise)
Tender/bidding · full finance & accounting · GL · trial balance · P&L ·
balance sheet · bank reconciliation · client RA billing · government
billing formats · real estate sales · customer portal · CRM/leads/sales
quotation/sales order/sales invoicing · payment collection · receivables ·
live e-invoice / e-way bill / GST portal APIs · payment gateway ·
WhatsApp/SMS · native mobile app · statutory payroll return files ·
legal/dispute tracking · land acquisition · facility management ·
historical transaction migration · biometric APIs · government portal
integrations · advanced BI.

"Sales MIS" in Phase 1 = **EPC Order Book / Project Sales MIS Dashboard**
only. Never call it a Sales Module.

## 12. Tooling discipline
The IDE is an **editor**, not a second developer. Autonomous multi-file
agent modes must remain disabled. Rationale: this project's primary
technical risk is pattern drift across 15 modules built by a two-person
team. A second, uncoordinated AI editing files outside the tracker breaks
the single-source-of-truth discipline and produces exactly the drift the
golden-path strategy exists to prevent. Inline autocomplete is acceptable.

## 13. Known risks to flag to the client in writing
- Site connectivity: DPR, fuel, log book and labour attendance happen at
  remote sites; Phase 1 is online-only. Mitigation: mobile-first,
  small-payload, retry-safe forms + day-end Excel upload fallback.
- Change management is a workstream, not an afterthought: super-users per
  module, one-page SOPs, training, parallel run, named daily-entry owner
  per site. Ownership must be agreed (client vs vendor).
- Demo phase consumes calendar time outside the 26 weeks; the 26-week plan
  has no internal buffer and needs a 2–3 week contingency reserve with a
  pre-agreed de-scope list.
- 20+ reports and 4 dashboards need a single report framework built once,
  not 24 bespoke screens. Cap dashboard KPIs (suggest max 8 each) at
  requirement sign-off.
