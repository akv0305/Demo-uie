import { z } from 'zod';

export const HSN_KINDS = ['HSN', 'SAC'] as const;

/** Slabs in force for construction materials and services. */
export const GST_RATES = [0, 0.25, 3, 5, 12, 18, 28] as const;

export const hsnSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, 'Code is required')
      .regex(/^[0-9]+$/, 'Digits only'),
    kind: z.enum(HSN_KINDS),
    description: z
      .string()
      .trim()
      .min(5, 'Description is required')
      .max(200, 'Use 200 characters or fewer'),
    gstRate: z
      .number({ message: 'Select a rate' })
      .min(0, 'Cannot be negative')
      .max(28, 'Maximum 28%'),
    cessRate: z.number().min(0).max(100).optional(),
    effectiveFrom: z.string().min(1, 'Effective date is required'),
    isNonGst: z.boolean(),
    isActive: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.kind === 'HSN' && ![4, 6, 8].includes(v.code.length)) {
      ctx.addIssue({
        code: 'custom',
        path: ['code'],
        message: 'HSN codes are 4, 6 or 8 digits',
      });
    }
    if (v.kind === 'SAC' && v.code.length !== 6) {
      ctx.addIssue({ code: 'custom', path: ['code'], message: 'SAC codes are 6 digits' });
    }
    if (v.isNonGst && v.gstRate !== 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['gstRate'],
        message: 'Items outside GST must have a 0% rate',
      });
    }
  });

export type HsnFormValues = z.infer<typeof hsnSchema>;

export const emptyHsn: HsnFormValues = {
  code: '',
  kind: 'HSN',
  description: '',
  gstRate: 18,
  cessRate: 0,
  effectiveFrom: '2017-07-01',
  isNonGst: false,
  isActive: true,
};

/** Single source of the split rule — used by the form and by the fixtures. */
export function taxSplit(gstRate: number) {
  return { cgstRate: gstRate / 2, sgstRate: gstRate / 2, igstRate: gstRate };
}
