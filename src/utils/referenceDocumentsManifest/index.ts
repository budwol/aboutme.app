// The .aboutme/secrets/{Arbeitszeugnisse,Zertifikate,Zeugnisse}/ scans a
// candidate drops in are deployment-specific data -- unlike the fixed CV/
// Portfolio file set (src/utils/documentsManifest), the frontend can't know
// at build time which files exist, so it fetches this manifest at runtime
// instead. scripts/generate-application-package.cjs writes it, unconditionally
// (even when empty), to public/files/references-manifest.json.
export type ReferenceDocumentCategory =
  | "employmentReferences"
  | "certificates"
  | "diplomas";

export type ReferenceDocumentEntry = {
  category: ReferenceDocumentCategory;
  fileName: string;
  label: string;
  url: string;
  size: number;
};

export type ReferenceDocumentGroup = {
  category: ReferenceDocumentCategory;
  entries: ReferenceDocumentEntry[];
};

// Zertifikate, then Arbeitszeugnisse, then Zeugnisse -- matches
// REFERENCE_CATEGORIES in generate-application-package.cjs, so the manifest's
// own array order and this grouped/rendered order agree.
const REFERENCE_DOCUMENT_CATEGORIES: ReferenceDocumentCategory[] = [
  "certificates",
  "employmentReferences",
  "diplomas",
];

function isReferenceDocumentEntry(
  value: unknown,
): value is ReferenceDocumentEntry {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.category === "string" &&
    (REFERENCE_DOCUMENT_CATEGORIES as string[]).includes(entry.category) &&
    typeof entry.fileName === "string" &&
    typeof entry.label === "string" &&
    typeof entry.url === "string" &&
    typeof entry.size === "number" &&
    Number.isFinite(entry.size)
  );
}

// Defensive against a missing, malformed, or future-shaped manifest --
// this is runtime data fetched over the network, not something a TypeScript
// type alone can guarantee is well-formed by the time it reaches the
// browser. Anything that doesn't match is dropped silently rather than
// breaking the rest of the (otherwise unrelated) documents page.
export function parseReferenceDocumentsManifest(
  raw: unknown,
): ReferenceDocumentEntry[] {
  return Array.isArray(raw) ? raw.filter(isReferenceDocumentEntry) : [];
}

// Groups entries into the fixed category order above, dropping empty
// categories entirely rather than rendering an empty card for a document
// type nothing has been uploaded for yet.
export function groupReferenceDocumentsByCategory(
  entries: ReferenceDocumentEntry[],
): ReferenceDocumentGroup[] {
  return REFERENCE_DOCUMENT_CATEGORIES.map((category) => ({
    category,
    entries: entries.filter((entry) => entry.category === category),
  })).filter((group) => group.entries.length > 0);
}
