export const metadata = {
  title: "دپو | رمپ",
  description:
    "داشبورد دپو با صفحه‌بندی سمت سرور، نمودار فعالیت‌ها و تخمین زمان اتمام",
};

/**
 * The route's content is mounted by `layout.tsx`, which does not render
 * `children` (it needs to own the auth gate and the Suspense boundary for
 * `useSearchParams`). This file therefore only carries metadata — putting a
 * redirect here would silently never run.
 */
export default function DepoV2Page() {
  return null;
}
