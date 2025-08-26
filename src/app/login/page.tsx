import BlurBackground from "~/ui/blur-backgrounds";

import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import { CreateAccountForm } from "~/app/login/form";

export default async function LoginPage() {
  const session = await getServerAuthSession();
  if (session) redirect("/");

  return (
    <>
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-secondary transition-colors duration-1000 ">
        <div className="absolute top-0 flex w-full items-start justify-center"></div>
        <div className="flex w-full items-center justify-center">
          <div className=" flex w-11/12 md:w-3/5">
            <CreateAccountForm />
          </div>
        </div>
      </div>
    </>
  );
}
