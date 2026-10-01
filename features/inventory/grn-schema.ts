import { z } from 'zod';
import { terminology as t } from '@/config/terminology.config';
import type { GrnLineCondition, GrnType } from '@/lib/data/types';

export const GRN_TYPES: GrnType[] = ['AGAINST_PO', 'WITHOUT_PO', 'FREE_ISSUE', 'SITE_TRANSFER_IN'];

export const GRN_CONDITIONS: GrnLineCondition[] = [
  'ACCEPTED',
  'PARTIALLY_REJECTED',
  'REJECTED',
  'PENDING_TEST',
];

export const grnSchema = z
  .object({
    date: z.string().min(1, t.common.requiredField),
    grnType: z.enum(['AGAINST_PO', 'WITHOUT_PO', 'FREE_ISSUE', 'SITE_TRANSFER_IN']),
    poId: z.string().optional(),
    vendorId: z.string().optional(),
    challanNo: z.string().min(1, t.inventory.grnChallanRequired),
    challanDate: z.string().min(1, t.common.requiredField),
    invoiceNo: z.string().optional(),
    invoiceDate: z.string().optional(),
    lrNo: z.string().optional(),
    lrDate: z.string().optional(),
    vehicleNo: z.string().optional(),
    transporterName: z.string().optional(),
    gateEntryNo: z.string().optional(),
    weighbridgeSlipNo: z.string().optional(),
    grossWeight: z.number().nonnegative().optional(),
    tareWeight: z.number().nonnegative().optional(),
    netWeight: z.number().nonnegative().optional(),
    storeSiteId: z.string().min(1, t.inventory.grnStoreRequired),
    receivedBy: z.string().min(1, t.common.requiredField),
    inspectedBy: z.string().optional(),
    testCertificateNo: z.string().optional(),
    remarks: z.string().optional(),
  })
  .refine((v) => v.grnType !== 'AGAINST_PO' || !!v.poId, {
    message: t.inventory.grnPoRequired,
    path: ['poId'],
  });

export type GrnFormValues = z.infer<typeof grnSchema>;

export function emptyGrn(defaults: Partial<GrnFormValues> = {}): GrnFormValues {
  const today = new Date().toISOString().slice(0, 10);
  return {
    date: today,
    grnType: 'AGAINST_PO',
    poId: '',
    vendorId: '',
    challanNo: '',
    challanDate: today,
    storeSiteId: '',
    receivedBy: '',
    ...defaults,
  } as GrnFormValues;
}
