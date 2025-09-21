"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

import { ModalProvider } from "~/context/modal.context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SessionProvider>
        <ThemeProvider
          defaultTheme="system"
          enableSystem
          enableColorScheme
          themes={["light", "dark"]}
        >
          <ModalProvider>{children}</ModalProvider>
        </ThemeProvider>
      </SessionProvider>
    </>
  );
}
