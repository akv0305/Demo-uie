import { z } from 'zod';
import { terminology as t } from '@/config/terminology.config';

export const LINKABLE_ENTITIES = [
  'vendors',
  'subcontractors',
  'equipment',
  'employees',
  'projects',
  'companies',
  'documents',
] as const;

export const documentUploadSchema = z
  .object({
    files: z
      .array(z.object({ name: z.string(), sizeKb: z.number() }))
      .min(1, t.documents.fileRequired),
    category: z.string().min(1, t.documents.categoryRequired),
    entityKey: z.enum(LINKABLE_ENTITIES),
    entityId: z.string().min(1, t.documents.recordRequired),
    validFrom: z.string().optional(),
    expiryDate: z.string().optional(),
    remarks: z.string().max(300).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.validFrom && v.expiryDate && v.expiryDate <= v.validFrom) {
      ctx.addIssue({
        code: 'custom',
        path: ['expiryDate'],
        message: t.documents.expiryBeforeValidFrom,
      });
    }
  });

export type DocumentUploadValues = z.infer<typeof documentUploadSchema>;

export const emptyUpload: DocumentUploadValues = {
  files: [],
  category: '',
  entityKey: 'vendors',
  entityId: '',
  validFrom: '',
  expiryDate: '',
  remarks: '',
};
