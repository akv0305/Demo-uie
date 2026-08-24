/**
 * Shared Indian tax-identifier validation. Used by every party master
 * (vendor, subcontractor, company, employee) so the rules stay identical.
 */

export const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;
export const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/** GST state codes. Used to cross-check the first two digits of a GSTIN. */
export const STATE_CODES: Record<string, string> = {
  '03': 'Punjab', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan',
  '09': 'Uttar Pradesh', '10': 'Bihar', '19': 'West Bengal', '21': 'Odisha',
  '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '27': 'Maharashtra', '29': 'Karnataka', '32': 'Kerala',
  '33': 'Tamil Nadu', '36': 'Telangana', '37': 'Andhra Pradesh',
};

export const INDIAN_STATES = Object.values(STATE_CODES).sort();

/** The PAN sits inside the GSTIN at positions 3-12. */
export const panInGstin = (gstin: string): string | null =>
  GSTIN_RE.test(gstin) ? gstin.slice(2, 12) : null;

/** State implied by the first two digits of a GSTIN. */
export const stateFromGstin = (gstin: string): string | undefined =>
  GSTIN_RE.test(gstin) ? STATE_CODES[gstin.slice(0, 2)] : undefined;
