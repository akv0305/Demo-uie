import { z } from 'zod';

export const OWNERSHIPS = ['OWNED', 'HIRED'] as const;
export const EQUIPMENT_STATUSES = ['WORKING', 'IDLE', 'BREAKDOWN', 'UNDER_MAINTENANCE'] as const;

/** Rate units seen in the fixtures. Free text in the type, constrained here. */
export const HIRE_RATE_UNITS = ['HRS', 'DAY', 'MONTH', 'TRIP'] as const;

/** Existing fixture values, offered as suggestions — type stays free text (Q-57). */
export const EQUIPMENT_TYPES = [
  'Batching Plant',
  'Hot Mix Plant',
  'WMM Plant',
  'Crusher',
  'Excavator',
  'Tandem Roller',
  'Soil Compactor',
  'Paver Finisher',
  'Transit Mixer',
  'Tipper',
  'Water Tanker',
  'Concrete Pump',
  'DG Set',
  'Backhoe Loader',
] as const;

/** Indian commercial vehicle plate: TS07UB4412, AP16TG5567. */
export const REG_NO_RE = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;

export const equipmentSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(4, 'Equipment code is required')
      .max(20, 'Use 20 characters or fewer')
      // Fixtures use UIE/EQ/BP01 — slashes are part of the house format.
      .regex(/^[A-Z0-9/-]+$/, 'Letters, digits, slashes and hyphens only'),
    name: z.string().trim().min(4, 'Description is required').max(80, 'Use 80 characters or fewer'),
    type: z.string().trim().min(3, 'Equipment type is required').max(40, 'Use 40 characters or fewer'),
    /** '' = none. Plant and gensets are not road-registered. */
    registrationNo: z.string().trim().toUpperCase(),
    ownership: z.enum(OWNERSHIPS),
    hireVendorId: z.string(),
    /** '' rather than 0 so an empty field is distinguishable from a zero rate. */
    hireRate: z.union([z.number().nonnegative(), z.literal('')]),
    hireRateUnit: z.string(),
    projectId: z.string(),
    siteId: z.string(),
    operatorEmployeeId: z.string(),
    status: z.enum(EQUIPMENT_STATUSES),
    currentHmr: z.number({ message: 'Current reading is required' }).nonnegative('Cannot be negative'),
    nextServiceDueHmr: z.union([z.number().nonnegative(), z.literal('')]),
    nextServiceDueDate: z.string(),
    isActive: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.registrationNo !== '' && !REG_NO_RE.test(v.registrationNo)) {
      ctx.addIssue({ code: 'custom', path: ['registrationNo'], message: 'Use the format TS07UB4412' });
    }
    if (v.ownership === 'HIRED') {
      if (v.hireVendorId === '') {
        ctx.addIssue({ code: 'custom', path: ['hireVendorId'], message: 'Hire vendor is required for hired equipment' });
      }
      if (v.hireRate === '') {
        ctx.addIssue({ code: 'custom', path: ['hireRate'], message: 'Hire rate is required for hired equipment' });
      }
      if (v.hireRateUnit === '') {
        ctx.addIssue({ code: 'custom', path: ['hireRateUnit'], message: 'Rate unit is required for hired equipment' });
      }
    }
    // A site belongs to a project, so a site without one is unplaceable.
    if (v.siteId !== '' && v.projectId === '') {
      ctx.addIssue({ code: 'custom', path: ['projectId'], message: 'Select the project this site belongs to' });
    }
  });

export type EquipmentFormValues = z.infer<typeof equipmentSchema>;

export const emptyEquipment: EquipmentFormValues = {
  code: '',
  name: '',
  type: '',
  registrationNo: '',
  ownership: 'OWNED',
  hireVendorId: '',
  hireRate: '',
  hireRateUnit: '',
  projectId: '',
  siteId: '',
  operatorEmployeeId: '',
  status: 'IDLE',
  currentHmr: 0,
  nextServiceDueHmr: '',
  nextServiceDueDate: '',
  isActive: true,
};

/** Service is overdue on either reading or date. Used by the list and the form. */
export function isServiceOverdue(
  currentHmr: number,
  dueHmr?: number,
  dueDate?: string,
  today = new Date().toISOString().slice(0, 10),
): boolean {
  if (dueHmr !== undefined && currentHmr >= dueHmr) return true;
  if (dueDate && dueDate < today) return true;
  return false;
}
