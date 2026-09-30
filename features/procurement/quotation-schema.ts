import { z } from 'zod';
import { terminology as t } from '@/config/terminology.config';

export const QUOTATION_CHARGES = ['INCLUDED', 'EXTRA', 'NOT_APPLICABLE'] as const;

export const quotationSchema = z
  .object({
    projectId: z.string().min(1, t.common.requiredField),
    siteId: z.string().min(1, t.common.requiredField),
    rfqId: z.string().min(1, t.procurement.qtnRfqRequired),
    vendorId: z.string().min(1, t.procurement.qtnVendorRequired),
    date: z.string().min(1, t.common.requiredField),
    vendorRefNo: z.string().max(40),
    vendorRefDate: z.string(),
    validUntil: z.string(),
    receivedOn: z.string(),
    paymentTerms: z.string().max(200),
    deliveryPeriodDays: z.union([z.number().int().positive(), z.literal('')]),
    warrantyTerms: z.string().max(300),
    freightBasis: z.enum(QUOTATION_CHARGES),
    freightAmount: z.union([z.number().nonnegative(), z.literal('')]),
    loadingBasis: z.enum(QUOTATION_CHARGES),
    loadingAmount: z.union([z.number().nonnegative(), z.literal('')]),
    packingBasis: z.enum(QUOTATION_CHARGES),
    packingAmount: z.union([z.number().nonnegative(), z.literal('')]),
    chargesGstRate: z.union([z.number().nonnegative(), z.literal('')]),
    isTechnicallyQualified: z.enum(['PENDING', 'YES', 'NO']),
    deviations: z.string().max(600),
    remarks: z.string().max(600),
  })
  .superRefine((v, ctx) => {
    if (v.date && v.validUntil && v.validUntil < v.date) {
      ctx.addIssue({ code: 'custom', path: ['validUntil'], message: t.procurement.qtnValidityBeforeDate });
    }
  });

export type QuotationFormValues = z.infer<typeof quotationSchema>;

export const emptyQuotation = (projectId: string, siteId: string, rfqId = ''): QuotationFormValues => ({
  projectId,
  siteId,
  rfqId,
  vendorId: '',
  date: '',
  vendorRefNo: '',
  vendorRefDate: '',
  validUntil: '',
  receivedOn: '',
  paymentTerms: '',
  deliveryPeriodDays: '',
  warrantyTerms: '',
  freightBasis: 'INCLUDED',
  freightAmount: '',
  loadingBasis: 'INCLUDED',
  loadingAmount: '',
  packingBasis: 'NOT_APPLICABLE',
  packingAmount: '',
  chargesGstRate: 18,
  isTechnicallyQualified: 'PENDING',
  deviations: '',
  remarks: '',
});
