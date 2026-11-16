import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

export default async function PersonnelPerformanceChartCityV2Page() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/login");
  }

  // City segment is consumed by ChartClient via useParams.
  return null;
}
