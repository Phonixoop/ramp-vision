import Head from "next/head";
import BlurBackground from "~/ui/blur-backgrounds";

import { PishkhanProvider } from "./context";
import { TableDataProvider } from "~/context/table-data.context";
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import { PishkhanTable } from "~/app/dashboard/personnel_performance/pishkhan/components";

export default async function PishkhanPage() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <Head>
        <title>RAMP | Vision - جزئیات ورودی اسناد مستقیم شعب</title>
        <meta name="description" content="جزئیات ورودی اسناد مستقیم شعب" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <BlurBackground />

      <div className="flex min-h-screen w-full flex-col items-center justify-between gap-5 bg-secondary transition-colors duration-1000">
        <div className="w-full sm:p-0 xl:w-11/12">
          <TableDataProvider>
            <PishkhanProvider>
              <PishkhanTable sessionData={session} />
            </PishkhanProvider>
          </TableDataProvider>
        </div>
      </div>
    </>
  );
}
