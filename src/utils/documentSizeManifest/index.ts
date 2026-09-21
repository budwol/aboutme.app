// A flat {url: sizeInBytes} map for the fixed CV/Portfolio/ZIP document set
// (src/utils/documentsManifest) -- those file names are already known at
// build time, but their sizes aren't, without reading the actual generated
// files (which only scripts/generate-application-package.cjs does). It
// writes this file, unconditionally, to public/files/document-sizes.json.
export type DocumentSizeManifest = Record<string, number>;

// Defensive against a missing, malformed, or future-shaped manifest, same
// reasoning as parseReferenceDocumentsManifest: this is runtime data
// fetched over the network, not something a TypeScript type alone can
// guarantee well-formed. A non-finite/negative size for one key is dropped
// rather than discarding the whole map over a single bad entry.
export function parseDocumentSizeManifest(raw: unknown): DocumentSizeManifest {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return {};
  }

  const manifest: DocumentSizeManifest = {};
  for (const [url, size] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof size === "number" && Number.isFinite(size) && size >= 0) {
      manifest[url] = size;
    }
  }
  return manifest;
}

// The Portfolio/Portfolio-ATS URLs carry a cache-busting "?v=..." query
// string (getVersionedLocalAssetUrl) the manifest itself doesn't know
// about -- this strips it so a lookup against the manifest's plain-pathname
// keys still succeeds.
export function lookupDocumentSize(
  manifest: DocumentSizeManifest,
  url: string,
): number | undefined {
  return manifest[url.split("?")[0]];
}
