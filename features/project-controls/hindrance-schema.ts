import { z } from 'zod';
import { terminology as t } from '@/config/terminology.config';

export const HINDRANCE_CATEGORIES = [
  'LAND_ACQUISITION',
  'DRAWINGS_APPROVAL',
  'UTILITY_SHIFTING',
  'STATUTORY_PERMISSION',
  'WEATHER',
  'CLIENT_MATERIAL',
  'PAYMENT_DELAY',
  'LABOUR_SHORTAGE',
  'EQUIPMENT_BREAKDOWN',
  'LAW_AND_ORDER',
  'OTHER',
] as const;

export const RESPONSIBILITIES = ['CLIENT', 'CONTRACTOR', 'EXTERNAL'] as const;

export const hindranceSchema = z
  .object({
    projectId: z.string().min(1, t.common.requiredField),
    siteId: z.string().min(1, t.common.requiredField),
    fromDate: z.string().min(1, t.common.requiredField),
    /** '' = still running. */
    toDate: z.string(),
    category: z.enum(HINDRANCE_CATEGORIES),
    responsibility: z.enum(RESPONSIBILITIES),
    description: z.string().trim().min(10, t.project.hinDescriptionRequired).max(600),
    wbsId: z.string(),
    location: z.string().max(80),
    isWorkStopped: z.boolean(),
    isEotClaimable: z.boolean(),
    eotClaimDays: z.union([z.number().int().nonnegative(), z.literal('')]),
    actionTaken: z.string().max(600),
    resolvedRemarks: z.string().max(600),
  })
  .superRefine((v, ctx) => {
    if (v.toDate && v.toDate < v.fromDate) {
      ctx.addIssue({ code: 'custom', path: ['toDate'], message: t.project.hinToBeforeFrom });
    }
    // A claim with no number attached cannot be assessed by the client.
    if (v.isEotClaimable && v.eotClaimDays === '') {
      ctx.addIssue({ code: 'custom', path: ['eotClaimDays'], message: t.project.hinEotWithoutClaim });
    }
  });

export type HindranceFormValues = z.infer<typeof hindranceSchema>;

export const emptyHindrance = (projectId: string, siteId: string): HindranceFormValues => ({
  projectId,
  siteId,
  fromDate: '',
  toDate: '',
  category: 'LAND_ACQUISITION',
  responsibility: 'CLIENT',
  description: '',
  wbsId: '',
  location: '',
  isWorkStopped: false,
  isEotClaimable: true,
  eotClaimDays: '',
  actionTaken: '',
  resolvedRemarks: '',
});
