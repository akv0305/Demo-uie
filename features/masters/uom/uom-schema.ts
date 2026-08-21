import { z } from 'zod';

export const UOM_CATEGORIES = [
  'COUNT',
  'WEIGHT',
  'VOLUME',
  'LENGTH',
  'AREA',
  'TIME',
  'OTHER',
] as const;

export const uomSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Code is required')
    .max(10, 'Use 10 characters or fewer')
    .regex(/^[A-Z0-9]+$/, 'Use capital letters and numbers only'),
  name: z.string().trim().min(2, 'Name is required').max(60, 'Use 60 characters or fewer'),
  category: z.enum(UOM_CATEGORIES),
  decimals: z
    .number({ message: 'Enter a number' })
    .int('Whole number only')
    .min(0, 'Cannot be negative')
    .max(3, 'Maximum 3 decimal places'),
  isBaseUnit: z.boolean(),
  isActive: z.boolean(),
  remarks: z.string().trim().max(200, 'Use 200 characters or fewer').optional(),
});

export type UomFormValues = z.infer<typeof uomSchema>;

export const emptyUom: UomFormValues = {
  code: '',
  name: '',
  category: 'COUNT',
  decimals: 0,
  isBaseUnit: false,
  isActive: true,
  remarks: '',
};
