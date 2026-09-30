import { z } from 'zod';
import { terminology as t } from '@/config/terminology.config';

export const BG_TYPES = [
  'PERFORMANCE',
  'MOBILISATION_ADVANCE',
  'RETENTION_MONEY',
  'ADVANCE_PAYMENT',
  'SECURITY_DEPOSIT',
  'EMD',
] as const;

export const BG_STATUSES = ['LIVE', 'UNDER_EXTENSION', 'EXPIRED', 'RELEASED', 'INVOKED'] as const;

export const bgSchema = z
  .object({
    projectId: z.string().min(1, t.common.requiredField),
    siteId: z.string().min(1, t.common.requiredField),
    bgNumber: z.string().trim().min(3, t.project.bgNumberRequired).max(40),
    date: z.string().min(1, t.common.requiredField),
    type: z.enum(BG_TYPES),
    bgStatus: z.enum(BG_STATUSES),
    bankName: z.string().trim().min(3, t.project.bgBankRequired).max(80),
    branch: z.string().max(60),
    beneficiary: z.string().trim().min(3, t.project.bgBeneficiaryRequired).max(120),
    amount: z.number().positive(t.project.bgAmountRequired),
    validUpto: z.string().min(1, t.common.requiredField),
    claimPeriodUpto: z.string(),
    marginPct: z.union([z.number().min(0).max(100), z.literal('')]),
    marginAmount: z.union([z.number().nonnegative(), z.literal('')]),
    fdrNo: z.string().max(40),
    commissionPct: z.union([z.number().min(0).max(100), z.literal('')]),
    purpose: z.string().max(300),
    releasedOn: z.string(),
    remarks: z.string().max(600),
  })
  .superRefine((v, ctx) => {
    if (v.date && v.validUpto && v.validUpto < v.date) {
      ctx.addIssue({ code: 'custom', path: ['validUpto'], message: t.project.bgValidBeforeIssue });
    }
    // The claim period always runs past validity, never before it.
    if (v.claimPeriodUpto && v.validUpto && v.claimPeriodUpto < v.validUpto) {
      ctx.addIssue({
        code: 'custom',
        path: ['claimPeriodUpto'],
        message: t.project.bgClaimBeforeValid,
      });
    }
    if (v.releasedOn && v.bgStatus !== 'RELEASED') {
      ctx.addIssue({
        code: 'custom',
        path: ['releasedOn'],
        message: t.project.bgReleasedWithoutStatus,
      });
    }
  });

export type BgFormValues = z.infer<typeof bgSchema>;

export const emptyBg = (projectId: string, siteId: string): BgFormValues => ({
  projectId,
  siteId,
  bgNumber: '',
  date: '',
  type: 'PERFORMANCE',
  bgStatus: 'LIVE',
  bankName: '',
  branch: '',
  beneficiary: '',
  amount: 0,
  validUpto: '',
  claimPeriodUpto: '',
  marginPct: '',
  marginAmount: '',
  fdrNo: '',
  commissionPct: '',
  purpose: '',
  releasedOn: '',
  remarks: '',
});
