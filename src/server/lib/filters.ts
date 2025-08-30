import crypto from 'crypto';
import { z } from 'zod';

// Basic filter schema — adapt to your real fields.
export const RawFiltersSchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]).default("monthly"),
  startDate: z.string().optional(), // yyyy-mm-dd from the UI
  endDate: z.string().optional(),   // yyyy-mm-dd from the UI
  ids: z.array(z.string()).optional(),
  departments: z.array(z.string()).optional(),
}).passthrough();

export type RawFilters = z.infer<typeof RawFiltersSchema> & Record<string, unknown>;

// Normalize to a strict shape for consistent hashing and server usage.
export const ResolvedFiltersSchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  ids: z.array(z.string()).default([]),
  departments: z.array(z.string()).default([]),
}).passthrough();

export type ResolvedFilters = z.infer<typeof ResolvedFiltersSchema> & Record<string, unknown>;

export function normalizeFilters(raw: RawFilters): ResolvedFilters {
  const parsed = RawFiltersSchema.parse(raw);
  const resolved = ResolvedFiltersSchema.parse({
    period: parsed.period,
    startDate: parsed.startDate,
    endDate: parsed.endDate,
    ids: parsed.ids ?? [],
    departments: parsed.departments ?? [],
  });
  return resolved;
}

// Keep JSON stable for hashing/signing
export function stableStringify(obj: unknown): string {
  const seen = new WeakSet();
  const stringify = (value: any): any => {
    if (value && typeof value === 'object') {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
      if (Array.isArray(value)) return value.map(stringify);
      return Object.keys(value).sort().reduce((acc, k) => {
        acc[k] = stringify(value[k]);
        return acc;
      }, {} as Record<string, unknown>);
    }
    return value;
  };
  return JSON.stringify(stringify(obj));
}

export function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function signHmacSHA256(message: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

// Period helpers that mirror the UI expectations; monthly LIKE yyyy/MM/%
export function monthlyLike(year: number, month: number): string {
  // month is 1-12
  const mm = String(month).padStart(2, '0');
  const yyyy = String(year);
  return `${yyyy}/${mm}/%`;
}

// Minimal in-memory store for normalized filters keyed by hash for the export route
const exportFilterStore = new Map<string, ResolvedFilters>();

export function putExportFilters(key: string, filters: ResolvedFilters) {
  exportFilterStore.set(key, filters);
}

export function getExportFilters(key: string): ResolvedFilters | undefined {
  return exportFilterStore.get(key);
}

