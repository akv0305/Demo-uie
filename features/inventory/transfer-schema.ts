import { z } from 'zod';
import { terminology as t } from '@/config/terminology.config';
import type { TransferStage } from '@/lib/data/types';

export const TRANSFER_STAGES: TransferStage[] = [
  'DRAFT',
  'DISPATCHED',
  'PARTLY_RECEIVED',
  'RECEIVED',
];

export const transferSchema = z
  .object({
    date: z.string().min(1, t.common.requiredField),
    fromSiteId: z.string().min(1, t.inventory.stFromStoreRequired),
    toSiteId: z.string().min(1, t.inventory.stToStoreRequired),
    toProjectId: z.string().optional(),
    challanNo: z.string().optional(),
    vehicleNo: z.string().optional(),
    transporterName: z.string().optional(),
    lrNo: z.string().optional(),
    reason: z.string().optional(),
    dispatchedBy: z.string().min(1, t.common.requiredField),
    receivedBy: z.string().optional(),
    receivedDate: z.string().optional(),
    remarks: z.string().optional(),
  })
  .refine((v) => v.fromSiteId !== v.toSiteId, {
    message: t.inventory.stSameStore,
    path: ['toSiteId'],
  });

export type TransferFormValues = z.infer<typeof transferSchema>;

export function emptyTransfer(defaults: Partial<TransferFormValues> = {}): TransferFormValues {
  const today = new Date().toISOString().slice(0, 10);
  return {
    date: today,
    fromSiteId: '',
    toSiteId: '',
    dispatchedBy: '',
    ...defaults,
  } as TransferFormValues;
}
