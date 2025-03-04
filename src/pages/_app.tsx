import { SessionProvider } from "next-auth/react";
import { AppProps, type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { ReactElement, ReactNode, useEffect, useLayoutEffect } from "react";
import { NextPage } from "next";
import ProgressBar from "@badrap/bar-of-progress";
import { useRouter } from "next/router";
import { Toaster } from "~/components/ui/sonner";
import { PersonnelFilterProvider } from "~/context/personnel-filter.context";
import { Default_Theme } from "~/constants/theme";
import BlurBackground from "~/ui/blur-backgrounds";
import Footer from "~/features/footer";
import Header from "~/features/header";
import { ModalProvider } from "~/context/modal.context";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  PageLayout?: (page: ReactElement) => ReactElement<any, any>;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const progress = new ProgressBar({
  size: 2,
  color: "#ffffff",
  className: "bar-of-progress",
  delay: 100,
});
function matchColorSchemeToTheme(theme: string) {
  if (theme.search("light")) {
    localStorage.setItem("theme", theme);
    return (document.querySelector("html").style.colorScheme = "light");
  }
  if (theme.search("dark")) {
    localStorage.setItem("theme", theme);
    return (document.querySelector("html").style.colorScheme = "dark");
  }
  localStorage.setItem("theme", Default_Theme);
  return (document.querySelector("html").style.colorScheme = "dark");
}
function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
  const router = useRouter();
  const canUseDOM = typeof window !== "undefined";
  const useIsomorphicLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;
  useIsomorphicLayoutEffect(() => {
    //top progress bar
    router.events.on("routeChangeStart", progress.start);
    router.events.on("routeChangeComplete", progress.finish);
    router.events.on("routeChangeError", progress.finish);

    // check for theme
    const theme = localStorage.getItem("theme");
    if (theme?.startsWith("theme")) {
      document.querySelector("body").className = theme;
      matchColorSchemeToTheme(theme);
      return;
    }

    // const matchPrefersLight = window.matchMedia("(prefers-color-scheme:light)");
    // if (matchPrefersLight.matches) {
    //   document.querySelector("body").className = "theme-light-4";
    //   localStorage.setItem("theme", "theme-light-4");
    //   matchColorSchemeToTheme("light");
    // } else {
    //   document.querySelector("body").className = "theme-dark-1";
    //   localStorage.setItem("theme", "theme-dark-1");
    //   matchColorSchemeToTheme("dark");
    // }
    // matchPrefersLight.addEventListener("change", (event) => {
    //   const theme = event.matches ? "theme-light-4" : "theme-dark-1";

    //   document.querySelector("body").className = theme;
    //   localStorage.setItem("theme", theme);
    //   matchColorSchemeToTheme(theme);
    // });

    return () => {
      router.events.off("routeChangeStart", progress.start);
      router.events.off("routeChangeComplete", progress.finish);
      router.events.off("routeChangeError", progress.finish);
    };
  }, []);

  // Use the layout defined at the page level, if available
  const getLayout = Component.PageLayout ?? ((page) => page);
  // useEffect(() => {
  //   const lenis = new Lenis();

  //   function raf(time) {
  //     lenis.raf(time);
  //     requestAnimationFrame(raf);
  //   }

  //   requestAnimationFrame(raf);
  // }, []);
  return Component.PageLayout ? (
    <>
      <SessionProvider session={session}>
        <PersonnelFilterProvider>
          <ModalProvider>
            <Header />
            <Component.PageLayout {...pageProps} />
            <Toaster />
          </ModalProvider>
        </PersonnelFilterProvider>
        <Footer />
      </SessionProvider>
    </>
  ) : (
    <SessionProvider session={session}>
      <PersonnelFilterProvider>
        {" "}
        <ModalProvider>
          <Header />
          <Component {...pageProps} />
          <Toaster />{" "}
        </ModalProvider>
      </PersonnelFilterProvider>
      <Footer />
    </SessionProvider>
  );
}

//@ts-ignore
export default api.withTRPC(MyApp);
