import { z } from 'zod';
import { terminology as t } from '@/config/terminology.config';

export const PR_PRIORITIES = ['NORMAL', 'URGENT', 'EMERGENCY'] as const;

/** One material line. Mirrors LineRow so the grid can drive it directly. */
export const prLineSchema = z.object({
  id: z.string(),
  itemId: z.string().min(1, t.common.requiredField),
  description: z.string().min(1, t.common.requiredField),
  uomCode: z.string().min(1, t.common.requiredField),
  quantity: z.union([z.number().positive(), z.literal('')]),
  rate: z.union([z.number().nonnegative(), z.literal('')]),
  wbsCode: z.string().optional(),
  remarks: z.string().optional(),
});

export const prSchema = z
  .object({
    projectId: z.string().min(1, t.common.requiredField),
    siteId: z.string().min(1, t.common.requiredField),
    date: z.string().min(1, t.common.requiredField),
    priority: z.enum(PR_PRIORITIES),
    indentedBy: z.string().min(1, t.common.requiredField),
    requiredBy: z.string().min(1, t.common.requiredField),
    deliverySiteId: z.string().min(1, t.common.requiredField),
    justification: z.string().max(600),
    lines: z.array(prLineSchema).min(1, t.procurement.prLinesRequired),
    remarks: z.string().max(600),
  })
  .superRefine((v, ctx) => {
    if (v.date && v.requiredBy && v.requiredBy < v.date) {
      ctx.addIssue({
        code: 'custom',
        path: ['requiredBy'],
        message: t.procurement.prRequiredBeforeDate,
      });
    }
    // An urgent indent jumps the queue, so it has to say why.
    if (v.priority !== 'NORMAL' && v.justification.trim().length < 10) {
      ctx.addIssue({
        code: 'custom',
        path: ['justification'],
        message: t.procurement.prJustificationRequired,
      });
    }
  });

export type PrFormValues = z.infer<typeof prSchema>;

export const emptyPr = (projectId: string, siteId: string, indentedBy: string): PrFormValues => ({
  projectId,
  siteId,
  date: '',
  priority: 'NORMAL',
  indentedBy,
  requiredBy: '',
  deliverySiteId: siteId,
  justification: '',
  lines: [],
  remarks: '',
});
