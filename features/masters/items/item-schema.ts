import { z } from 'zod';
import type { ItemGroup, ItemType, ValuationMethod } from '@/lib/data/types';


export const ITEM_GROUPS = [
  'CEMENT', 'STEEL', 'AGGREGATE', 'SAND', 'GRANULAR', 'BITUMEN', 'RMC', 'MASONRY',
  'SHUTTERING', 'CONSUMABLE', 'FUEL', 'ADMIXTURE', 'PIPES_FITTINGS', 'ELECTRICAL', 'SAFETY',
] as const satisfies readonly ItemGroup[];

export const ITEM_TYPES = [
  'MATERIAL', 'CONSUMABLE', 'SPARE', 'FUEL', 'RETURNABLE', 'PRODUCED', 'SERVICE', 'ASSET',
] as const satisfies readonly ItemType[];

export const VALUATION_METHODS = [
  'WEIGHTED_AVERAGE', 'FIFO', 'STANDARD',
] as const satisfies readonly ValuationMethod[];

/** Sub-groups offered per group. Free text is still allowed. */
export const SUB_GROUPS: Record<ItemGroup, string[]> = {
  CEMENT: ['OPC', 'PPC', 'PSC', 'White Cement'],
  STEEL: ['TMT Bar', 'Structural', 'Binding Wire', 'Plate', 'Pipe'],
  AGGREGATE: ['10mm', '20mm', '40mm', 'Rubble'],
  SAND: ['River Sand', 'M-Sand', 'P-Sand'],
  GRANULAR: ['GSB', 'WMM', 'WBM', 'Murum'],
  BITUMEN: ['VG-30', 'VG-40', 'Emulsion', 'Cutback'],
  RMC: ['M15', 'M20', 'M25', 'M30', 'M35'],
  MASONRY: ['Solid Block', 'Hollow Block', 'Brick', 'AAC Block'],
  SHUTTERING: ['Plywood', 'Steel Plate', 'Prop', 'Span', 'Clamp'],
  CONSUMABLE: ['Nails', 'Cutting Wheel', 'Welding Rod', 'Cotton Waste'],
  FUEL: ['HSD', 'Petrol', 'Engine Oil', 'Hydraulic Oil', 'Grease'],
  ADMIXTURE: ['Plasticiser', 'Retarder', 'Curing Compound', 'Waterproofing'],
  PIPES_FITTINGS: ['RCC Pipe', 'HDPE', 'GI', 'PVC', 'Valve'],
  ELECTRICAL: ['Cable', 'Switchgear', 'Light Fitting', 'Conduit'],
  SAFETY: ['Helmet', 'Jacket', 'Harness', 'Glove', 'Barricade'],
};

import { num, optionalNumber } from '@/lib/forms';

const optNum = optionalNumber();

export const itemSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, { message: 'Item code must be at least 3 characters.' })
      .max(20, { message: 'Item code cannot exceed 20 characters.' })
      .regex(/^[A-Z0-9\-/]+$/, { message: 'Use capital letters, digits, hyphen or slash only.' }),
    name: z
      .string()
      .trim()
      .min(3, { message: 'Enter the item name.' })
      .max(120, { message: 'Item name cannot exceed 120 characters.' }),
    shortName: z.string().trim().max(30, { message: 'Short name cannot exceed 30 characters.' }),
    specification: z.string().trim().max(300, { message: 'Specification cannot exceed 300 characters.' }),
    oldCode: z.string().trim().max(20),
    brandPreference: z.string().trim().max(60),
    makeOrGrade: z.string().trim().max(60),

    group: z.enum(ITEM_GROUPS),
    subGroup: z.string().trim().max(60),
    itemType: z.enum(ITEM_TYPES),
    isReturnable: z.boolean(),
    isProduced: z.boolean(),
    isBatchTracked: z.boolean(),
    isSerialTracked: z.boolean(),
    requiresQc: z.boolean(),
    isHazardous: z.boolean(),
    shelfLifeDays: optNum,

    stockUomCode: z.string().min(1, { message: 'Select the stock unit.' }),
    purchaseUomCode: z.string(),
    purchaseToStockFactor: optNum,
    issueUomCode: z.string(),
    issueToStockFactor: optNum,

    hsnCode: z.string().min(4, { message: 'Select an HSN or SAC code.' }),
    gstRate: z.number(),

    reorderLevel: optNum,
    minStockLevel: optNum,
    maxStockLevel: optNum,
    leadTimeDays: optNum,
    allowNegativeStock: z.boolean(),
    defaultStoreSiteId: z.string(),
    binLocation: z.string().trim().max(30),

    valuationMethod: z.enum(VALUATION_METHODS),
    standardRate: optNum,
    lastPurchaseRate: optNum,
    budgetRateRef: optNum,

    isCapitalItem: z.boolean(),
    isActive: z.boolean(),
    remarks: z.string().trim().max(500),
  })
  .superRefine((v, ctx) => {
    const pf = num(v.purchaseToStockFactor);
    const if_ = num(v.issueToStockFactor);
    const min = num(v.minStockLevel);
    const max = num(v.maxStockLevel);
    const reorder = num(v.reorderLevel);
    const shelf = num(v.shelfLifeDays);

    // 1 — purchase unit needs a factor
    if (v.purchaseUomCode && (pf === undefined || pf <= 0))
      ctx.addIssue({ code: 'custom', path: ['purchaseToStockFactor'], message: 'Enter how many stock units make one purchase unit.' });

    // 2 — factor without a unit is meaningless
    if (!v.purchaseUomCode && pf !== undefined)
      ctx.addIssue({ code: 'custom', path: ['purchaseUomCode'], message: 'Select the purchase unit for this factor.' });

    // 3 — same unit must convert 1:1
    if (v.purchaseUomCode && v.purchaseUomCode === v.stockUomCode && pf !== undefined && pf !== 1)
      ctx.addIssue({ code: 'custom', path: ['purchaseToStockFactor'], message: 'Purchase and stock unit are the same, so the factor must be 1.' });

    // 4 — issue unit needs a factor
    if (v.issueUomCode && (if_ === undefined || if_ <= 0))
      ctx.addIssue({ code: 'custom', path: ['issueToStockFactor'], message: 'Enter how many stock units make one issue unit.' });

    // 5 — max below min
    if (min !== undefined && max !== undefined && max < min)
      ctx.addIssue({ code: 'custom', path: ['maxStockLevel'], message: 'Maximum stock cannot be below minimum stock.' });

    // 6 — reorder above max
    if (reorder !== undefined && max !== undefined && reorder > max)
      ctx.addIssue({ code: 'custom', path: ['reorderLevel'], message: 'Reorder level cannot exceed maximum stock.' });

    // 7 — services are not stocked
    if (v.itemType === 'SERVICE') {
      if (min !== undefined || max !== undefined || reorder !== undefined)
        ctx.addIssue({ code: 'custom', path: ['itemType'], message: 'A service cannot carry stock levels. Clear them or change the item type.' });
      if (v.isBatchTracked || v.isSerialTracked)
        ctx.addIssue({ code: 'custom', path: ['itemType'], message: 'A service cannot be batch or serial tracked.' });
    }

    // 8 — batch and serial are mutually exclusive
    if (v.isBatchTracked && v.isSerialTracked)
      ctx.addIssue({ code: 'custom', path: ['isSerialTracked'], message: 'Choose either batch tracking or serial numbering, not both.' });

    // 9 — shelf life needs batch tracking to be enforceable
    if (shelf !== undefined && shelf > 0 && !v.isBatchTracked)
      ctx.addIssue({ code: 'custom', path: ['isBatchTracked'], message: 'Shelf life can only be tracked when the item is batch tracked.' });
  });

export type ItemFormValues = z.infer<typeof itemSchema>;

export const emptyItem: ItemFormValues = {
  code: '', name: '', shortName: '', specification: '', oldCode: '',
  brandPreference: '', makeOrGrade: '',
  group: 'CEMENT', subGroup: '', itemType: 'MATERIAL',
  isReturnable: false, isProduced: false, isBatchTracked: false,
  isSerialTracked: false, requiresQc: false, isHazardous: false, shelfLifeDays: '',
  stockUomCode: '', purchaseUomCode: '', purchaseToStockFactor: '',
  issueUomCode: '', issueToStockFactor: '',
  hsnCode: '', gstRate: 0,
  reorderLevel: '', minStockLevel: '', maxStockLevel: '', leadTimeDays: '',
  allowNegativeStock: false, defaultStoreSiteId: '', binLocation: '',
  valuationMethod: 'WEIGHTED_AVERAGE', standardRate: '', lastPurchaseRate: '', budgetRateRef: '',
  isCapitalItem: false, isActive: true, remarks: '',
};

/** Type-driven defaults applied when the user changes Item Type. */
export function defaultsForType(type: ItemType): Partial<ItemFormValues> {
  switch (type) {
    case 'RETURNABLE':
      return { isReturnable: true, isProduced: false, valuationMethod: 'STANDARD' };
    case 'PRODUCED':
      return { isProduced: true, isReturnable: false, requiresQc: true, isBatchTracked: true };
    case 'FUEL':
      return { isBatchTracked: false, isSerialTracked: false, requiresQc: false, isHazardous: true };
    case 'SERVICE':
      return {
        isBatchTracked: false, isSerialTracked: false, isReturnable: false, isProduced: false,
        reorderLevel: '', minStockLevel: '', maxStockLevel: '',
      };
    case 'ASSET':
      return { isCapitalItem: true, isSerialTracked: true, isBatchTracked: false };
    case 'SPARE':
      return { requiresQc: true, isReturnable: false };
    default:
      return { isReturnable: false, isProduced: false };
  }
}
