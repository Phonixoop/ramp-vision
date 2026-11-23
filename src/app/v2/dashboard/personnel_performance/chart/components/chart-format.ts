/**
 * Number / percentage formatting for the v2 chart cards.
 *
 * The dashboard is Persian, so every value rendered by these cards goes
 * through `fa-IR` — Persian digits, Persian thousands separator, and the
 * Persian percent sign (`٪`, U+066A) rather than `%`.
 *
 * Formatters are module-level so a re-render never rebuilds `Intl` instances.
 */

const faInteger = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
const faDecimal = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 2,
});

/** `1234` → `۱٬۲۳۴` */
export function formatFaNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return faInteger.format(Math.round(value));
}

/** `12.5` → `۱۲٫۵` (drops trailing zeros: `12` → `۱۲`) */
export function formatFaDecimal(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return faDecimal.format(value);
}

/** `78` → `۷۸٪` */
export function formatFaPercent(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${faInteger.format(Math.round(value))}٪`;
}

/** `12.4` → `۱۲٫۴٪` */
export function formatFaPercentDecimal(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${faDecimal.format(value)}٪`;
}
