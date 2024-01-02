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
        className={twMerge("h-4 w-4", className)}
        width="112"
        height="111"
        viewBox="0 0 112 111"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.5 41.1239C2.5 35.3964 2.50531 31.3522 2.91705 28.2898C3.31911 25.2992 4.06705 23.6218 5.28249 22.4064C6.49792 21.1909 8.17531 20.443 11.1659 20.0409C14.2283 19.6292 18.2725 19.6239 24 19.6239H57.604C65.6886 19.6239 71.5005 19.6292 75.9245 20.224C80.2767 20.8091 82.9094 21.9232 84.8571 23.8709C86.8048 25.8185 87.9188 28.4513 88.5039 32.8034C89.0987 37.2274 89.104 43.0394 89.104 51.1239V90.0182C89.104 94.8029 89.0987 98.1399 88.7602 100.658C88.4314 103.104 87.8299 104.399 86.9073 105.321C85.9848 106.244 84.6896 106.845 82.2436 107.174C79.7258 107.513 76.3888 107.518 71.604 107.518H24C18.2725 107.518 14.2283 107.513 11.1659 107.101C8.17531 106.699 6.49792 105.951 5.28249 104.736C4.06705 103.52 3.31912 101.843 2.91705 98.8523C2.50531 95.7898 2.5 91.7457 2.5 86.0181V41.1239Z"
          stroke="white"
          stroke-width="5"
        />
        <path
          d="M0 3H89C98.4281 3 103.142 3 106.071 5.92893C109 8.85786 109 13.5719 109 23V110.018"
          stroke="white"
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
        className="sticky top-0 z-50 flex  w-full flex-col items-center justify-between border-b border-primary/20 bg-secondary/50 py-5 backdrop-blur-lg sm:p-0 "
      >
        <div className="flex w-full flex-col items-center justify-between gap-4 py-2 lg:w-11/12 lg:flex-row ">
          {session.status !== "loading" && (
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <div className="flex items-center justify-center gap-4">
                <LogoRamp className="h-8 w-8 stroke-primary" />
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
          <span className="px-2">{sessionData.user?.username}</span>
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
