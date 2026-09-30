import { z } from 'zod';
import { terminology as t } from '@/config/terminology.config';

export const VARIATION_CATEGORIES = [
  'EXTRA_ITEM',
  'DEVIATION_QTY',
  'SUBSTITUTED_ITEM',
  'DESIGN_CHANGE',
  'SCOPE_ADDITION',
  'OMISSION',
] as const;

export const VARIATION_ORIGINS = [
  'CLIENT_INSTRUCTION',
  'SITE_CONDITION',
  'DESIGN_REVISION',
  'STATUTORY',
  'CONTRACTOR_PROPOSAL',
] as const;

export const variationSchema = z
  .object({
    projectId: z.string().min(1, t.common.requiredField),
    siteId: z.string().min(1, t.common.requiredField),
    date: z.string().min(1, t.common.requiredField),
    category: z.enum(VARIATION_CATEGORIES),
    origin: z.enum(VARIATION_ORIGINS),
    description: z.string().trim().min(10, t.project.varDescriptionRequired).max(600),
    /** '' = a wholly new item with no BOQ parent. */
    wbsId: z.string(),
    location: z.string().max(80),
    uomCode: z.string(),
    quantity: z.union([z.number().nonnegative(), z.literal('')]),
    /** Rupees per unit. */
    rate: z.union([z.number().nonnegative(), z.literal('')]),
    /** Rupees. Kept as the source of truth even when quantity x rate is available. */
    proposedAmount: z.number().positive(t.project.varAmountRequired),
    approvedAmount: z.union([z.number().nonnegative(), z.literal('')]),
    isDecided: z.boolean(),
    clientRefNo: z.string().max(40),
    clientRefDate: z.string(),
    needsRateAnalysis: z.boolean(),
    timeExtensionDays: z.union([z.number().int().nonnegative(), z.literal('')]),
    remarks: z.string().max(600),
  })
  .superRefine((v, ctx) => {
    // An admitted figure without a decision would overstate the certified position.
    if (!v.isDecided && v.approvedAmount !== '') {
      ctx.addIssue({
        code: 'custom',
        path: ['approvedAmount'],
        message: t.project.varApprovedWithoutDecision,
      });
    }
  });

export type VariationFormValues = z.infer<typeof variationSchema>;

export const emptyVariation = (projectId: string, siteId: string): VariationFormValues => ({
  projectId,
  siteId,
  date: '',
  category: 'EXTRA_ITEM',
  origin: 'SITE_CONDITION',
  description: '',
  wbsId: '',
  location: '',
  uomCode: '',
  quantity: '',
  rate: '',
  proposedAmount: 0,
  approvedAmount: '',
  isDecided: false,
  clientRefNo: '',
  clientRefDate: '',
  needsRateAnalysis: false,
  timeExtensionDays: '',
  remarks: '',
});
