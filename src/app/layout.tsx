import "~/styles/globals.css";

import localFont from "next/font/local";
import { TRPCReactProvider } from "~/trpc/react";
import Header from "~/features/header";

import Footer from "~/features/footer";
import { Metadata } from "next";
import { Providers } from "~/app/providers";

export const metadata: Metadata = {
  title: "رمپ",
  description: "نرم افزار جامع مدیریت و تحلیل عملکرد پرسنل و شعب",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};
const iranSans = localFont({
  src: [
    {
      path: "../../public/fonts/iransansX/IRANSansXFaNum-Thin.woff",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/iransansX/IRANSansXFaNum-UltraLight.woff",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/iransansX/IRANSansXFaNum-Light.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/iransansX/IRANSansXFaNum-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/iransansX/IRANSansXFaNum-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/iransansX/IRANSansXFaNum-DemiBold.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/iransansX/IRANSansXFaNum-Bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/iransansX/IRANSansXFaNum-ExtraBold.woff",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/iransansX/IRANSansXFaNum-Black.woff",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-iransans",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      lang="fa"
      className={`${iranSans.variable} h-full font-iransans`}
    >
      <body className="scrollbar-track-[var(--accent)] relative min-h-[100dvh] bg-secondary">
        <Providers>
          <div id="overlay"></div>
          <div
            id="portal"
            style={{
              overflow: "hidden",
            }}
          ></div>

          <div id="toast"></div>

          <TRPCReactProvider>
            <Header />

            {children}
            {/* {process.env.NODE_ENV === "development" && <ScreenSize />} */}

            <Footer />
          </TRPCReactProvider>
        </Providers>
      </body>
    </html>
  );
}
