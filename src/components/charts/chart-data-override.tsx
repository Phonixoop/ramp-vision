"use client";

/**
 * Passthrough stub for Bklit Studio data overrides.
 * Full override plumbing is optional; sparklines only need `{ data }`.
 */
export function useChartDataOverride<T extends { data?: unknown }>(
  _componentName: string,
  props: T,
): T {
  return props;
}
