import { getNavigationBaseUrl } from "@components/navigation/wnaNavigationRouteProvider";
import { SeoEntry } from "@constants/seoCatalog";
import { getLangCode } from "@services/i18n/i18n";
import { applySeoMetadata } from "@utils/seoDom";
import { Stack, useFocusEffect, usePathname } from "expo-router";
import { FC, ReactNode, useCallback, useRef } from "react";

export type WnaWebBaseScreenProps = {
  children?: ReactNode;
  seoEntry: SeoEntry;
};

const WnaWebBaseScreen: FC<WnaWebBaseScreenProps> = ({
  children,
  seoEntry,
}) => {
  const pathname = usePathname();
  const appliedCanonicalRef = useRef<string | null>(null);

  const refreshMetatags = useCallback(() => {
    const rawLang = getLangCode();
    const lang = rawLang === "de" ? "de" : "en";
    appliedCanonicalRef.current = applySeoMetadata({
      seoEntry,
      lang,
      baseUrl: getNavigationBaseUrl(),
    });
  }, [seoEntry]);

  useFocusEffect(
    useCallback(() => {
      const rawLang = getLangCode();
      const lang = rawLang === "de" ? "de" : "en";
      const canonical = seoEntry.canonical[lang]().toString();
      if (
        appliedCanonicalRef.current !== canonical ||
        !window.location.pathname.endsWith(pathname)
      ) {
        requestAnimationFrame(refreshMetatags);
      }

      return () => {
        appliedCanonicalRef.current = null;
      };
    }, [pathname, seoEntry, refreshMetatags]),
  );

  return !seoEntry ? null : (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {children}
    </>
  );
};

export default WnaWebBaseScreen;
