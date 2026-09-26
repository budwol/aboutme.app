import Logger from "wna-logger";
import WnaSurfaceCard from "@/components/cards/WnaSurfaceCard";
import { useWnaAppData, useWnaTheme } from "@/state/WnaAppContext";
import WnaMenuToggleButton from "@/navigation/components/WnaMenuToggleButton";
import WnaHeaderRouteButton from "@/navigation/components/WnaHeaderRouteButton";
import WnaButtonIconText from "@components/buttons/WnaButtonIconText";
import WnaDocumentsUnlockGate from "@components/documents/WnaDocumentsUnlockGate";
import { useDocumentsAuth } from "@/hooks/useDocumentsAuth";
import { DocumentKind, getDocumentsManifest } from "@utils/documentsManifest";
import { DOCUMENT_LABEL_KEYS } from "@utils/documentDisplay";
import { appLayoutConstants } from "@constants/layoutConstants";
import { i18nKeys } from "@/i18n/i18nKeys";
import {
  getNavigationPath,
  WnaRouteLang,
} from "@/navigation/routes/wnaNavigationRoutes";
import { router } from "@/navigation/router/wnaRouter";
import React, {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import WnaScrollViewScreen from "@components/screens/WnaScrollViewScreen";

export type WnaDownloadDetailRouteProps = {
  kind: DocumentKind;
};

// A protected document lives under /files/ (see src/utils/documentsManifest,
// nginx/site.conf's auth_basic block) -- the Portfolio pair does not: it's
// public (the contact section's and drawer menu's portfolio buttons open
// this page for it), so this page skips the password gate entirely for
// those two kinds.
function isProtectedDocumentUrl(url: string): boolean {
  return url.startsWith("/files/");
}

// String.prototype.split always returns a non-empty array, so pop() here
// can never actually be undefined for a real document URL.
function getFileNameFromUrl(url: string): string {
  return url.split("/").pop() as string;
}

// For a public document: no fetch needed, the `download` attribute makes
// the browser save a same-origin URL natively instead of navigating to it.
function triggerUrlDownload(url: string, fileName: string): void {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

// For a protected document: the preview fetch already pulled the bytes
// down (via an authenticated fetch), so download re-uses that same blob
// rather than fetching it a second time.
function triggerBlobDownload(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

const styles = {
  cardContent: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: 16,
  },
  actions: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
  },
} satisfies Record<string, CSSProperties>;

export default function WnaDownloadDetailRoute({
  kind,
}: WnaDownloadDetailRouteProps): ReactNode {
  const { appColors, appStyle } = useWnaTheme();
  const { appData } = useWnaAppData();
  const { t } = useTranslation(["common"]);
  const auth = useDocumentsAuth(t);

  // matchRoute only ever produces a `kind` that exists in this manifest --
  // see downloadsIntentWords in wnaNavigationRoutes.ts -- so this is always
  // found, unlike WnaProjectDetailsRoute's slug lookup which has to handle
  // "not found" for a value it can't validate ahead of time.
  const entry = getDocumentsManifest(appData.profile.name).find(
    (document) => document.kind === kind,
  )!;
  const lang: WnaRouteLang = kind.endsWith("De") ? "de" : "en";
  const label = t(DOCUMENT_LABEL_KEYS[kind]);
  const fileName = getFileNameFromUrl(entry.url);
  const isProtected = isProtectedDocumentUrl(entry.url);

  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Fetches the PDF once unlocked (protected kinds only -- a public kind's
  // iframe below points straight at entry.url, no fetch needed). Re-runs if
  // the visitor navigates in-app from one detail page to another, since
  // WnaRoutes reuses the same lazy component instance across different
  // `kind` props rather than remounting it.
  useEffect(() => {
    if (!isProtected || !auth.isUnlocked) {
      return;
    }

    let cancelled = false;
    setIsLoadingPreview(true);

    void (async () => {
      try {
        const response = await auth.authorizedFetch(entry.url);
        if (!response) {
          return;
        }

        if (!response.ok) {
          if (!cancelled) {
            auth.setError(t(i18nKeys.errorUnknown));
          }
          return;
        }

        const blob = await response.blob();
        if (!cancelled) {
          setPreviewBlob(blob);
          setPreviewObjectUrl(URL.createObjectURL(blob));
        }
      } catch (requestError) {
        if (!cancelled) {
          Logger.error(WnaDownloadDetailRoute.name, requestError);
          auth.setError(t(i18nKeys.errorUnknown));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPreview(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // auth.authorizedFetch and t are deliberately omitted -- see the
    // identical comment in WnaDownloadsRoute.tsx: authorizedFetch is a
    // useCallback whose own deps include `t`, and the mocked
    // useTranslation() in tests (and conceivably a real i18next re-render)
    // can hand back a new `t` function reference every render, which would
    // otherwise refire this fetch on every render. auth.setError is a
    // useState setter and is always stable, but is left out of the deps
    // list too since it's read from the same `auth` object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isUnlocked, entry.url, isProtected]);

  useEffect(() => {
    return () => {
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
      }
    };
  }, [previewObjectUrl]);

  const handleDownload = useCallback(() => {
    if (isProtected) {
      if (previewBlob) {
        triggerBlobDownload(previewBlob, fileName);
      }
      return;
    }

    triggerUrlDownload(entry.url, fileName);
  }, [entry.url, fileName, isProtected, previewBlob]);

  const headerProps = {
    headerTitle: label,
    titleHref: getNavigationPath("downloads", lang),
    showContactFooter: false,
    headerButton0: (
      <WnaHeaderRouteButton
        appStyle={appStyle}
        appColors={appColors}
        router={router}
        route="home"
        t={t}
      />
    ),
    headerButton1: (
      <WnaMenuToggleButton appStyle={appStyle} appColors={appColors} t={t} />
    ),
  };

  if (isProtected && !auth.isUnlocked) {
    return (
      <WnaScrollViewScreen {...headerProps}>
        <WnaSurfaceCard appColors={appColors}>
          {React.createElement(
            "div",
            { style: styles.cardContent },
            <WnaDocumentsUnlockGate
              appColors={appColors}
              appStyle={appStyle}
              t={t}
              bodyText={t(i18nKeys.downloadsUnlockBodyDocument)}
              password={auth.password}
              setPassword={auth.setPassword}
              error={auth.error}
              isVerifying={auth.isVerifying}
              onUnlock={() => void auth.unlock(entry.url)}
            />,
          )}
        </WnaSurfaceCard>
      </WnaScrollViewScreen>
    );
  }

  const previewSrc = isProtected ? previewObjectUrl : entry.url;

  return (
    <WnaScrollViewScreen {...headerProps}>
      <WnaSurfaceCard appColors={appColors}>
        {React.createElement(
          "div",
          { style: styles.cardContent },
          React.createElement(
            "div",
            { style: styles.actions },
            <WnaButtonIconText
              appColors={appColors}
              appStyle={appStyle}
              text={t(i18nKeys.actionDownload)}
              iconName="download"
              onPress={handleDownload}
              disabled={isProtected && !previewBlob}
              t={t}
            />,
          ),
          previewSrc
            ? React.createElement("iframe", {
                key: "preview",
                src: previewSrc,
                title: label,
                style: {
                  width: "100%",
                  height: "75vh",
                  minHeight: 480,
                  border: "none",
                  borderRadius: appLayoutConstants.globalCornerRadius,
                  backgroundColor: appColors.coolgray1,
                } as CSSProperties,
              })
            : React.createElement(
                "span",
                { style: appStyle.textNeutralMedium },
                isLoadingPreview
                  ? t(i18nKeys.infoLoadingPreview)
                  : t(i18nKeys.errorUnknown),
              ),
          auth.error
            ? React.createElement(
                "span",
                {
                  style: {
                    ...appStyle.textNeutralMedium,
                    color: appColors.red4,
                  },
                },
                auth.error,
              )
            : null,
        )}
      </WnaSurfaceCard>
    </WnaScrollViewScreen>
  );
}
