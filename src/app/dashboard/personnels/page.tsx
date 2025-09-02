import Head from "next/head";
import BlurBackground from "~/ui/blur-backgrounds";
import { PersonnelsTable } from "./components/PersonnelsTable";
import { PersonnelsProvider } from "./context";
import { TableDataProvider } from "~/context/table-data.context";
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function PersonnelsPage() {
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
            <PersonnelsProvider>
              <PersonnelsTable sessionData={session} />
            </PersonnelsProvider>
          </TableDataProvider>
        </div>
      </div>
    </>
  );
}
