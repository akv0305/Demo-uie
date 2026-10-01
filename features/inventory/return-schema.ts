import { z } from 'zod';
import { terminology as t } from '@/config/terminology.config';
import type { ReturnCondition, ReturnType } from '@/lib/data/types';

export const RETURN_TYPES: ReturnType[] = [
  'SURPLUS',
  'RETURNABLE',
  'FROM_SUBCONTRACTOR',
  'SCRAP',
];

export const RETURN_CONDITIONS: ReturnCondition[] = ['GOOD', 'DAMAGED', 'SCRAP'];

export const returnSchema = z
  .object({
    date: z.string().min(1, t.common.requiredField),
    returnType: z.enum(['SURPLUS', 'RETURNABLE', 'FROM_SUBCONTRACTOR', 'SCRAP']),
    storeSiteId: z.string().min(1, t.inventory.mrStoreRequired),
    issueId: z.string().optional(),
    subcontractorId: z.string().optional(),
    wbsId: z.string().optional(),
    reason: z.string().optional(),
    gatePassNo: z.string().optional(),
    vehicleNo: z.string().optional(),
    returnedBy: z.string().min(1, t.common.requiredField),
    receivedBy: z.string().min(1, t.common.requiredField),
    inspectedBy: z.string().optional(),
    remarks: z.string().optional(),
  })
  .refine((v) => v.returnType !== 'FROM_SUBCONTRACTOR' || !!v.subcontractorId, {
    message: t.inventory.mrSubcontractorRequired,
    path: ['subcontractorId'],
  });

export type ReturnFormValues = z.infer<typeof returnSchema>;

export function emptyReturn(defaults: Partial<ReturnFormValues> = {}): ReturnFormValues {
  const today = new Date().toISOString().slice(0, 10);
  return {
    date: today,
    returnType: 'SURPLUS',
    storeSiteId: '',
    issueId: '',
    returnedBy: '',
    receivedBy: '',
    ...defaults,
  } as ReturnFormValues;
}
