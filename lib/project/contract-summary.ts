/**
 * Contract position. Pure functions — no data access, so presenters may
 * import this directly.
 *
 * This is the reconciliation an Indian QS draws up every month: start at the
 * agreement value, add what the client has admitted, then show separately what
 * is still being pursued. Admitted and claimed money is never merged into one
 * figure — that distinction is the whole point of the statement.
 */
import { addDays, differenceInCalendarDays, format } from 'date-fns';
import { terminology as t } from '@/config/terminology.config';
import type { Claim, Hindrance, Project, Variation } from '@/lib/data/types';
import { claimTotals, isClosed } from './claim';
import { isPending } from './variation';
import { wbsTotals, type RolledWbsNode } from './wbs-rollup';

/**
 * Deviation beyond this share of the agreement value normally needs a fresh
 * rate analysis and client sanction. 25% is the common Indian position
 * (CPWD/NHAI-style conditions) but it is contract-specific — Q-69.
 */
export const DEFAULT_DEVIATION_LIMIT_PCT = 25;

export type StatementRowKind = 'opening' | 'add' | 'less' | 'subtotal' | 'total';

export interface StatementRow {
  id: string;
  kind: StatementRowKind;
  particulars: string;
  /** Rupees. Signed: a 'less' row carries a negative figure. */
  amount: number;
  note?: string;
}

export interface ContractPosition {
  /** Money */
  agreementValue: number;
  approvedVariations: number;
  approvedVariationCount: number;
  revisedContractValue: number;
  pendingVariations: number;
  pendingVariationCount: number;
  liveClaims: number;
  liveClaimCount: number;
  settledClaims: number;
  anticipatedValue: number;
  deviationPct: number;
  deviationLimitPct: number;
  isDeviationBreached: boolean;

  /** Time */
  originalEndDate: string;
  /** Days flagged as claimable on the hindrance register. */
  eotDaysOnRegister: number;
  /** Days formally sought through claims still live. */
  eotDaysClaimed: number;
  /** Days the client has actually granted on settled claims. */
  eotDaysGranted: number;
  revisedEndDate: string;
  /** Negative once the revised date has passed. */
  daysToRevisedEnd: number;

  /** Execution */
  physicalProgressPct: number;
  financialProgressPct: number;
  costIncurred: number;
  budgetedCost: number;
}

export function contractPosition(
  project: Project | null,
  variations: Variation[],
  claims: Claim[],
  hindrances: Hindrance[],
  wbs: RolledWbsNode[],
  deviationLimitPct = DEFAULT_DEVIATION_LIMIT_PCT,
): ContractPosition {
  const agreementValue = project?.contractValue ?? 0;

  const approved = variations.filter((v) => v.status === 'APPROVED' || v.status === 'CLOSED');
  const approvedVariations = approved.reduce((a, v) => a + (v.approvedAmount ?? 0), 0);
  const pending = variations.filter(isPending);
  const pendingVariations = pending.reduce((a, v) => a + v.proposedAmount, 0);

  const clm = claimTotals(claims);
  const revisedContractValue = agreementValue + approvedVariations;
  const anticipatedValue = revisedContractValue + pendingVariations + clm.liveValue;

  // Deviation is measured against the agreement, on admitted value only.
  const deviationPct = agreementValue > 0 ? (approvedVariations / agreementValue) * 100 : 0;

  // Time. Register days and claimed days are kept apart deliberately: the
  // register is the site position, the claim is the contractual one, and they
  // routinely differ. Summing them would double count.
  const eotDaysOnRegister = hindrances.reduce(
    (a, h) => a + (h.isEotClaimable ? (h.eotClaimDays ?? 0) : 0),
    0,
  );
  const eotDaysClaimed = claims
    .filter((c) => !isClosed(c))
    .reduce((a, c) => a + (c.claimedDays ?? 0), 0);
  const eotDaysGranted = claims.reduce((a, c) => a + (c.settledDays ?? 0), 0);

  const originalEndDate = project?.endDate ?? '';
  const revised = originalEndDate ? addDays(new Date(originalEndDate), eotDaysGranted) : null;

  const wbsT = wbsTotals(wbs);

  return {
    agreementValue,
    approvedVariations,
    approvedVariationCount: approved.length,
    revisedContractValue,
    pendingVariations,
    pendingVariationCount: pending.length,
    liveClaims: clm.liveValue,
    liveClaimCount: clm.liveCount,
    settledClaims: clm.settledValue,
    anticipatedValue,
    deviationPct,
    deviationLimitPct,
    isDeviationBreached: deviationPct > deviationLimitPct,

    originalEndDate,
    eotDaysOnRegister,
    eotDaysClaimed,
    eotDaysGranted,
    revisedEndDate: revised ? format(revised, 'yyyy-MM-dd') : '',
    daysToRevisedEnd: revised ? differenceInCalendarDays(revised, new Date()) : 0,

    physicalProgressPct: project?.physicalProgressPct ?? 0,
    financialProgressPct: project?.financialProgressPct ?? 0,
    costIncurred: wbsT.actual,
    budgetedCost: wbsT.budget,
  };
}

/**
 * The statement as presented: admitted money above the subtotal, money still
 * being pursued below it. A reader can stop at the revised contract value and
 * have a defensible figure.
 */
export function statementRows(p: ContractPosition): StatementRow[] {
  return [
    {
      id: 'agreement',
      kind: 'opening',
      particulars: t.project.cpAgreementValue,
      amount: p.agreementValue,
      note: t.project.cpAgreementNote,
    },
    {
      id: 'variations-approved',
      kind: 'add',
      particulars: t.project.cpVariationsApproved,
      amount: p.approvedVariations,
      note: `${p.approvedVariationCount} ${t.project.cpOrders}`,
    },
    {
      id: 'revised',
      kind: 'subtotal',
      particulars: t.project.cpRevisedValue,
      amount: p.revisedContractValue,
      note: t.project.cpRevisedNote,
    },
    {
      id: 'variations-pending',
      kind: 'add',
      particulars: t.project.cpVariationsPending,
      amount: p.pendingVariations,
      note: `${p.pendingVariationCount} ${t.project.cpAwaiting}`,
    },
    {
      id: 'claims-live',
      kind: 'add',
      particulars: t.project.cpClaimsLive,
      amount: p.liveClaims,
      note: `${p.liveClaimCount} ${t.project.cpUnderPursuit}`,
    },
    {
      id: 'anticipated',
      kind: 'total',
      particulars: t.project.cpAnticipatedValue,
      amount: p.anticipatedValue,
      note: t.project.cpAnticipatedNote,
    },
  ];
}
