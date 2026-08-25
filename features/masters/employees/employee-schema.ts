import { z } from 'zod';

const PF_RE = /^[A-Z]{2}\/[A-Z]{3}\/[0-9]{7}\/[0-9]{4}$/;
const ESI_RE = /^[0-9]{10}$/;

export const employeeSchema = z
  .object({
    code: z.string().trim().min(3, 'Employee code is required').max(20, 'Use 20 characters or fewer'),
    name: z.string().trim().min(3, 'Employee name is required').max(120, 'Use 120 characters or fewer'),
    designation: z.string().trim().min(3, 'Designation is required').max(80, 'Use 80 characters or fewer'),

    departmentId: z.string().min(1, 'Select the department'),
    companyId: z.string().min(1, 'Select the company'),
    /** Blank means head office; stripped to null by the container. */
    projectId: z.string(),
    dateOfJoining: z.string().min(1, 'Date of joining is required'),
    /** Blank means no manager; stripped to undefined by the container. */
    reportingToId: z.string(),

    phone: z.string().trim().min(10, 'Phone number is required').max(20),
    email: z.string().trim().email('Not a valid email address'),

    pfNumber: z.union([z.literal(''), z.string().trim().toUpperCase().regex(PF_RE, 'Format: TG/HYD/0045821/1001')]),
    esiNumber: z.union([z.literal(''), z.string().trim().regex(ESI_RE, 'ESI number is 10 digits')]),

    isActive: z.boolean(),
  })
  .superRefine((v, ctx) => {
    // Joining date cannot be in the future.
    if (v.dateOfJoining && v.dateOfJoining > new Date().toISOString().slice(0, 10)) {
      ctx.addIssue({ code: 'custom', path: ['dateOfJoining'], message: 'Date of joining cannot be in the future.' });
    }
  });

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

export const emptyEmployee: EmployeeFormValues = {
  code: '', name: '', designation: '',
  departmentId: '', companyId: '', projectId: '',
  dateOfJoining: '', reportingToId: '',
  phone: '', email: '',
  pfNumber: '', esiNumber: '',
  isActive: true,
};
