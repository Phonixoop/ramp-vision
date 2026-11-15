import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import { PersonnelDirectory } from "./personnel-directory";

export const metadata = {
  title: "پرسنل | رمپ",
};

export default async function PersonnelsV2Page() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/login");
  }

  return <PersonnelDirectory />;
}
