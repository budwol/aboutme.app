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

                    @keyframes wna-accent-bar-pulse-hero {
                      from { transform: scaleX(1); }
                      to { transform: scaleX(.2142857); }
                    }

                    .wna-accent-bar-pulse {
                      animation: wna-accent-bar-pulse var(--wna-accent-bar-duration) ease-in-out infinite alternate;
                      transform-origin: center;
                    }

                    .wna-accent-bar-pulse-hero {
                      animation: wna-accent-bar-pulse-hero 60s ease-in-out infinite alternate;
                      transform-origin: center;
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

                    @keyframes wna-hero-shape-swing-positive {
                      from { opacity: .5; transform: translate(-4px, 3px) rotate(-2.5deg) scale(.96); }
                      to { opacity: .82; transform: translate(4px, -3px) rotate(2.5deg) scale(1.04); }
                    }

                    .wna-hero-shape-swing-positive {
                      animation: wna-hero-shape-swing-positive 13s ease-in-out infinite alternate;
                    }

                    @keyframes wna-hero-shape-swing-negative {
                      from { opacity: .8; transform: translate(4px, -3px) rotate(12.5deg) scale(1.04); }
                      to { opacity: .52; transform: translate(-4px, 3px) rotate(7.5deg) scale(.96); }
                    }

                    .wna-hero-shape-swing-negative {
                      animation: wna-hero-shape-swing-negative 13s ease-in-out infinite alternate;
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

                    @keyframes wna-content-reveal {
                      from { opacity: .92; transform: translateY(10px); }
                      to { opacity: 1; transform: translateY(0); }
                    }

                    @keyframes wna-intro-exit {
                      from { opacity: 1; transform: translateY(0) scale(1); }
                      to { opacity: 0; transform: translateY(-18px) scale(1.03); }
                    }

                    @keyframes wna-navigation-transition-enter {
                      from { opacity: 0; }
                      to { opacity: 1; }
                    }

                    @keyframes wna-navigation-transition-exit {
                      from { opacity: 1; }
                      to { opacity: 0; }
                    }

                    #wna-content-reveal {
                      animation: wna-content-reveal 620ms cubic-bezier(.5, .01, 0, 1) 700ms both;
                    }

                    #wna-intro-overlay {
                      animation: wna-intro-exit 620ms cubic-bezier(.5, .01, 0, 1) 700ms both;
                    }

                    [id="navigation-transition-overlay-enter"] {
                      animation: wna-navigation-transition-enter 420ms cubic-bezier(.5, .01, 0, 1) both;
                    }

                    [id="navigation-transition-overlay-exit"] {
                      animation: wna-navigation-transition-exit 560ms cubic-bezier(.5, .01, 0, 1) both;
                    }

                    @media (prefers-reduced-motion: reduce) {
                      .wna-hero-shape-swing-positive,
                      .wna-hero-shape-swing-negative {
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
