import Logger from "wna-logger";
import WnaSurfaceCard from "@/components/cards/WnaSurfaceCard";
import { useWnaAppData, useWnaTheme } from "@/state/WnaAppContext";
import WnaMenuToggleButton from "@/navigation/components/WnaMenuToggleButton";
import WnaHeaderRouteButton from "@/navigation/components/WnaHeaderRouteButton";
import WnaNavigationItem from "@/navigation/components/WnaNavigationItem";
import WnaSeparatorHorizontal from "@components/display/WnaSeparatorHorizontal";
import WnaButtonIconText from "@components/buttons/WnaButtonIconText";
import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import {
  DocumentEntry,
  DocumentKind,
  getDocumentsManifest,
} from "@utils/documentsManifest";
import {
  groupReferenceDocumentsByCategory,
  parseReferenceDocumentsManifest,
  ReferenceDocumentCategory,
  ReferenceDocumentEntry,
} from "@utils/referenceDocumentsManifest";
import {
  DocumentSizeManifest,
  lookupDocumentSize,
  parseDocumentSizeManifest,
} from "@utils/documentSizeManifest";
import { formatFileSize } from "@utils/formatFileSize";
import { appLayoutConstants } from "@constants/layoutConstants";
import Colors from "@constants/theme/colors";
import AppStyle from "@/theme/appStyle";
import { i18nKeys } from "@/i18n/i18nKeys";
import { getNavigationLang } from "@/navigation/routes/wnaNavigationRoutes";
import { router } from "@/navigation/router/wnaRouter";
import { TFunction } from "i18next";
import React, {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import WnaScrollViewScreen from "@components/screens/WnaScrollViewScreen";

// Fixed, non-secret -- with HTTP Basic Auth the secrecy lives entirely in
// the password, not the username. Mirrors DOCUMENTS_AUTH_USERNAME in
// scripts/init-process.cjs, which is what actually builds nginx's
// .htpasswd entry against this same name.
const DOCUMENTS_AUTH_USERNAME = "documents";

// Remembers a successful unlock only for this browser tab's session (not
// localStorage): re-opening the page in a new tab, or after the browser
// closes, asks again.
const SESSION_STORAGE_KEY = "wna-documents-auth";

// Re-locks the page after 15 minutes without a download, even within the
// same tab session -- a stopgap against a browser left open and unattended
// on a shared/public machine. This is purely a client-side convenience, not
// a security boundary: the server-side gate is still nginx's auth_basic,
// which has no concept of a session and stays valid until the password
// itself is rotated.
const AUTH_INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
const LAST_ACTIVE_STORAGE_KEY = "wna-documents-auth-last-active";

// Written unconditionally by generate-application-package.cjs (even when
// .aboutme/secrets/ is entirely empty), so a 404 here would mean something
// is actually wrong rather than "nothing uploaded yet" -- see
// src/utils/referenceDocumentsManifest.
const REFERENCE_DOCUMENTS_MANIFEST_URL = "/files/references-manifest.json";

// Covers the fixed CV/Portfolio/ZIP document set (see
// src/utils/documentSizeManifest); also written unconditionally.
const DOCUMENT_SIZES_MANIFEST_URL = "/files/document-sizes.json";

const REFERENCE_CATEGORY_LABEL_KEYS: Record<ReferenceDocumentCategory, string> =
  {
    employmentReferences: i18nKeys.documentsCategoryEmploymentReferences,
    certificates: i18nKeys.documentsCategoryCertificates,
    diplomas: i18nKeys.documentsCategoryDiplomas,
  };

const DOCUMENT_LABEL_KEYS: Record<DocumentKind, string> = {
  cvDe: i18nKeys.documentCvDe,
  cvEn: i18nKeys.documentCvEn,
  cvAtsDe: i18nKeys.documentCvAtsDe,
  cvAtsEn: i18nKeys.documentCvAtsEn,
  applicationPackageDe: i18nKeys.documentApplicationPackageDe,
  applicationPackageEn: i18nKeys.documentApplicationPackageEn,
  portfolioDe: i18nKeys.documentPortfolioDe,
  portfolioEn: i18nKeys.documentPortfolioEn,
  portfolioAtsDe: i18nKeys.documentPortfolioAtsDe,
  portfolioAtsEn: i18nKeys.documentPortfolioAtsEn,
};

// The manifest only ever contains these two file types (PDF documents, one
// ZIP per language), so the icon is keyed off document kind rather than
// parsing the URL.
const DOCUMENT_ICON_NAMES: Record<DocumentKind, "file-pdf-box" | "folder-zip"> =
  {
    cvDe: "file-pdf-box",
    cvEn: "file-pdf-box",
    cvAtsDe: "file-pdf-box",
    cvAtsEn: "file-pdf-box",
    applicationPackageDe: "folder-zip",
    applicationPackageEn: "folder-zip",
    portfolioDe: "file-pdf-box",
    portfolioEn: "file-pdf-box",
    portfolioAtsDe: "file-pdf-box",
    portfolioAtsEn: "file-pdf-box",
  };

// Conventional file-type colors (red PDF, yellow archive), pulled from the
// theme's own red/yellow scale (same static values in light and dark mode)
// rather than a hardcoded hex, so the two file types are distinguishable at
// a glance without introducing an off-palette color. The "4" step is the
// most saturated in each scale -- "2"/"3" are pastel enough to wash out as
// a small icon fill.
function getDocumentIconColors(colors: Colors): Record<DocumentKind, string> {
  return {
    cvDe: colors.red4,
    cvEn: colors.red4,
    cvAtsDe: colors.red4,
    cvAtsEn: colors.red4,
    applicationPackageDe: colors.yellow4,
    applicationPackageEn: colors.yellow4,
    portfolioDe: colors.red4,
    portfolioEn: colors.red4,
    portfolioAtsDe: colors.red4,
    portfolioAtsEn: colors.red4,
  };
}

// Each language's ZIP, CV (designed + ats text version) and Portfolio
// (designed + ats text version) render together under one flag-marked card
// -- the ZIP itself only bundles that language's documents (see
// generate-application-package.cjs), so it belongs in this group too rather
// than standing alone above both.
const LANGUAGE_SECTIONS: {
  flag: string;
  labelKey: string;
  kinds: DocumentKind[];
}[] = [
  {
    flag: "🇩🇪",
    labelKey: i18nKeys.languageGerman,
    kinds: [
      "applicationPackageDe",
      "cvDe",
      "cvAtsDe",
      "portfolioDe",
      "portfolioAtsDe",
    ],
  },
  {
    flag: "🇬🇧",
    labelKey: i18nKeys.languageEnglish,
    kinds: [
      "applicationPackageEn",
      "cvEn",
      "cvAtsEn",
      "portfolioEn",
      "portfolioAtsEn",
    ],
  },
];

function buildAuthHeader(username: string, password: string): string {
  return `Basic ${btoa(`${username}:${password}`)}`;
}

function readStoredAuthHeader(): string | null {
  try {
    return window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeAuthHeader(authHeader: string): void {
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, authHeader);
  } catch {
    // sessionStorage can be unavailable (private browsing, disabled site
    // data) -- the unlocked state still works for the rest of this page
    // load, it just won't survive a reload.
  }
}

function clearStoredAuthHeader(): void {
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // see storeAuthHeader
  }
}

function readStoredLastActiveAt(): number | null {
  try {
    const raw = window.sessionStorage.getItem(LAST_ACTIVE_STORAGE_KEY);
    const parsed = raw === null ? NaN : Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function storeLastActiveAt(timestamp: number): void {
  try {
    window.sessionStorage.setItem(LAST_ACTIVE_STORAGE_KEY, String(timestamp));
  } catch {
    // see storeAuthHeader
  }
}

function clearLastActiveAt(): void {
  try {
    window.sessionStorage.removeItem(LAST_ACTIVE_STORAGE_KEY);
  } catch {
    // see storeAuthHeader
  }
}

// Downloads via fetch()+Blob rather than a plain <a href> so the request
// carries an explicit Authorization header instead of relying on the
// browser's own native Basic Auth prompt/credential cache -- this page
// gets its own password overlay instead of that native dialog.
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

// String.prototype.split always returns a non-empty array, so pop() here
// can never actually be undefined for a real /files/<name> URL.
function getFileNameFromUrl(url: string): string {
  return url.split("/").pop() as string;
}

// WnaButtonIconText's own fixed height (actionButtonRightConstants.size) --
// the password input matches it explicitly so the two controls line up
// flush in one row instead of the input's browser-default height.
const UNLOCK_CONTROL_HEIGHT = 52;

const styles = {
  cardContent: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: 16,
  },
  sectionToggle: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    boxSizing: "border-box",
    gap: 8,
    appearance: "none",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    textAlign: "left",
  },
  languageSectionHeading: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  languageFlag: {
    fontSize: 20,
    lineHeight: 1,
  },
  unlockRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  passwordFieldWrapper: {
    position: "relative",
    flex: 1,
    minWidth: 0,
  },
  passwordVisibilityToggle: {
    position: "absolute",
    top: 0,
    right: 0,
    height: "100%",
    width: 44,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
  },
} satisfies Record<string, CSSProperties>;

// The common shape both a fixed CV/Portfolio/ZIP entry (DocumentEntry) and a
// dynamic reference/certificate scan (ReferenceDocumentEntry) reduce to for
// rendering -- see buildLanguageSectionRows/buildReferenceSectionRows below.
type DisplayDocumentRow = {
  rowKey: string;
  label: string;
  iconName: "file-pdf-box" | "folder-zip";
  iconColor: string;
  url: string;
};

// A single document row, shared by every section on this page -- the whole
// row is one semi-transparent WnaNavigationItem-style button (like the
// menu's navigation buttons) rather than a label next to its own solid
// download button, with the file-type icon on the left and a download icon
// on the right standing in for the usual chevron.
function renderDocumentRow(
  row: DisplayDocumentRow,
  rowIndex: number,
  rowCount: number,
  appColors: Colors,
  appStyle: AppStyle,
  t: TFunction<string[], undefined>,
  handleDownload: (url: string) => void,
): ReactNode {
  const type =
    rowCount === 1
      ? "standalone"
      : rowIndex === 0
        ? "first"
        : rowIndex === rowCount - 1
          ? "last"
          : "middle";

  return (
    <WnaNavigationItem
      key={row.rowKey}
      appColors={appColors}
      appStyle={appStyle}
      text={row.label}
      iconName={row.iconName}
      iconColor={row.iconColor}
      iconRightName="download"
      type={type}
      onPress={() => handleDownload(row.url)}
      t={t}
    />
  );
}

// One card holding a heading (a flag+language, or a plain category label)
// and its rows -- shared by every language and reference-category section.
function renderDocumentGroupSection(
  key: string,
  heading: ReactNode,
  rows: DisplayDocumentRow[],
  appColors: Colors,
  appStyle: AppStyle,
  t: TFunction<string[], undefined>,
  handleDownload: (url: string) => void,
  isExpanded: boolean,
  onToggle: () => void,
): ReactNode {
  return (
    <WnaSurfaceCard appColors={appColors} key={key}>
      {React.createElement(
        "div",
        { style: styles.cardContent },
        React.createElement(
          "button",
          {
            type: "button",
            style: styles.sectionToggle,
            "aria-expanded": isExpanded,
            onClick: onToggle,
          },
          heading,
          <WnaIcon
            iconName="chevron-up"
            size={20}
            color={appColors.coolgray5}
            style={{
              flexShrink: 0,
              transform: isExpanded ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 150ms ease",
            }}
          />,
        ),
        isExpanded
          ? rows.map((row, index) =>
              renderDocumentRow(
                row,
                index,
                rows.length,
                appColors,
                appStyle,
                t,
                handleDownload,
              ),
            )
          : null,
      )}
    </WnaSurfaceCard>
  );
}

// That language's ZIP, CV and Portfolio-ATS rows (see LANGUAGE_SECTIONS).
// "Lebenslauf" -> "Lebenslauf (245 KB)". A missing/unresolved size (the
// document-sizes.json fetch hasn't landed yet, or the manifest is
// unreadable) leaves the plain label alone. sizeBytes, once defined, is
// always a finite, non-negative number -- both parseDocumentSizeManifest
// and parseReferenceDocumentsManifest already filter out anything else
// before it can reach here -- so formatFileSize never returns "" for it.
function appendSizeLabel(label: string, sizeBytes: number | undefined): string {
  if (sizeBytes === undefined) {
    return label;
  }
  return `${label} (${formatFileSize(sizeBytes)})`;
}

function buildLanguageSectionRows(
  section: (typeof LANGUAGE_SECTIONS)[number],
  documents: DocumentEntry[],
  documentIconColors: Record<DocumentKind, string>,
  documentSizes: DocumentSizeManifest,
  t: TFunction<string[], undefined>,
): DisplayDocumentRow[] {
  return documents
    .filter((entry) => section.kinds.includes(entry.kind))
    .map((entry) => ({
      rowKey: entry.kind,
      label: appendSizeLabel(
        t(DOCUMENT_LABEL_KEYS[entry.kind]),
        lookupDocumentSize(documentSizes, entry.url),
      ),
      iconName: DOCUMENT_ICON_NAMES[entry.kind],
      iconColor: documentIconColors[entry.kind],
      url: entry.url,
    }));
}

// One reference-document category's rows (Arbeitszeugnisse, Zertifikate or
// Zeugnisse) -- always a plain PDF scan, so icon/color are fixed rather than
// looked up per kind the way the fixed document set above needs to be. Its
// size is already inline on the entry itself (references-manifest.json),
// unlike the fixed set's separate document-sizes.json lookup.
function buildReferenceSectionRows(
  entries: ReferenceDocumentEntry[],
  appColors: Colors,
): DisplayDocumentRow[] {
  return entries.map((entry) => ({
    rowKey: entry.url,
    label: appendSizeLabel(entry.label, entry.size),
    iconName: "file-pdf-box",
    iconColor: appColors.red4,
    url: entry.url,
  }));
}

export default function WnaDownloadsRoute(): ReactNode {
  const { appColors, appStyle } = useWnaTheme();
  const { appData } = useWnaAppData();
  const { t } = useTranslation(["common"]);

  const [authHeader, setAuthHeader] = useState<string | null>(() =>
    readStoredAuthHeader(),
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [referenceDocuments, setReferenceDocuments] = useState<
    ReferenceDocumentEntry[]
  >([]);
  const [documentSizes, setDocumentSizes] = useState<DocumentSizeManifest>({});
  // Whichever language the visitor is already reading the site in -- used
  // both to decide which language card starts expanded (below) and, in the
  // render, to put that same card first and the other one last, with the
  // reference-document categories sandwiched between them.
  const currentLang = getNavigationLang();
  // German starts expanded when the site itself is currently in German,
  // English starts expanded otherwise. Every other card (each
  // reference-document category) starts collapsed; keyed by the same
  // labelKey/category strings used to build the sections below, so an
  // absent key (any reference category) defaults to collapsed via the
  // `?? false` at each read site.
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(() => ({
    [i18nKeys.languageGerman]: currentLang === "de",
    [i18nKeys.languageEnglish]: currentLang === "en",
  }));
  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !(prev[key] ?? false) }));
  }, []);

  const documents = getDocumentsManifest(appData.profile.name);
  const documentIconColors = getDocumentIconColors(appColors);

  const autoLockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelAutoLock = useCallback(() => {
    if (autoLockTimeoutRef.current !== null) {
      clearTimeout(autoLockTimeoutRef.current);
      autoLockTimeoutRef.current = null;
    }
  }, []);

  const scheduleAutoLock = useCallback(
    (remainingMs: number) => {
      cancelAutoLock();
      autoLockTimeoutRef.current = setTimeout(() => {
        clearStoredAuthHeader();
        clearLastActiveAt();
        setAuthHeader(null);
      }, remainingMs);
    },
    [cancelAutoLock],
  );

  // Called on unlock and on every download -- both count as "activity",
  // resetting the 15-minute inactivity window.
  const markActive = useCallback(() => {
    storeLastActiveAt(Date.now());
    scheduleAutoLock(AUTH_INACTIVITY_TIMEOUT_MS);
  }, [scheduleAutoLock]);

  // Re-derives the inactivity timer whenever authHeader changes: covers
  // both a fresh unlock (markActive already wrote a current timestamp) and
  // a page load that found an existing session in sessionStorage (where the
  // last recorded activity could already be stale, in which case this locks
  // immediately instead of trusting a session that outlived its window). A
  // *missing* timestamp -- sessionStorage unavailable entirely, or an
  // older session predating this feature -- is deliberately not treated as
  // "infinitely stale": that would auto-lock every unlock immediately
  // whenever storage can't be read, which is strictly worse than not having
  // this convenience feature at all. It's instead treated as activity
  // happening right now, same as a fresh unlock.
  useEffect(() => {
    if (!authHeader) {
      return;
    }

    const lastActiveAt = readStoredLastActiveAt();
    if (lastActiveAt === null) {
      markActive();
      return cancelAutoLock;
    }

    const elapsed = Date.now() - lastActiveAt;
    if (elapsed >= AUTH_INACTIVITY_TIMEOUT_MS) {
      clearStoredAuthHeader();
      clearLastActiveAt();
      setAuthHeader(null);
      return;
    }

    scheduleAutoLock(AUTH_INACTIVITY_TIMEOUT_MS - elapsed);
    return cancelAutoLock;
  }, [authHeader, cancelAutoLock, markActive, scheduleAutoLock]);

  // Neither the exact set of reference/certificate scans nor the fixed CV/
  // Portfolio/ZIP set's file sizes are known ahead of time the way the
  // fixed set's file *names* are (see src/utils/documentsManifest) -- both
  // are fetched here instead, any time a valid session becomes available: a
  // fresh unlock or a page load that found one already stored. Deliberately
  // does not call markActive(): this is an automatic background fetch, not
  // something the visitor did, so it shouldn't reset the inactivity window
  // on its own.
  useEffect(() => {
    if (!authHeader) {
      setReferenceDocuments([]);
      setDocumentSizes({});
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const [referencesResponse, sizesResponse] = await Promise.all([
          fetch(REFERENCE_DOCUMENTS_MANIFEST_URL, {
            headers: { Authorization: authHeader },
          }),
          fetch(DOCUMENT_SIZES_MANIFEST_URL, {
            headers: { Authorization: authHeader },
          }),
        ]);

        if (cancelled) {
          return;
        }

        if (referencesResponse.status === 401 || sizesResponse.status === 401) {
          cancelAutoLock();
          clearStoredAuthHeader();
          clearLastActiveAt();
          setAuthHeader(null);
          setError(t(i18nKeys.errorIncorrectPassword));
          return;
        }

        if (referencesResponse.ok) {
          const raw: unknown = await referencesResponse.json();
          if (!cancelled) {
            setReferenceDocuments(parseReferenceDocumentsManifest(raw));
          }
        }

        if (sizesResponse.ok) {
          const raw: unknown = await sizesResponse.json();
          if (!cancelled) {
            setDocumentSizes(parseDocumentSizeManifest(raw));
          }
        }
      } catch (requestError) {
        if (!cancelled) {
          Logger.error(WnaDownloadsRoute.name, requestError);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // t is deliberately omitted: the mocked useTranslation() in tests (and
    // conceivably a real i18next re-render) can hand back a new function
    // reference on every render without the translations themselves having
    // changed, which would otherwise refire this fetch on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeader, cancelAutoLock]);

  const handleUnlock = useCallback(async () => {
    setError(null);
    setIsVerifying(true);
    const candidateHeader = buildAuthHeader(DOCUMENTS_AUTH_USERNAME, password);

    try {
      // documents[0] must always be one of the /files/ entries (currently
      // the German ZIP): the two Portfolio-ATS entries live in public/ root
      // with no auth_basic at all, so verifying against one of those would
      // "succeed" for any password, including a wrong one.
      const response = await fetch(documents[0].url, {
        method: "HEAD",
        headers: { Authorization: candidateHeader },
      });

      if (!response.ok) {
        setError(t(i18nKeys.errorIncorrectPassword));
        return;
      }

      storeAuthHeader(candidateHeader);
      markActive();
      setAuthHeader(candidateHeader);
      setPassword("");
    } catch (requestError) {
      Logger.error(WnaDownloadsRoute.name, requestError);
      setError(t(i18nKeys.errorUnknown));
    } finally {
      setIsVerifying(false);
    }
  }, [documents, markActive, password, t]);

  // Only ever wired up to a download row below, which itself only renders
  // once authHeader is set -- so it's always defined by the time this runs.
  // Takes a plain url rather than a DocumentEntry/ReferenceDocumentEntry so
  // it works the same for both the fixed document set and the dynamic
  // reference/certificate rows.
  const handleDownload = useCallback(
    async (url: string) => {
      const currentAuthHeader = authHeader as string;
      markActive();

      try {
        const response = await fetch(url, {
          headers: { Authorization: currentAuthHeader },
        });

        if (response.status === 401) {
          cancelAutoLock();
          clearStoredAuthHeader();
          clearLastActiveAt();
          setAuthHeader(null);
          setError(t(i18nKeys.errorIncorrectPassword));
          return;
        }

        if (!response.ok) {
          setError(t(i18nKeys.errorUnknown));
          return;
        }

        const blob = await response.blob();
        triggerBlobDownload(blob, getFileNameFromUrl(url));
      } catch (requestError) {
        Logger.error(WnaDownloadsRoute.name, requestError);
        setError(t(i18nKeys.errorUnknown));
      }
    },
    [authHeader, cancelAutoLock, markActive, t],
  );

  // The current-language card first (expanded), the other language card
  // last (collapsed) -- LANGUAGE_SECTIONS is declared German-first, so
  // English-current visitors see the exact reverse order.
  const orderedLanguageSections =
    currentLang === "de"
      ? LANGUAGE_SECTIONS
      : [LANGUAGE_SECTIONS[1], LANGUAGE_SECTIONS[0]];

  const renderLanguageFragment = (
    section: (typeof LANGUAGE_SECTIONS)[number],
  ): ReactNode => (
    <React.Fragment key={section.labelKey}>
      <WnaSeparatorHorizontal space={12} transparent={true} />
      {renderDocumentGroupSection(
        section.labelKey,
        React.createElement(
          "div",
          { style: styles.languageSectionHeading },
          React.createElement(
            "span",
            { style: styles.languageFlag },
            section.flag,
          ),
          React.createElement(
            "span",
            { style: appStyle.textNeutralSubtitle },
            t(section.labelKey),
          ),
        ),
        buildLanguageSectionRows(
          section,
          documents,
          documentIconColors,
          documentSizes,
          t,
        ),
        appColors,
        appStyle,
        t,
        handleDownload,
        // Always defined: expandedSections' initializer seeds both
        // language keys up front (unlike each reference category's key
        // below, which is only ever added once that category actually
        // has entries to show).
        expandedSections[section.labelKey],
        () => toggleSection(section.labelKey),
      )}
    </React.Fragment>
  );

  const inputStyle: CSSProperties = {
    borderRadius: appLayoutConstants.globalCornerRadius,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: appColors.coolgray2,
    backgroundColor: appColors.background,
    color: appColors.text,
    // A plain DOM <input> isn't covered by the app's own theming -- without
    // this, the browser applies its native (often OS-dark-mode-driven)
    // color-scheme UA styling to the field's text/caret regardless of the
    // inline color/backgroundColor set above, which is exactly why the text
    // color could still look wrong against our custom background.
    colorScheme: appColors.isDark ? "dark" : "light",
    paddingInlineStart: 12,
    paddingInlineEnd: 44,
    fontSize: 15,
    height: UNLOCK_CONTROL_HEIGHT,
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <WnaScrollViewScreen
      headerTitle={t(i18nKeys.screenTitleDownloads)}
      showContactFooter={false}
      headerButton0={
        <WnaHeaderRouteButton
          appStyle={appStyle}
          appColors={appColors}
          router={router}
          route="home"
          t={t}
        />
      }
      headerButton1={
        <WnaMenuToggleButton appStyle={appStyle} appColors={appColors} t={t} />
      }
    >
      <WnaSurfaceCard appColors={appColors}>
        {React.createElement(
          "div",
          { style: styles.cardContent },
          React.createElement(
            "span",
            { style: appStyle.textNeutralMedium },
            t(i18nKeys.downloadsBody),
          ),
          authHeader
            ? null
            : [
                <WnaSeparatorHorizontal
                  transparent={true}
                  space={4}
                  key="separator"
                />,
                React.createElement(
                  "div",
                  { style: styles.cardContent, key: "unlock" },
                  React.createElement(
                    "div",
                    { style: styles.unlockRow },
                    React.createElement(
                      "div",
                      { style: styles.passwordFieldWrapper },
                      React.createElement("input", {
                        type: isPasswordVisible ? "text" : "password",
                        value: password,
                        placeholder: t(i18nKeys.labelPassword),
                        style: inputStyle,
                        disabled: isVerifying,
                        onChange: (
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => setPassword(event.target.value),
                        onKeyDown: (
                          event: React.KeyboardEvent<HTMLInputElement>,
                        ) => {
                          if (event.key === "Enter") {
                            void handleUnlock();
                          }
                        },
                      }),
                      React.createElement(
                        "button",
                        {
                          type: "button",
                          style: styles.passwordVisibilityToggle,
                          "aria-label": t(
                            isPasswordVisible
                              ? i18nKeys.actionHidePassword
                              : i18nKeys.actionShowPassword,
                          ),
                          onClick: () => setIsPasswordVisible((prev) => !prev),
                        },
                        <WnaIcon
                          iconName={isPasswordVisible ? "eye-off" : "eye"}
                          size={20}
                          color={appColors.coolgray5}
                        />,
                      ),
                    ),
                    <WnaButtonIconText
                      appColors={appColors}
                      appStyle={appStyle}
                      text={t(i18nKeys.actionUnlock)}
                      iconName="lock-open"
                      onPress={() => void handleUnlock()}
                      disabled={isVerifying || password === ""}
                      style={{ marginInline: 0, flexShrink: 0 }}
                      t={t}
                    />,
                  ),
                  error
                    ? React.createElement(
                        "span",
                        {
                          style: {
                            ...appStyle.textNeutralMedium,
                            color: appColors.red4,
                          },
                        },
                        error,
                      )
                    : null,
                ),
              ],
        )}
      </WnaSurfaceCard>
      {authHeader
        ? [
            // Current-language card first (expanded), reference-document
            // categories next (Zertifikate/Arbeitszeugnisse/Zeugnisse,
            // always collapsed), other-language card last (collapsed).
            renderLanguageFragment(orderedLanguageSections[0]),
            ...groupReferenceDocumentsByCategory(referenceDocuments).map(
              (group) => (
                <React.Fragment key={group.category}>
                  <WnaSeparatorHorizontal space={12} transparent={true} />
                  {renderDocumentGroupSection(
                    group.category,
                    React.createElement(
                      "span",
                      { style: appStyle.textNeutralSubtitle },
                      t(REFERENCE_CATEGORY_LABEL_KEYS[group.category]),
                    ),
                    buildReferenceSectionRows(group.entries, appColors),
                    appColors,
                    appStyle,
                    t,
                    handleDownload,
                    expandedSections[group.category] ?? false,
                    () => toggleSection(group.category),
                  )}
                </React.Fragment>
              ),
            ),
            renderLanguageFragment(orderedLanguageSections[1]),
          ]
        : null}
    </WnaScrollViewScreen>
  );
}
