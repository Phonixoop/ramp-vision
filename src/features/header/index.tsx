import {
  FormInputIcon,
  MoonIcon,
  SunDimIcon,
  UserCog2Icon,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Switch } from "~/components/ui/switch";
import { MENU } from "~/constants";
import Link from "next/link";
import { ThemeProvider, useTheme } from "~/context/theme.context";
import Menu from "~/features/menu";
import { ThemeBoxHovery } from "~/features/theme-box";
import useLocalStorage from "~/hooks/useLocalStorage";
import Button from "~/ui/buttons";
import { Container } from "~/ui/containers";
import { api } from "~/utils/api";
import { Permission } from "~/types";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";
import { twMerge } from "tailwind-merge";

function checkStatusForMenu(status, user) {
  if (status === "unauthenticated" || !user)
    return MENU.filter((menu) => {
      switch (menu.value) {
        case "جزئیات عملکرد شعب":
          return false;
        case "جزئیات عملکرد پرسنل شعب (جدول)":
          return false;
        case "جزئیات عملکرد پرسنل شعب":
          return false;
        case "گیج عملکرد استان ها":
          return false;
        case "پرسنل":
          return false;
      }
      return true;
    });

  return MENU;
}

function LogoRamp({ className = "" }) {
  return (
    <>
      <svg
        viewBox="0 0 58 57"
        fill="none"
        className={twMerge("h-8 w-8", className)}
      >
        <path
          d="M43.7222 41.3579V43.6076C43.7222 46.9265 43.7 48.0865 43.4576 48.9747C42.7586 51.5356 40.7579 53.5364 38.1969 54.2353C37.3088 54.4777 36.1487 54.4999 32.8299 54.4999H23.4366C17.9862 54.4999 14.138 54.4951 11.2108 54.1193C8.34887 53.7519 6.72584 53.0669 5.53469 51.9605C5.36357 51.8016 5.19836 51.6364 5.03941 51.4653C3.93301 50.2741 3.24802 48.6511 2.88061 45.7891C2.50483 42.862 2.5 39.0137 2.5 33.5633V25.1177C2.5 22.2187 2.51204 21.1332 2.68145 20.2788C3.42963 16.5058 6.37913 13.5563 10.1521 12.8082C11.0065 12.6387 12.092 12.6267 14.991 12.6267C20.9012 12.6267 23.4923 12.6387 25.5987 13.0565C34.5348 14.8285 41.5205 21.8141 43.2925 30.7502C43.7102 32.8567 43.7222 35.4478 43.7222 41.3579Z"
          stroke-width="5"
        />

        <path
          d="M0 3H5C28.5702 3 40.3553 3 47.6777 10.3223C55 17.6447 55 29.4298 55 53V57"
          stroke-width="5"
        />
      </svg>
    </>
  );
}
export default function Header() {
  const session = useSession();

  return (
    <>
      <div
        dir="rtl"
        className="z-50  flex w-full flex-col items-center justify-between border-b border-primary/20 bg-secondary/50 py-5  sm:p-0 "
      >
        <div className="flex w-9/12 flex-col items-center justify-between gap-4 py-2 md:flex-row ">
          {session.status !== "loading" && (
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <div className="flex items-center justify-center gap-4">
                <LogoRamp className="h-6 w-6 stroke-primary" />
                <span className="text-lg font-bold text-primary underline underline-offset-4">
                  RAMP
                </span>
              </div>
              <Menu
                rootPath="/"
                list={checkStatusForMenu(session.status, session?.data?.user)}
              />
            </div>
          )}
          <div className="flex  items-center justify-center gap-5">
            <ThemeProvider>
              <ThemeSwitch />
            </ThemeProvider>
            <AuthShowcase session={session} />
          </div>
        </div>
      </div>
    </>
  );
}

function ThemeSwitch() {
  const canUseDOM: boolean = !!(
    typeof window !== "undefined" &&
    typeof window.document !== "undefined" &&
    typeof window.document.createElement !== "undefined"
  );
  const [value, setValue] = useState(true);

  const { theme, setTheme } = useTheme();

  return (
    <>
      <Switch
        dir="ltr"
        className="scale-125"
        middle={
          (!theme?.includes("dark") && !theme?.includes("light")) || theme == ""
        }
        checked={theme?.includes("dark") ? true : false}
        IconLeft={SunDimIcon}
        IconRight={MoonIcon}
        onClick={() => {
          if (value === false) {
            document.querySelector("body").className = "theme-dark-1";
            setTheme("theme-dark-1");
            localStorage.setItem("theme", "theme-dark-1");
          } else {
            document.querySelector("body").className = "theme-light-4";

            setTheme("theme-light-4");
            localStorage.setItem("theme", "theme-light-4");
          }
          setValue(!value);
        }}
      />
    </>
  );
}

function AuthShowcase({ session }) {
  const { data: sessionData, status } = session;
  const user = sessionData?.user;

  if (status === "loading")
    return <div className="h-5 w-20 animate-pulse"></div>;

  if (status === "unauthenticated" || !user)
    return (
      <Button
        className="flex  items-center justify-center gap-2 rounded-lg border border-accent bg-primary stroke-accent p-0 px-2 py-1  text-secondary"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        <span className="">{sessionData ? "خروج" : "ورود"}</span>
        <FormInputIcon className="stroke-secondary" />
      </Button>
    );

  const permissions: Permission[] = JSON.parse(user?.role?.permissions);

  const permission = permissions.find((p) => p.id === "ViewAdmin");
  const isAdmin = true && true === true;

  return (
    <div className="flex gap-2 rounded-full">
      <Button
        className="flex  items-center justify-center gap-2 rounded-xl border border-primary/20  stroke-accent p-0 px-6 py-1  text-primary"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        <span>{sessionData ? "خروج" : "ورود"}</span>
      </Button>

      <div className="relative flex items-center justify-center gap-2 rounded-full  ">
        <span className="flex  items-stretch justify-center gap-2 rounded-full stroke-accent px-3 text-accent">
          <span className="px-2">{sessionData.user?.username}</span>
        </span>

        {isAdmin && (
          <>
            <div className="h-[15px] w-[0.5px] bg-accent"></div>
            <Link href={"/admin"}>
              <Button className="flex items-stretch justify-center gap-2 rounded-xl bg-secondary  stroke-accent px-3 text-accent">
                <span className="flex items-center justify-center gap-2">
                  <p>پنل ادمین</p>
                  <UserCog2Icon />
                </span>
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
