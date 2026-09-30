import { z } from 'zod';
import { terminology as t } from '@/config/terminology.config';

export const CLAIM_TYPES = [
  'EOT',
  'PROLONGATION',
  'IDLE_RESOURCES',
  'PRICE_ESCALATION',
  'DELAYED_PAYMENT_INTEREST',
  'CHANGE_IN_LAW',
  'OTHER',
] as const;

export const CLAIM_STAGES = [
  'NOTICE_GIVEN',
  'PARTICULARS_SUBMITTED',
  'UNDER_REVIEW',
  'ENGINEER_DECISION',
  'CONCILIATION',
  'ARBITRATION',
  'SETTLED',
  'WITHDRAWN',
] as const;

export const claimSchema = z
  .object({
    projectId: z.string().min(1, t.common.requiredField),
    siteId: z.string().min(1, t.common.requiredField),
    date: z.string().min(1, t.common.requiredField),
    type: z.enum(CLAIM_TYPES),
    stage: z.enum(CLAIM_STAGES),
    title: z.string().trim().min(5, t.project.clmTitleRequired).max(120),
    description: z.string().trim().min(10, t.project.clmDescriptionRequired).max(800),
    hindranceId: z.string(),
    variationId: z.string(),
    noticeDate: z.string(),
    noticeRefNo: z.string().max(40),
    particularsDate: z.string(),
    claimedAmount: z.union([z.number().nonnegative(), z.literal('')]),
    claimedDays: z.union([z.number().int().nonnegative(), z.literal('')]),
    settledAmount: z.union([z.number().nonnegative(), z.literal('')]),
    settledDays: z.union([z.number().int().nonnegative(), z.literal('')]),
    settledDate: z.string(),
    remarks: z.string().max(600),
  })
  .superRefine((v, ctx) => {
    const closed = v.stage === 'SETTLED' || v.stage === 'WITHDRAWN';
    // A settled figure before the claim is concluded would overstate recoveries.
    if (!closed && v.settledAmount !== '') {
      ctx.addIssue({ code: 'custom', path: ['settledAmount'], message: t.project.clmSettledWithoutStage });
    }
    if (v.noticeDate && v.particularsDate && v.particularsDate < v.noticeDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['particularsDate'],
        message: t.project.clmParticularsBeforeNotice,
      });
    }
  });

export type ClaimFormValues = z.infer<typeof claimSchema>;

export const emptyClaim = (projectId: string, siteId: string): ClaimFormValues => ({
  projectId,
  siteId,
  date: '',
  type: 'EOT',
  stage: 'NOTICE_GIVEN',
  title: '',
  description: '',
  hindranceId: '',
  variationId: '',
  noticeDate: '',
  noticeRefNo: '',
  particularsDate: '',
  claimedAmount: '',
  claimedDays: '',
  settledAmount: '',
  settledDays: '',
  settledDate: '',
  remarks: '',
});
