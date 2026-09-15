import { useEffect, useState } from "react";

export type BrowserColorScheme = "light" | "dark" | null;

function getBrowserColorScheme(): BrowserColorScheme {
  if (typeof window === "undefined" || !window.matchMedia) return null;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function useBrowserColorScheme(): BrowserColorScheme {
  const [colorScheme, setColorScheme] = useState<BrowserColorScheme>(
    getBrowserColorScheme,
  );

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setColorScheme(getBrowserColorScheme());

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return colorScheme;
}
