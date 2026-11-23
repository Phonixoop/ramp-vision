export const metadata = {
  title: "جدول عملکرد پرسنل | رمپ",
  description:
    "جدول عملکرد پرسنل با صفحه‌بندی سمت سرور، فیلتر چندشهری و خروجی CSV",
};

/**
 * The route's content is mounted by `layout.tsx`, which does not render
 * `children` (it needs to own the auth gate and the Suspense boundary for
 * `useSearchParams`). This file therefore only carries metadata — putting a
 * redirect here would silently never run.
 */
export default function PersonnelPerformanceTableV2Page() {
  return null;
}
