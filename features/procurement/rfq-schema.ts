import { z } from 'zod';
import { terminology as t } from '@/config/terminology.config';

export const RFQ_SENT_MODES = ['EMAIL', 'WHATSAPP', 'COURIER', 'HAND_DELIVERY', 'PORTAL'] as const;
export const RFQ_RESPONSES = ['AWAITED', 'RECEIVED', 'REGRETTED', 'NO_RESPONSE'] as const;
export const FREIGHT_TERMS = ['FOR_SITE', 'EX_WORKS', 'EXTRA_AT_ACTUALS', 'INCLUSIVE'] as const;

export const rfqSchema = z
  .object({
    projectId: z.string().min(1, t.common.requiredField),
    siteId: z.string().min(1, t.common.requiredField),
    date: z.string().min(1, t.common.requiredField),
    title: z.string().trim().min(5, t.procurement.rfqSubjectRequired).max(140),
    dueDate: z.string().min(1, t.common.requiredField),
    quoteValidityDays: z.union([z.number().int().positive(), z.literal('')]),
    deliveryLocationSiteId: z.string(),
    deliverySchedule: z.string().max(300),
    paymentTermsExpected: z.string().max(200),
    freightTerms: z.enum(FREIGHT_TERMS),
    inspectionRequired: z.boolean(),
    scopeNotes: z.string().max(1000),
    remarks: z.string().max(600),
    preparedBy: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.date && v.dueDate && v.dueDate < v.date) {
      ctx.addIssue({ code: 'custom', path: ['dueDate'], message: t.procurement.rfqDueBeforeDate });
    }
  });

export type RfqFormValues = z.infer<typeof rfqSchema>;

export const emptyRfq = (projectId: string, siteId: string): RfqFormValues => ({
  projectId,
  siteId,
  date: '',
  title: '',
  dueDate: '',
  quoteValidityDays: 15,
  deliveryLocationSiteId: siteId,
  deliverySchedule: '',
  paymentTermsExpected: '',
  freightTerms: 'FOR_SITE',
  inspectionRequired: false,
  scopeNotes: '',
  remarks: '',
  preparedBy: '',
});
