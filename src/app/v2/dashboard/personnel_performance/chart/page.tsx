import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

export const metadata = {
  title: "نمودار عملکرد پرسنل | رمپ",
  description: "نمودار عملکرد پرسنل شعب با فیلترهای همگام با URL",
};

export default async function PersonnelPerformanceChartV2Page() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/login");
  }

  // Layout mounts ChartClient; this page only gates auth.
  return null;
}
