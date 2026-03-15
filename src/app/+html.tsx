import { ScrollViewStyleReset } from "expo-router/html";
import { PropsWithChildren, useEffect } from "react";

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
// https://docs.expo.dev/guides/progressive-web-apps/
export default function Root({ children }: PropsWithChildren) {
  useEffect(() => {
    // remove expo-generated-fonts element
    const el = document.getElementById("expo-generated-fonts");
    if (el) el.remove();
  }, []);

  return (
    <html lang="de">
      <head>
        {/* Core */}
        <meta charSet="utf-8" />
        <meta
          name="robots"
          content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/Manrope-VariableFont_wght.woff2"
          crossOrigin={"anonymous"}
        />

        {/* Link the PWA manifest file. */}
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo_180.png" />

        <style>{`
                    @font-face {
                      font-family: "Manrope";
                      src: url("/fonts/Manrope-VariableFont_wght.woff2") format("woff2-variations");
                      font-weight: 400 700;
                      font-display: swap;
                      font-style: normal;
                    }

                    /* Firefox + Brave */
                    * {
                        scrollbar-width: thin;
                        scrollbar-color: rgba(155,155,155,.5) rgba(100,100,100,.5);
                    }
                    
                    /* Chromium (außer Brave) */
                    *::-webkit-scrollbar {
                        width: 4px;
                        height: 4px;
                    }
                    *::-webkit-scrollbar-track {
                        background: rgba(100,100,100,.5);
                    }
                    *::-webkit-scrollbar-thumb {
                        background: rgba(155,155,155,.5);
                        border-radius: 2px;
                    }

                    html,
                    body {
                      height: 100%;
                      width: 100%;
                      margin: 0;
                      padding: 0;
                      overflow: hidden;
                      overscroll-behavior: none;
                      -webkit-overflow-scrolling: auto;
                      scrollbar-width: thin;
                    }
                `}</style>
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
