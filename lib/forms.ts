import { z } from 'zod';

/**
 * Shared form-value helpers. `NumberField` emits '' when the user clears an
 * input, so any optional numeric field is `number | ''` in form state and
 * `number | undefined` in the domain. These convert between the two.
 */

/** A number input the user may leave blank. */
export type Numeric = number | '';

/** Zod field for an optional number. Accepts a number or a cleared input. */
export const optionalNumber = () => z.union([z.number(), z.literal('')]).optional();

/** Form → domain. Blank becomes undefined, so the key is omitted rather than zeroed. */
export const num = (v: Numeric | undefined): number | undefined =>
  v === '' || v === undefined ? undefined : v;

/** Form → domain where the domain field is required. */
export const numOr = (v: Numeric | undefined, fallback: number): number => num(v) ?? fallback;

/** Domain → form. undefined becomes '' so the input renders empty, not 0. */
export const toNumeric = (v: number | null | undefined): Numeric =>
  v === null || v === undefined ? '' : v;

/** Form → domain for optional text. Blank or whitespace becomes undefined. */
export const str = (v: string | undefined): string | undefined => {
  const s = v?.trim();
  return s ? s : undefined;
};


