import { z } from 'zod';

/** Dotted numeric, two digits per level: 01, 01.01, 01.01.01. */
export const WBS_CODE_RE = /^\d{2}(\.\d{2})*$/;

export const wbsSchema = z
  .object({
    projectId: z.string().min(1, 'Project is required'),
    code: z
      .string()
      .trim()
      .min(2, 'WBS code is required')
      .max(14, 'Use 14 characters or fewer')
      .regex(WBS_CODE_RE, 'Use dotted two-digit codes, e.g. 01.02'),
    name: z.string().trim().min(3, 'Description is required').max(80, 'Use 80 characters or fewer'),
    /** '' = top level. */
    parentId: z.string(),
    /** Derived from the parent, never typed by the user. */
    level: z.number().int().min(1).max(4),
    /** '' = not measurable; a cost-only rollup node. */
    uomCode: z.string(),
    budgetedQty: z.union([z.number().nonnegative(), z.literal('')]),
    /** Entered in crore, stored in rupees (D-059, D-063). */
    budgetedCostCrore: z.union([z.number().nonnegative(), z.literal('')]),
    isActive: z.boolean(),
  })
  .superRefine((v, ctx) => {
    // Fixtures pair these consistently: every node with a UOM has a quantity.
    if (v.uomCode !== '' && v.budgetedQty === '') {
      ctx.addIssue({ code: 'custom', path: ['budgetedQty'], message: 'Enter the budgeted quantity, or clear the unit' });
    }
    if (v.uomCode === '' && v.budgetedQty !== '') {
      ctx.addIssue({ code: 'custom', path: ['uomCode'], message: 'Select the unit for this quantity' });
    }
    // Code depth must agree with the tree depth.
    const segments = v.code.split('.').length;
    if (segments !== v.level) {
      ctx.addIssue({
        code: 'custom',
        path: ['code'],
        message: `A level ${v.level} node needs ${v.level} code segment${v.level > 1 ? 's' : ''}`,
      });
    }
  });

export type WbsFormValues = z.infer<typeof wbsSchema>;

export const emptyWbs = (projectId: string): WbsFormValues => ({
  projectId,
  code: '',
  name: '',
  parentId: '',
  level: 1,
  uomCode: '',
  budgetedQty: '',
  budgetedCostCrore: '',
  isActive: true,
});

/** Ancestor ids of a node, nearest first. Used for cycle checks and indent. */
export function ancestorIds(nodeId: string, byId: Map<string, { parentId: string | null }>): string[] {
  const out: string[] = [];
  let cur = byId.get(nodeId)?.parentId ?? null;
  // Bounded so a corrupt parentId cycle cannot hang the screen.
  while (cur && out.length < 10) {
    out.push(cur);
    cur = byId.get(cur)?.parentId ?? null;
  }
  return out;
}

/** Depth-first order, parents immediately followed by their children. */
export function sortTree<T extends { id: string; code: string; parentId: string | null }>(nodes: T[]): T[] {
  const children = new Map<string | null, T[]>();
  for (const n of nodes) {
    const key = n.parentId;
    if (!children.has(key)) children.set(key, []);
    children.get(key)!.push(n);
  }
  for (const list of children.values()) list.sort((a, b) => a.code.localeCompare(b.code));
  const out: T[] = [];
  const walk = (parentId: string | null, guard: number) => {
    if (guard > 10) return;
    for (const n of children.get(parentId) ?? []) {
      out.push(n);
      walk(n.id, guard + 1);
    }
  };
  walk(null, 0);
  // Any node whose parent is missing would be dropped by the walk — append it.
  if (out.length < nodes.length) {
    const seen = new Set(out.map((n) => n.id));
    out.push(...nodes.filter((n) => !seen.has(n.id)));
  }
  return out;
}
