import { z } from 'zod';
import type { VendorCategory } from '@/lib/data/types';
import {
  GSTIN_RE,
  IFSC_RE,
  PAN_RE,
  panInGstin,
  stateFromGstin,
} from '@/lib/masters/tax-validators';

/** Re-exported so existing screen imports from this module keep working. */
export { INDIAN_STATES, STATE_CODES } from '@/lib/masters/tax-validators';

export const VENDOR_CATEGORIES = [
  'CEMENT', 'STEEL', 'AGGREGATE', 'BITUMEN', 'DIESEL',
  'HARDWARE', 'EQUIPMENT_HIRE', 'TRANSPORT', 'ELECTRICAL', 'RMC',
] as const satisfies readonly VendorCategory[];

export const vendorSchema = z
  .object({
    code: z.string().trim().min(3, 'Vendor code is required').max(20, 'Use 20 characters or fewer'),
    name: z.string().trim().min(3, 'Vendor name is required').max(120, 'Use 120 characters or fewer'),
    category: z.enum(VENDOR_CATEGORIES),

    gstin: z.string().trim().toUpperCase().regex(GSTIN_RE, 'Not a valid 15-character GSTIN'),
    pan: z.string().trim().toUpperCase().regex(PAN_RE, 'Not a valid 10-character PAN'),
    msmeNo: z.string().trim().max(30, 'Use 30 characters or fewer'),

    address: z.string().trim().min(5, 'Address is required').max(200, 'Use 200 characters or fewer'),
    city: z.string().trim().min(2, 'City is required').max(60),
    state: z.string().min(1, 'Select the state'),
    contactPerson: z.string().trim().min(3, 'Contact person is required').max(80),
    phone: z.string().trim().min(10, 'Phone number is required').max(20),
    email: z.union([z.literal(''), z.string().trim().email('Not a valid email address')]),

    paymentTerms: z.string().trim().min(3, 'Payment terms are required').max(80),
    creditDays: z
      .number({ message: 'Enter credit days' })
      .int('Whole days only')
      .min(0, 'Cannot be negative')
      .max(180, 'Maximum 180 days'),

    bankAccount: z.string().trim().max(20, 'Use 20 characters or fewer'),
    ifsc: z.union([z.literal(''), z.string().trim().toUpperCase().regex(IFSC_RE, 'Not a valid IFSC code')]),

    isActive: z.boolean(),
  })
  .superRefine((v, ctx) => {
    // The PAN is embedded in the GSTIN at positions 3-12. They must agree.
    const pan = panInGstin(v.gstin);
    if (pan && PAN_RE.test(v.pan) && pan !== v.pan) {
      ctx.addIssue({
        code: 'custom',
        path: ['pan'],
        message: 'PAN does not match the PAN inside the GSTIN.',
      });
    }
    // The first two digits of the GSTIN are the state code.
    const expected = stateFromGstin(v.gstin);
    if (expected && v.state && expected !== v.state) {
      ctx.addIssue({
        code: 'custom',
        path: ['state'],
        message: `GSTIN state code belongs to ${expected}.`,
      });
    }
    // Advance payment and credit days contradict each other.
    if (v.creditDays > 0 && /advance/i.test(v.paymentTerms)) {
      ctx.addIssue({
        code: 'custom',
        path: ['creditDays'],
        message: 'Payment terms say advance, so credit days should be 0.',
      });
    }
  });

export type VendorFormValues = z.infer<typeof vendorSchema>;

export const emptyVendor: VendorFormValues = {
  code: '', name: '', category: 'CEMENT',
  gstin: '', pan: '', msmeNo: '',
  address: '', city: '', state: 'Telangana',
  contactPerson: '', phone: '', email: '',
  paymentTerms: '30 days from invoice', creditDays: 30,
  bankAccount: '', ifsc: '',
  isActive: true,
};
