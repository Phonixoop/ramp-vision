import Head from "next/head";
import BlurBackground from "~/ui/blur-backgrounds";
import { PersonnelPerformanceTable } from "./components/PersonnelPerformanceTable";
import { PersonnelPerformanceProvider } from "./context";
import { TableDataProvider } from "~/context/table-data.context";
import { WorkDaysToggleProvider } from "~/context/work-days-toggle.context";
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function PersonnelPerformancePage() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <Head>
        <title>RAMP | Vision</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* <BlurBackground /> */}

      <div className="flex min-h-screen w-full flex-col items-center justify-between gap-5 bg-secondary transition-colors duration-1000">
        <div className="w-full sm:p-0 xl:w-11/12">
          <TableDataProvider>
            <WorkDaysToggleProvider>
              <PersonnelPerformanceProvider>
                <PersonnelPerformanceTable sessionData={session} />
              </PersonnelPerformanceProvider>
            </WorkDaysToggleProvider>
          </TableDataProvider>
        </div>
      </div>
    </>
  );
}
