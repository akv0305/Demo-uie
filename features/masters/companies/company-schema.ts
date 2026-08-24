import { z } from 'zod';
import type { CompanyType } from '@/lib/data/types';
import { GSTIN_RE, PAN_RE, panInGstin, stateFromGstin } from '@/lib/masters/tax-validators';

export { INDIAN_STATES } from '@/lib/masters/tax-validators';

export const COMPANY_TYPES = ['PARENT', 'SPV', 'JV'] as const satisfies readonly CompanyType[];

/** Registrar of Companies identity number: U45209TG2006PTC051428 */
const CIN_RE = /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
const PINCODE_RE = /^[1-9][0-9]{5}$/;

export const companySchema = z
  .object({
    code: z.string().trim().toUpperCase().min(2, 'Company code is required').max(10, 'Use 10 characters or fewer'),
    name: z.string().trim().min(3, 'Company name is required').max(120, 'Use 120 characters or fewer'),
    legalName: z.string().trim().min(3, 'Registered legal name is required').max(200, 'Use 200 characters or fewer'),
    type: z.enum(COMPANY_TYPES),

    gstin: z.string().trim().toUpperCase().regex(GSTIN_RE, 'Not a valid 15-character GSTIN'),
    pan: z.string().trim().toUpperCase().regex(PAN_RE, 'Not a valid 10-character PAN'),
    cin: z.union([z.literal(''), z.string().trim().toUpperCase().regex(CIN_RE, 'Not a valid 21-character CIN')]),

    address: z.string().trim().min(5, 'Address is required').max(200, 'Use 200 characters or fewer'),
    city: z.string().trim().min(2, 'City is required').max(60),
    state: z.string().min(1, 'Select the state'),
    pincode: z.string().trim().regex(PINCODE_RE, 'Not a valid 6-digit PIN code'),

    contactPerson: z.string().trim().min(3, 'Contact person is required').max(80),
    phone: z.string().trim().min(10, 'Phone number is required').max(20),
    email: z.string().trim().email('Not a valid email address'),

    isActive: z.boolean(),
  })
  .superRefine((v, ctx) => {
    // The PAN is embedded in the GSTIN at positions 3-12. They must agree.
    const pan = panInGstin(v.gstin);
    if (pan && PAN_RE.test(v.pan) && pan !== v.pan) {
      ctx.addIssue({ code: 'custom', path: ['pan'], message: 'PAN does not match the PAN inside the GSTIN.' });
    }
    // The first two digits of the GSTIN are the state code.
    const expected = stateFromGstin(v.gstin);
    if (expected && v.state && expected !== v.state) {
      ctx.addIssue({ code: 'custom', path: ['state'], message: `GSTIN state code belongs to ${expected}.` });
    }
    // An incorporated entity has a CIN; an unincorporated JV does not.
    if (v.type !== 'JV' && !v.cin) {
      ctx.addIssue({ code: 'custom', path: ['cin'], message: 'CIN is required for an incorporated company.' });
    }
  });

export type CompanyFormValues = z.infer<typeof companySchema>;

export const emptyCompany: CompanyFormValues = {
  code: '', name: '', legalName: '', type: 'SPV',
  gstin: '', pan: '', cin: '',
  address: '', city: '', state: 'Telangana', pincode: '',
  contactPerson: '', phone: '', email: '',
  isActive: true,
};
