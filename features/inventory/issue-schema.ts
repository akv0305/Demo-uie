import { z } from 'zod';
import { terminology as t } from '@/config/terminology.config';
import type { IssueType } from '@/lib/data/types';

export const ISSUE_TYPES: IssueType[] = [
  'CONSUMPTION',
  'SUBCONTRACTOR',
  'EQUIPMENT',
  'RETURNABLE',
];

export const issueSchema = z
  .object({
    date: z.string().min(1, t.common.requiredField),
    issueType: z.enum(['CONSUMPTION', 'SUBCONTRACTOR', 'EQUIPMENT', 'RETURNABLE']),
    storeSiteId: z.string().min(1, t.inventory.miStoreRequired),
    requisitionNo: z.string().optional(),
    requisitionDate: z.string().optional(),
    subcontractorId: z.string().optional(),
    equipmentId: z.string().optional(),
    equipmentHmr: z.number().nonnegative().optional(),
    wbsId: z.string().optional(),
    purpose: z.string().optional(),
    gatePassNo: z.string().optional(),
    vehicleNo: z.string().optional(),
    issuedBy: z.string().min(1, t.common.requiredField),
    receivedBy: z.string().min(1, t.common.requiredField),
    remarks: z.string().optional(),
  })
  .refine((v) => v.issueType !== 'SUBCONTRACTOR' || !!v.subcontractorId, {
    message: t.inventory.miSubcontractorRequired,
    path: ['subcontractorId'],
  })
  .refine((v) => v.issueType !== 'EQUIPMENT' || !!v.equipmentId, {
    message: t.inventory.miEquipmentRequired,
    path: ['equipmentId'],
  });

export type IssueFormValues = z.infer<typeof issueSchema>;

export function emptyIssue(defaults: Partial<IssueFormValues> = {}): IssueFormValues {
  const today = new Date().toISOString().slice(0, 10);
  return {
    date: today,
    issueType: 'CONSUMPTION',
    storeSiteId: '',
    requisitionNo: '',
    requisitionDate: today,
    issuedBy: '',
    receivedBy: '',
    ...defaults,
  } as IssueFormValues;
}
