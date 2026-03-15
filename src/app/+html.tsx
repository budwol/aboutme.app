import { buildRootHtmlMetadata } from "@app/rootHtmlMetadata";
import { ScrollViewStyleReset } from "expo-router/html";
import { PropsWithChildren, useEffect } from "react";

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
// https://docs.expo.dev/guides/progressive-web-apps/
export default function Root({ children }: PropsWithChildren) {
  const { baseUrl, lang, ogImageUrl, schemaOrg } = buildRootHtmlMetadata();

  useEffect(() => {
    // remove expo-generated-fonts element
    const el = document.getElementById("expo-generated-fonts");
    if (el) el.remove();
  }, []);

  return (
    <html lang={lang}>
      <head>
        {/* Core */}
        <meta charSet="utf-8" />
        <meta name="robots" content="index,follow" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        {process.env.EXPO_PUBLIC_GOOGLE_SITE_VERIFICATION ? (
          <meta
            name="google-site-verification"
            content={process.env.EXPO_PUBLIC_GOOGLE_SITE_VERIFICATION}
          />
        ) : null}
        {/* Performance Hints */}
        <link rel="preconnect" href={baseUrl} />
        <link rel="dns-prefetch" href={baseUrl} />
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

        {/*open graph*/}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Portfolio" />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:secure_url" content={ogImageUrl} />
        <meta property="og:image:width" content="300" />
        <meta property="og:image:height" content="366" />
        <meta property="og:image:alt" content="Portfolio" />
        <meta property="og:image:type" content="image/png" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaOrg),
          }}
        />
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
