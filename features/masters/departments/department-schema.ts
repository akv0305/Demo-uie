import { z } from 'zod';

export const departmentSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, 'Department code is required')
    .max(8, 'Use 8 characters or fewer')
    .regex(/^[A-Z0-9]+$/, 'Letters and digits only'),
  name: z.string().trim().min(3, 'Department name is required').max(80, 'Use 80 characters or fewer'),
  /** Blank means not assigned; stripped to undefined by the container. */
  headEmployeeId: z.string(),
  isActive: z.boolean(),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;

export const emptyDepartment: DepartmentFormValues = {
  code: '',
  name: '',
  headEmployeeId: '',
  isActive: true,
};
