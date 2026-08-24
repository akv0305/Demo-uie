import { z } from 'zod';
import type { SubcontractorTrade } from '@/lib/data/types';
import { GSTIN_RE, PAN_RE, panInGstin, stateFromGstin } from '@/lib/masters/tax-validators';

export { INDIAN_STATES } from '@/lib/masters/tax-validators';

export const SUBCONTRACTOR_TRADES = [
  'EARTHWORK', 'SHUTTERING', 'BAR_BENDING', 'CONCRETING',
  'BLOCKWORK_PLASTER', 'BITUMINOUS', 'ELECTRICAL', 'PLUMBING',
] as const satisfies readonly SubcontractorTrade[];

export const subcontractorSchema = z
  .object({
    code: z.string().trim().min(3, 'Subcontractor code is required').max(20, 'Use 20 characters or fewer'),
    name: z.string().trim().min(3, 'Agency name is required').max(120, 'Use 120 characters or fewer'),
    trade: z.enum(SUBCONTRACTOR_TRADES),

    gstin: z.string().trim().toUpperCase().regex(GSTIN_RE, 'Not a valid 15-character GSTIN'),
    pan: z.string().trim().toUpperCase().regex(PAN_RE, 'Not a valid 10-character PAN'),

    contactPerson: z.string().trim().min(3, 'Contact person is required').max(80),
    phone: z.string().trim().min(10, 'Phone number is required').max(20),
    city: z.string().trim().min(2, 'City is required').max(60),
    state: z.string().min(1, 'Select the state'),

    isLabourContractor: z.boolean(),
    licenceNo: z.string().trim().max(40, 'Use 40 characters or fewer'),

    isActive: z.boolean(),
  })
  .superRefine((v, ctx) => {
    const pan = panInGstin(v.gstin);
    if (pan && PAN_RE.test(v.pan) && pan !== v.pan) {
      ctx.addIssue({ code: 'custom', path: ['pan'], message: 'PAN does not match the PAN inside the GSTIN.' });
    }
    const expected = stateFromGstin(v.gstin);
    if (expected && v.state && expected !== v.state) {
      ctx.addIssue({ code: 'custom', path: ['state'], message: `GSTIN state code belongs to ${expected}.` });
    }
    // A labour contractor must carry a licence number.
    if (v.isLabourContractor && !v.licenceNo) {
      ctx.addIssue({ code: 'custom', path: ['licenceNo'], message: 'Labour licence number is required for a labour contractor.' });
    }
    // A licence number with the flag unticked is a data-entry slip.
    if (!v.isLabourContractor && v.licenceNo) {
      ctx.addIssue({ code: 'custom', path: ['isLabourContractor'], message: 'Tick Labour Contractor, or clear the licence number.' });
    }
  });

export type SubcontractorFormValues = z.infer<typeof subcontractorSchema>;

export const emptySubcontractor: SubcontractorFormValues = {
  code: '', name: '', trade: 'EARTHWORK',
  gstin: '', pan: '',
  contactPerson: '', phone: '', city: '', state: 'Telangana',
  isLabourContractor: false, licenceNo: '',
  isActive: true,
};
