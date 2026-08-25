import { z } from 'zod';
import type { ProjectType } from '@/lib/data/types';

export const PROJECT_TYPES = [
  'ROAD', 'BRIDGE', 'INDUSTRIAL_PARK', 'WAREHOUSE', 'BUILDING',
] as const satisfies readonly ProjectType[];

export const PROJECT_STATUSES = ['ACTIVE', 'COMPLETED', 'ON_HOLD'] as const;

/** Linear works are measured in chainage; structures and buildings are not. */
export const LINEAR_TYPES: readonly ProjectType[] = ['ROAD'];

/** Km+m form, e.g. 24+000 or 61+500. */
const CHAINAGE_RE = /^[0-9]{1,4}\+[0-9]{3}$/;

/** "24+000" -> 24000 metres, for ordering. */
export const chainageToMetres = (v: string): number | null => {
  if (!CHAINAGE_RE.test(v)) return null;
  const [km, m] = v.split('+');
  return Number(km) * 1000 + Number(m);
};

export const projectSchema = z
  .object({
    code: z.string().trim().toUpperCase().min(3, 'Project code is required').max(20, 'Use 20 characters or fewer'),
    name: z.string().trim().min(10, 'Full project name is required').max(200, 'Use 200 characters or fewer'),
    shortName: z.string().trim().min(3, 'Short name is required').max(40, 'Use 40 characters or fewer'),
    type: z.enum(PROJECT_TYPES),
    companyId: z.string().min(1, 'Select the company'),
    client: z.string().trim().min(3, 'Client is required').max(150, 'Use 150 characters or fewer'),
    location: z.string().trim().min(3, 'Location is required').max(150, 'Use 150 characters or fewer'),

    /** Entered in crore for readability; the container converts to rupees. */
    contractValueCrore: z
      .number({ message: 'Enter the contract value' })
      .positive('Must be greater than zero')
      .max(100000, 'Check the figure — that is over ₹1,00,000 Cr'),

    startDate: z.string().min(1, 'Commencement date is required'),
    endDate: z.string().min(1, 'Scheduled completion is required'),
    projectManagerId: z.string().min(1, 'Select the project manager'),

    chainageFrom: z.string().trim(),
    chainageTo: z.string().trim(),

    status: z.enum(PROJECT_STATUSES),
  })
  .superRefine((v, ctx) => {
    if (v.startDate && v.endDate && v.endDate <= v.startDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'Completion date must be after the commencement date.',
      });
    }

    const from = v.chainageFrom ? chainageToMetres(v.chainageFrom) : null;
    const to = v.chainageTo ? chainageToMetres(v.chainageTo) : null;

    if (v.chainageFrom && from === null) {
      ctx.addIssue({ code: 'custom', path: ['chainageFrom'], message: 'Use the Km+m form, e.g. 24+000.' });
    }
    if (v.chainageTo && to === null) {
      ctx.addIssue({ code: 'custom', path: ['chainageTo'], message: 'Use the Km+m form, e.g. 61+500.' });
    }
    // One without the other describes nothing.
    if (Boolean(v.chainageFrom) !== Boolean(v.chainageTo)) {
      ctx.addIssue({
        code: 'custom',
        path: [v.chainageFrom ? 'chainageTo' : 'chainageFrom'],
        message: 'Enter both chainage points, or neither.',
      });
    }
    if (from !== null && to !== null && to <= from) {
      ctx.addIssue({ code: 'custom', path: ['chainageTo'], message: 'Chainage To must be beyond Chainage From.' });
    }
  });

export type ProjectFormValues = z.infer<typeof projectSchema>;

export const emptyProject: ProjectFormValues = {
  code: '', name: '', shortName: '', type: 'ROAD',
  companyId: '', client: '', location: '',
  contractValueCrore: 0,
  startDate: '', endDate: '', projectManagerId: '',
  chainageFrom: '', chainageTo: '',
  status: 'ACTIVE',
};
