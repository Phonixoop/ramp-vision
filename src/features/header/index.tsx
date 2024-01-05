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
import { Permission, User } from "~/types";
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
        width="108"
        height="108"
        viewBox="0 0 108 108"
        fill="none"
        className={twMerge("h-auto w-7 fill-primary", className)}
      >
        <path d="M95.5 1H2L14 15H95V93L107.5 105.5V13C107.5 6.37258 102.127 1 95.5 1Z" />
        <path d="M16 20L30 33.5H15.5V93.5H74V77L88 90.5V95C88 101.627 82.6274 107 76 107H18C9.16344 107 2 99.8366 2 91V34C2 26.268 8.26801 20 16 20Z" />
      </svg>
    </>
  );
}
export default function Header() {
  const session = useSession();

  return (
    <>
      <header
        dir="rtl"
        className="sticky top-0 z-50 flex w-full flex-col items-center justify-between border-b border-primary/20 bg-secondary/50 py-5 backdrop-blur-lg sm:p-0 "
      >
        <div className="flex w-full flex-col items-center justify-between gap-4 py-2 lg:w-11/12 lg:flex-row ">
          {session.status !== "loading" && (
            <div className="flex w-full flex-col  items-center justify-center gap-4 px-2 sm:w-max sm:flex-row sm:px-0">
              <div className="flex items-center justify-center gap-4">
                <LogoRamp />
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
            <AuthShowcase session={session} />
          </div>
        </div>
      </header>
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
  const user: User = sessionData?.user;

  if (status === "loading")
    return <div className="h-5 w-20 animate-pulse"></div>;

  if (status === "unauthenticated" || !user)
    return (
      <div className="flex w-full items-center justify-between gap-5">
        <Button
          className="flex  items-center justify-center gap-2 rounded-lg border border-accent bg-primary stroke-accent p-0 px-2 py-1  text-secondary"
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          <span className="">{sessionData ? "خروج" : "ورود"}</span>
          <FormInputIcon className="stroke-secondary" />
        </Button>
        <ThemeProvider>
          <ThemeSwitch />
        </ThemeProvider>
      </div>
    );

  const permissions: Permission[] = JSON.parse(user?.role?.permissions);

  const permission = permissions.find((p) => p.id === "ViewAdmin");
  const isAdmin = permission && permission?.isActive === true;

  return (
    <div className="flex flex-col gap-2 rounded-full sm:flex-row">
      <div className="flex w-full items-center justify-between gap-5">
        <ThemeProvider>
          <ThemeSwitch />
        </ThemeProvider>
        <Button
          className="flex  items-center justify-center gap-2 rounded-xl border border-primary/20  stroke-accent p-0 px-6 py-1  text-primary"
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          <span>{sessionData ? "خروج" : "ورود"}</span>
        </Button>{" "}
      </div>
      <div className="relative flex items-center justify-center gap-2 rounded-full  ">
        <span className="flex  items-stretch justify-center gap-2 rounded-full stroke-accent px-3 text-accent">
          <span className="px-2">
            {user?.display_name ? user.display_name : user.username}
          </span>
        </span>

        {isAdmin && (
          <>
            <div className="h-[15px] w-[0.5px] bg-accent"></div>
            <Link href={"/admin"}>
              <Button className="flex min-w-max items-stretch justify-center gap-2 rounded-xl bg-secondary  stroke-accent  text-accent">
                <div className="flex w-fit items-center justify-center gap-2">
                  <span>پنل ادمین</span>
                  <UserCog2Icon />
                </div>
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
