/**
 * Shared semantic colors for depo pie + bar charts.
 * Keep in sync with `--depo-chart-*` in `src/styles/globals.css`.
 */
export const DEPO_CHART_COLORS = {
  /** دپو */
  depo: "var(--depo-chart-depo)",
  /** ورودی */
  entry: "var(--depo-chart-entry)",
  /** رسیدگی / capacity */
  capacity: "var(--depo-chart-capacity)",
  /** مانده */
  remaining: "var(--depo-chart-remaining)",
  /** مستقیم */
  direct: "var(--depo-chart-direct)",
  /** غیر مستقیم */
  indirect: "var(--depo-chart-indirect)",
} as const;

/** Alias: رسیدگی uses the same color as capacity */
export const DEPO_CHART_HANDLED = DEPO_CHART_COLORS.capacity;
