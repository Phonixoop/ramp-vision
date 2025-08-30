import { z } from 'zod';
import { normalizeFilters, RawFiltersSchema, ResolvedFiltersSchema } from '../../lib/filters';

// tRPC-style router module (non-invasive): export procedures for integration

export const applyFiltersInput = z.object({
  rawFilters: RawFiltersSchema,
  view: z.enum(['table', 'charts', 'table+charts']).default('table+charts'),
});

export const applyFiltersOutput = z.object({
  resolvedFilters: ResolvedFiltersSchema,
});

export async function personnelApplyFilters(opts: z.infer<typeof applyFiltersInput>) {
  const resolved = normalizeFilters(opts.rawFilters);
  // Intentionally only validation/normalization here.
  return { resolvedFilters: resolved } as z.infer<typeof applyFiltersOutput>;
}

