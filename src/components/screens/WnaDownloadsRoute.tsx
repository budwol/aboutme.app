import Logger from "wna-logger";
import WnaSurfaceCard from "@/components/cards/WnaSurfaceCard";
import { useWnaAppData, useWnaTheme } from "@/state/WnaAppContext";
import WnaMenuToggleButton from "@/navigation/components/WnaMenuToggleButton";
import WnaHeaderRouteButton from "@/navigation/components/WnaHeaderRouteButton";
import WnaNavigationItem from "@/navigation/components/WnaNavigationItem";
import WnaSeparatorHorizontal from "@components/display/WnaSeparatorHorizontal";
import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import WnaDocumentsUnlockGate from "@components/documents/WnaDocumentsUnlockGate";
import { useDocumentsAuth } from "@/hooks/useDocumentsAuth";
import {
  DocumentEntry,
  DocumentKind,
  getDocumentsManifest,
} from "@utils/documentsManifest";
import {
  DOCUMENT_ICON_NAMES,
  DOCUMENT_LABEL_KEYS,
  getDocumentIconColors,
  getDocumentLang,
} from "@utils/documentDisplay";
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
import Colors from "@constants/theme/colors";
import AppStyle from "@/theme/appStyle";
import { i18nKeys } from "@/i18n/i18nKeys";
import {
  getDownloadDetailNavigationPath,
  getNavigationLang,
} from "@/navigation/routes/wnaNavigationRoutes";
import { router } from "@/navigation/router/wnaRouter";
import { TFunction } from "i18next";
import React, {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import WnaScrollViewScreen from "@components/screens/WnaScrollViewScreen";

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
  // Set for the four CV/Portfolio PDFs, which each have their own detail
  // page (WnaDownloadDetailRoute) -- the row opens that page instead of
  // downloading the file directly. The ZIPs and reference scans have no
  // detail page and still download in place.
  detailPath?: string;
};

// A single document row, shared by every section on this page -- the whole
// row is one semi-transparent WnaNavigationItem-style button (like the
// menu's navigation buttons) rather than a label next to its own solid
// download button, with the file-type icon on the left and a download icon
// on the right standing in for the usual chevron -- unless the row opens a
// detail page, which keeps the chevron.
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
      iconRightName={row.detailPath ? undefined : "download"}
      type={type}
      onPress={() =>
        row.detailPath
          ? router.navigate(row.detailPath)
          : handleDownload(row.url)
      }
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
        t(DOCUMENT_LABEL_KEYS[entry.kind], {
          lng: getDocumentLang(entry.kind),
        }),
        lookupDocumentSize(documentSizes, entry.url),
      ),
      iconName: DOCUMENT_ICON_NAMES[entry.kind],
      iconColor: documentIconColors[entry.kind],
      url: entry.url,
      detailPath: getDownloadDetailNavigationPath(entry.kind),
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

  const {
    authHeader,
    isUnlocked,
    password,
    setPassword,
    error,
    setError,
    isVerifying,
    unlock,
    authorizedFetch,
  } = useDocumentsAuth(t);
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

  // Neither the exact set of reference/certificate scans nor the fixed CV/
  // Portfolio/ZIP set's file sizes are known ahead of time the way the
  // fixed set's file *names* are (see src/utils/documentsManifest) -- both
  // are fetched here instead, any time a valid session becomes available: a
  // fresh unlock or a page load that found one already stored.
  useEffect(() => {
    if (!authHeader) {
      setReferenceDocuments([]);
      setDocumentSizes({});
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        // markActivity: false -- this fetch happens automatically whenever
        // a session becomes available, not because the visitor did
        // anything, so it must not reset the 15-minute inactivity window.
        const [referencesResponse, sizesResponse] = await Promise.all([
          authorizedFetch(REFERENCE_DOCUMENTS_MANIFEST_URL, {
            markActivity: false,
          }),
          authorizedFetch(DOCUMENT_SIZES_MANIFEST_URL, {
            markActivity: false,
          }),
        ]);

        if (cancelled) {
          return;
        }

        if (referencesResponse?.ok) {
          const raw: unknown = await referencesResponse.json();
          if (!cancelled) {
            setReferenceDocuments(parseReferenceDocumentsManifest(raw));
          }
        }

        if (sizesResponse?.ok) {
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
    // authorizedFetch is deliberately omitted: it's a useCallback whose own
    // deps include `t` (see useDocumentsAuth), and the mocked
    // useTranslation() in tests (and conceivably a real i18next re-render)
    // can hand back a new `t` function reference every render -- which
    // would otherwise refire this fetch, and therefore its setState calls,
    // on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeader]);

  // Only ever wired up to a download row below, which itself only renders
  // once authHeader is set -- so authorizedFetch is always usable by the
  // time this runs. Takes a plain url rather than a DocumentEntry/
  // ReferenceDocumentEntry so it works the same for both the fixed document
  // set and the dynamic reference/certificate rows.
  const handleDownload = useCallback(
    async (url: string) => {
      try {
        const response = await authorizedFetch(url);
        if (!response) {
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
    [authorizedFetch, setError, t],
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
          isUnlocked
            ? null
            : [
                <WnaSeparatorHorizontal
                  transparent={true}
                  space={4}
                  key="separator"
                />,
                <WnaDocumentsUnlockGate
                  key="unlock"
                  appColors={appColors}
                  appStyle={appStyle}
                  t={t}
                  password={password}
                  setPassword={setPassword}
                  error={error}
                  isVerifying={isVerifying}
                  onUnlock={() => void unlock(documents[0].url)}
                />,
              ],
        )}
      </WnaSurfaceCard>
      {isUnlocked
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
