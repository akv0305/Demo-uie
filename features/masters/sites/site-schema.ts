import { z } from 'zod';
import type { SiteType } from '@/lib/data/types';

export const SITE_TYPES = ['MAIN_STORE', 'SITE_STORE', 'SITE_OFFICE', 'PLANT'] as const;

/** Types that exist to hold stock — isStore cannot be unticked for these. */
export const STORE_TYPES: SiteType[] = ['MAIN_STORE', 'SITE_STORE'];

export const siteSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(3, 'Site code is required')
      .max(16, 'Use 16 characters or fewer')
      // Hyphens are deliberate: ST-SH19-A, PL-SH19-HMP.
      .regex(/^[A-Z0-9-]+$/, 'Letters, digits and hyphens only'),
    name: z.string().trim().min(4, 'Site name is required').max(80, 'Use 80 characters or fewer'),
    type: z.enum(SITE_TYPES),
    companyId: z.string().min(1, 'Company is required'),
    /** '' = company level. */
    projectId: z.string(),
    location: z.string().trim().min(3, 'Location is required').max(80, 'Use 80 characters or fewer'),
    /** '' = not assigned. Stored as '' rather than undefined so a cleared value survives. */
    storeKeeperId: z.string(),
    isStore: z.boolean(),
    isActive: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (STORE_TYPES.includes(v.type) && !v.isStore) {
      ctx.addIssue({ code: 'custom', path: ['isStore'], message: 'A main store or site store always holds stock.' });
    }
    if (v.type === 'MAIN_STORE' && v.projectId !== '') {
      ctx.addIssue({ code: 'custom', path: ['projectId'], message: 'A main store serves every project, so leave the project blank.' });
    }
    if (v.type !== 'MAIN_STORE' && v.projectId === '') {
      ctx.addIssue({ code: 'custom', path: ['projectId'], message: 'A site store, plant or site office belongs to a project.' });
    }
    if (v.storeKeeperId !== '' && !v.isStore) {
      ctx.addIssue({ code: 'custom', path: ['storeKeeperId'], message: 'Tick Holds Stock, or clear the store keeper.' });
    }
  });

export type SiteFormValues = z.infer<typeof siteSchema>;

export const emptySite: SiteFormValues = {
  code: '',
  name: '',
  type: 'SITE_STORE',
  companyId: '',
  projectId: '',
  location: '',
  storeKeeperId: '',
  isStore: true,
  isActive: true,
};
