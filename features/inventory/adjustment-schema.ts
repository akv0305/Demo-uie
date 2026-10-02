import { z } from 'zod';
import { terminology as t } from '@/config/terminology.config';
import type { AdjustmentType } from '@/lib/data/types';

export const ADJUSTMENT_TYPES: AdjustmentType[] = [
  'PHYSICAL_VERIFICATION',
  'DAMAGE',
  'THEFT',
  'EXPIRY',
  'MEASUREMENT_CORRECTION',
  'WRITE_OFF',
];

/** Types that are a write-down rather than a count, so the reason is mandatory. */
const NEEDS_REASON: AdjustmentType[] = ['DAMAGE', 'THEFT', 'EXPIRY', 'WRITE_OFF'];

export const adjustmentSchema = z
  .object({
    date: z.string().min(1, t.common.requiredField),
    adjustmentType: z.enum([
      'PHYSICAL_VERIFICATION',
      'DAMAGE',
      'THEFT',
      'EXPIRY',
      'MEASUREMENT_CORRECTION',
      'WRITE_OFF',
    ]),
    storeSiteId: z.string().min(1, t.inventory.saStoreRequired),
    countSheetNo: z.string().optional(),
    reason: z.string().optional(),
    countedBy: z.string().min(1, t.common.requiredField),
    verifiedBy: z.string().optional(),
    remarks: z.string().optional(),
  })
  .refine(
    (v) => !NEEDS_REASON.includes(v.adjustmentType) || !!v.reason?.trim(),
    { message: t.inventory.saReasonRequired, path: ['reason'] },
  );

export type AdjustmentFormValues = z.infer<typeof adjustmentSchema>;

export function emptyAdjustment(
  defaults: Partial<AdjustmentFormValues> = {},
): AdjustmentFormValues {
  const today = new Date().toISOString().slice(0, 10);
  return {
    date: today,
    adjustmentType: 'PHYSICAL_VERIFICATION',
    storeSiteId: '',
    countedBy: '',
    ...defaults,
  } as AdjustmentFormValues;
}
