import { MoonIcon, SunDimIcon, UserCog2Icon } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import React, { useState } from "react";
import { Switch } from "~/components/ui/switch";
import { MENU } from "~/constants";
import { ThemeProvider, useTheme } from "~/context/theme.context";
import Menu from "~/features/menu";
import { ThemeBoxHovery } from "~/features/theme-box";
import useLocalStorage from "~/hooks/useLocalStorage";
import Button from "~/ui/buttons";
import { Container } from "~/ui/containers";
import { api } from "~/utils/api";

export default function Header() {
  return (
    <>
      <Container
        className="flex  flex-col items-center justify-between py-5 sm:p-0 "
        rtl={true}
      >
        <div className="flex flex-col items-center justify-center gap-4 py-5 md:flex-row ">
          <AuthShowcase />
          <ThemeProvider>
            <ThemeSwitch />
          </ThemeProvider>
          <Menu rootPath="/" list={MENU} />
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
          setValue(!value);
          if (!value) {
            document.querySelector("body").className = "theme-dark-1";
            setTheme("theme-dark-1");
          } else {
            document.querySelector("body").className = "theme-light-4";
            setTheme("theme-light-4");
          }
        }}
      />
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  return (
    <>
      <Button
        className="flex items-stretch justify-center gap-2 rounded-full bg-secbuttn stroke-accent px-3 text-accent"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        <span className="pt-1">
          {sessionData ? sessionData.user?.username : "ورود"}
        </span>
        <span>
          <UserCog2Icon />
        </span>
      </Button>
    </>
  );
}
