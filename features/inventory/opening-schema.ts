import { z } from 'zod';
import { terminology as t } from '@/config/terminology.config';
import type { OpeningBasis } from '@/lib/data/types';

export const OPENING_BASES: OpeningBasis[] = [
  'PHYSICAL_COUNT',
  'LEGACY_SYSTEM',
  'MANUAL_REGISTER',
];

export const openingSchema = z.object({
  date: z.string().min(1, t.common.requiredField),
  basis: z.enum(['PHYSICAL_COUNT', 'LEGACY_SYSTEM', 'MANUAL_REGISTER']),
  storeSiteId: z.string().min(1, t.inventory.osStoreRequired),
  referenceNo: z.string().optional(),
  preparedBy: z.string().min(1, t.common.requiredField),
  certifiedBy: z.string().optional(),
  remarks: z.string().optional(),
});

export type OpeningFormValues = z.infer<typeof openingSchema>;

export function emptyOpening(defaults: Partial<OpeningFormValues> = {}): OpeningFormValues {
  const today = new Date().toISOString().slice(0, 10);
  return {
    date: today,
    basis: 'PHYSICAL_COUNT',
    storeSiteId: '',
    preparedBy: '',
    ...defaults,
  } as OpeningFormValues;
}
