import Head from "next/head";
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function PersonnelPerformanceChartPage() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <Head>
        <title>RAMP | Vision - نمودار عملکرد پرسنل</title>
        <meta name="description" content="نمودار عملکرد پرسنل شعب" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </>
  );
}
