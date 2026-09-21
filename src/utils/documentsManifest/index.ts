import { getResumePdfUrl } from "@utils/resumePdfUrl";
import { slugifyName } from "@utils/slugifyName";
import { getVersionedLocalAssetUrl } from "@utils/versionedAssetUrl";

export type DocumentKind =
  | "applicationPackageDe"
  | "applicationPackageEn"
  | "cvDe"
  | "cvEn"
  | "cvAtsDe"
  | "cvAtsEn"
  | "portfolioDe"
  | "portfolioEn"
  | "portfolioAtsDe"
  | "portfolioAtsEn";

export type DocumentEntry = {
  kind: DocumentKind;
  url: string;
};

// Matches the file names scripts/generate-cv-pdf.cjs /
// generate-application-package.cjs write under public/files/<DE|EN>/. Each
// file's own name carries the natural word for its language rather than a
// _DE/_EN suffix (e.g. "Lebenslauf" vs "CV"), so a DE/EN subfolder is what
// actually tells the two languages' files apart -- for "Portfolio" in
// particular, which is spelled identically in both languages, the folder is
// the *only* thing that does. The names themselves stay plain and
// deterministic on purpose either way -- the actual access control is
// nginx's HTTP Basic Auth on /files/ (scripts/init-process.cjs), not an
// unguessable name, so there's nothing to gain from hiding the file name
// itself.
//
// There are two ZIPs, not one: each bundles only that language's CV and
// Portfolio-ATS PDF (plus the language-agnostic certificates), so a
// recruiter who asked for the English documents doesn't have to sift a
// shared archive to find them.
//
// cvAtsDe/En is a plain, single-column-with-no-color companion to cvDe/En
// (see generate-cv-pdf.cjs's `ats` option) -- unlike the Portfolio-ATS
// entries below, it still lives under /files/, not public/ root, since it
// carries the same CV-only personal fields (birth date, marital status,
// ...) that must never be reachable without auth_basic.
//
// The two Portfolio (designed) and Portfolio-ATS entries are a deliberate
// exception: those files live in public/<DE|EN>/, not /files/<DE|EN>/ --
// they're the exact same, already-public download the contact footer /
// drawer menu link to (src/utils/resumePdfUrl), just also listed here for
// convenience. Listing them on this page does not add any protection;
// whoever unlocks this page simply gets a shortcut to a file anyone could
// already fetch directly. getVersionedLocalAssetUrl applies the same
// cache-busting query param getResumePdfUrl uses, since (unlike /files/,
// which is Cache-Control: no-store) these are cached as immutable for a
// year by file extension.
//
// Grouped by language, German first, so the first entry is always a real
// /files/ URL protected by auth_basic (see handleUnlock in
// WnaDownloadsRoute, which verifies the entered password against
// documents[0]).
export function getDocumentsManifest(name: string): DocumentEntry[] {
  const slug = slugifyName(name);

  return [
    {
      kind: "applicationPackageDe",
      url: `/files/DE/${slug}_-_Bewerbungsunterlagen.zip`,
    },
    { kind: "cvDe", url: `/files/DE/${slug}_-_Lebenslauf.pdf` },
    { kind: "cvAtsDe", url: `/files/DE/${slug}_-_Lebenslauf_ATS.pdf` },
    { kind: "portfolioDe", url: getResumePdfUrl("de", name) },
    {
      kind: "portfolioAtsDe",
      url: getVersionedLocalAssetUrl(`/DE/${slug}_-_Portfolio_ATS.pdf`),
    },
    {
      kind: "applicationPackageEn",
      url: `/files/EN/${slug}_-_ApplicationDocuments.zip`,
    },
    { kind: "cvEn", url: `/files/EN/${slug}_-_CV.pdf` },
    { kind: "cvAtsEn", url: `/files/EN/${slug}_-_CV_ATS.pdf` },
    { kind: "portfolioEn", url: getResumePdfUrl("en", name) },
    {
      kind: "portfolioAtsEn",
      url: getVersionedLocalAssetUrl(`/EN/${slug}_-_Portfolio_ATS.pdf`),
    },
  ];
}
