import { z } from 'zod';
import { normalizeFilters, stableStringify, sha256Hex, signHmacSHA256, putExportFilters, RawFiltersSchema } from '../../lib/filters';

export const getExportUrlInput = z.object({
  rawFilters: RawFiltersSchema,
  format: z.enum(['csv', 'zip']).default('csv'),
});

export const getExportUrlOutput = z.object({
  url: z.string().url(),
  key: z.string(),
  sig: z.string(),
});

export async function getExportUrl(input: z.infer<typeof getExportUrlInput>) {
  const resolved = normalizeFilters(input.rawFilters);
  const stable = stableStringify(resolved);
  const key = sha256Hex(stable);

  // Remember filters in-memory for the export route (so URL stays small)
  putExportFilters(key, resolved);

  const secret = process.env.EXPORT_SIGNING_SECRET || 'dev-secret-change-me';
  const msg = `${key}:${input.format}`;
  const sig = signHmacSHA256(msg, secret);
  const url = `/api/export/personnel?key=${encodeURIComponent(key)}&fmt=${encodeURIComponent(input.format)}&sig=${encodeURIComponent(sig)}`;
  return { url, key, sig } as z.infer<typeof getExportUrlOutput>;
}

