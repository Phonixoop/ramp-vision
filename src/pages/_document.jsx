import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html className=" h-full" dir="rtl">
      <Head>
        {/* <link rel="shortcut icon" href={favicon} /> */}
        {/* <link rel="shortcut icon" href="/icons/main/roomchi.svg" /> */}
      </Head>

      <body
        className="theme-dark-3 scrollbar-track-[var(--accent)] h-full"
        style={{
          overflow: "overlay",
        }}
      >
        <Main />
        <div id="overlay"></div>
        <div
          id="portal"
          style={{
            overflow: "hidden",
          }}
        ></div>
        <div
          id="user-nav"
          style={{
            position: "sticky",
            bottom: "25px",
            marginTop: "25px",
            zIndex: "1000",
          }}
        ></div>
        <dir id="toast"></dir>

        <NextScript />
      </body>
    </Html>
  );
}
/*

        <Scrollbar
          plugins={{
            overscroll: {
              effect: "glow",
            },
          }}
        >
        */
