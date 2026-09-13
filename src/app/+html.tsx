import { ScrollViewStyleReset } from "expo-router/html";
import { PropsWithChildren, useEffect } from "react";
import { getVersionedLocalAssetUrl } from "@utils/versionedAssetUrl";

const appDescription =
  "Persönliche Website mit Projekten, Erfahrungen und Kontaktmöglichkeiten.";
const backgroundImageUrl = getVersionedLocalAssetUrl("/bg.webp");

export default function Root({ children }: PropsWithChildren) {
  useEffect(() => {
    // remove the injected font node to avoid duplicate web fonts
    const el = document.getElementById("expo-generated-fonts");
    if (el) el.remove();
  }, []);

  return (
    <html lang="de">
      <head>
        <title>AboutMe</title>
        <meta charSet="utf-8" />
        <meta name="description" content={appDescription} />
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
        <link
          rel="preload"
          as="image"
          href={backgroundImageUrl}
          fetchPriority="high"
        />

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

                    @keyframes wna-accent-bar-pulse {
                      from { transform: scaleX(1); }
                      to { transform: scaleX(var(--wna-accent-bar-pulse-scale)); }
                    }

                    @keyframes wna-hero-shape-swing {
                      from {
                        opacity: var(--wna-hero-shape-start-opacity);
                        transform:
                          translateX(var(--wna-hero-shape-start-x))
                          translateY(var(--wna-hero-shape-start-y))
                          rotate(var(--wna-hero-shape-start-rotate))
                          scale(var(--wna-hero-shape-start-scale));
                      }
                      to {
                        opacity: var(--wna-hero-shape-end-opacity);
                        transform:
                          translateX(var(--wna-hero-shape-end-x))
                          translateY(var(--wna-hero-shape-end-y))
                          rotate(var(--wna-hero-shape-end-rotate))
                          scale(var(--wna-hero-shape-end-scale));
                      }
                    }

                    [id^="wna-hero-shape-"] {
                      animation: wna-hero-shape-swing var(--wna-hero-shape-duration) ease-in-out infinite alternate;
                    }

                    [id^="wna-experience-details-"] {
                      overflow: hidden;
                      transition: height 220ms ease-in-out;
                    }

                    #wna-header-actions {
                      transition: opacity 180ms cubic-bezier(.5, .01, 0, 1);
                    }

                    #wna-busy-overlay {
                      transition: opacity 250ms cubic-bezier(.5, .01, 0, 1);
                    }

                    @media (prefers-reduced-motion: reduce) {
                      [id^="wna-hero-shape-"] {
                        animation: none;
                      }
                    }

                    /* firefox and brave */
                    * {
                        scrollbar-width: thin;
                        scrollbar-color: rgba(155,155,155,.5) rgba(100,100,100,.5);
                    }
                    
                    /* chromium except brave */
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
