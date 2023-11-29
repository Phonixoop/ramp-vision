import { MoonIcon, SunDimIcon, UserCog2Icon } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import React, { useState } from "react";
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

function checkStatusForMenu(status) {
  if (status === "unauthenticated")
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
export default function Header() {
  const session = useSession();

  return (
    <>
      <Container
        className="flex  flex-col items-center justify-between py-5 sm:p-0 "
        rtl={true}
      >
        <div className="flex flex-col items-center justify-center gap-4 py-5 md:flex-row ">
          <AuthShowcase session={session} />
          <ThemeProvider>
            <ThemeSwitch />
          </ThemeProvider>
          {session.status !== "loading" && (
            <Menu rootPath="/" list={checkStatusForMenu(session.status)} />
          )}
        </div>
      </Container>
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
          (!theme.includes("dark") && !theme.includes("light")) || theme == ""
        }
        checked={theme.includes("dark") ? true : false}
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

  if (status === "loading")
    return <div className="h-5 w-20 animate-pulse"></div>;

  if (status === "unauthenticated")
    return (
      <Button
        className="flex  items-stretch justify-center gap-2 rounded-full bg-secbuttn stroke-accent px-3 text-accent"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        <span className="">{sessionData ? "خروج" : "ورود"}</span>
      </Button>
    );

  const user = sessionData?.user;

  const permissions: Permission[] = JSON.parse(user.role?.permissions);

  const permission = permissions.find((p) => p.id === "ViewAdmin");
  const isAdmin = permission && permission?.isActive === true;

  return (
    <div className="flex gap-2 rounded-full bg-primary/10 p-2">
      <Button
        className="relative flex   justify-center gap-2 rounded-full bg-secbuttn stroke-accent px-3 text-accent"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        <span className="">{sessionData ? "خروج" : "ورود"}</span>
      </Button>

      <div className="relative flex items-center justify-center gap-2 rounded-full bg-primary/10 px-1 py-1">
        <span className="flex  items-stretch justify-center gap-2 rounded-full stroke-accent px-3 text-accent">
          <span className="p-2">{sessionData.user?.username}</span>
        </span>

        {isAdmin && (
          <>
            <div className="  h-[10px] w-[0.5px] bg-accent"></div>
            <Link href={"/admin"}>
              <Button className="flex  items-stretch justify-center gap-2 rounded-full bg-secbuttn stroke-accent px-3 text-accent">
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
