import { z } from 'zod';
import { terminology as t } from '@/config/terminology.config';

export const PO_BASES = ['COMPARATIVE', 'RATE_CONTRACT', 'SINGLE_SOURCE', 'EMERGENCY', 'REPEAT_ORDER'] as const;
export const PO_DELIVERY_TERMS = ['FOR_SITE', 'EX_WORKS', 'FOR_DESTINATION'] as const;

export const poSchema = z
  .object({
    projectId: z.string().min(1, t.common.requiredField),
    siteId: z.string().min(1, t.common.requiredField),
    date: z.string().min(1, t.common.requiredField),
    vendorId: z.string().min(1, t.procurement.poVendorRequired),
    basis: z.enum(PO_BASES),
    quotationId: z.string(),
    deliveryTerms: z.enum(PO_DELIVERY_TERMS),
    deliverySiteId: z.string().min(1, t.procurement.poDeliverySiteRequired),
    deliveryAddress: z.string().max(300),
    deliveryByDate: z.string(),
    paymentTerms: z.string().max(200),
    warrantyTerms: z.string().max(300),
    advanceAmount: z.union([z.number().nonnegative(), z.literal('')]),
    retentionPct: z.union([z.number().min(0).max(100), z.literal('')]),
    ldClause: z.string().max(400),
    awardJustification: z.string().max(600),
    inspectionRequired: z.boolean(),
    freightAmount: z.union([z.number().nonnegative(), z.literal('')]),
    loadingAmount: z.union([z.number().nonnegative(), z.literal('')]),
    packingAmount: z.union([z.number().nonnegative(), z.literal('')]),
    chargesGstRate: z.union([z.number().nonnegative(), z.literal('')]),
    amendmentReason: z.string().max(400),
    remarks: z.string().max(600),
  })
  .superRefine((v, ctx) => {
    // An order off the comparative route must carry its reason on the file.
    if (v.basis !== 'COMPARATIVE' && !v.awardJustification.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['awardJustification'],
        message: t.procurement.poJustificationRequired,
      });
    }
  });

export type PoFormValues = z.infer<typeof poSchema>;

export const emptyPo = (projectId: string, siteId: string): PoFormValues => ({
  projectId,
  siteId,
  date: '',
  vendorId: '',
  basis: 'COMPARATIVE',
  quotationId: '',
  deliveryTerms: 'FOR_SITE',
  deliverySiteId: siteId,
  deliveryAddress: '',
  deliveryByDate: '',
  paymentTerms: '',
  warrantyTerms: '',
  advanceAmount: '',
  retentionPct: '',
  ldClause: '',
  awardJustification: '',
  inspectionRequired: false,
  freightAmount: '',
  loadingAmount: '',
  packingAmount: '',
  chargesGstRate: 18,
  amendmentReason: '',
  remarks: '',
});
