import { describe, expect, it } from "@jest/globals";
import {
  groupReferenceDocumentsByCategory,
  parseReferenceDocumentsManifest,
} from "@utils/referenceDocumentsManifest";

const validEntry = {
  category: "certificates" as const,
  fileName: "Jane_Example_-_Zertifikat_AutoCAD.pdf",
  label: "Zertifikat AutoCAD",
  url: "/files/Zertifikate/Jane_Example_-_Zertifikat_AutoCAD.pdf",
  size: 123456,
};

describe("parseReferenceDocumentsManifest", () => {
  it("returns every well-formed entry unchanged", () => {
    expect(parseReferenceDocumentsManifest([validEntry])).toEqual([validEntry]);
  });

  it("returns an empty array for a non-array value", () => {
    expect(parseReferenceDocumentsManifest(undefined)).toEqual([]);
    expect(parseReferenceDocumentsManifest(null)).toEqual([]);
    expect(parseReferenceDocumentsManifest({})).toEqual([]);
  });

  it("drops an entry with an unknown category", () => {
    expect(
      parseReferenceDocumentsManifest([
        { ...validEntry, category: "somethingElse" },
      ]),
    ).toEqual([]);
  });

  it("drops an entry missing a required field", () => {
    const withoutLabel: Record<string, unknown> = { ...validEntry };
    delete withoutLabel.label;
    expect(parseReferenceDocumentsManifest([withoutLabel])).toEqual([]);
  });

  it("drops an entry whose size isn't a finite number", () => {
    expect(
      parseReferenceDocumentsManifest([{ ...validEntry, size: "123456" }]),
    ).toEqual([]);
    expect(
      parseReferenceDocumentsManifest([{ ...validEntry, size: NaN }]),
    ).toEqual([]);
  });

  it("drops a non-object array element", () => {
    expect(
      parseReferenceDocumentsManifest([validEntry, "not-an-entry", 42]),
    ).toEqual([validEntry]);
  });
});

describe("groupReferenceDocumentsByCategory", () => {
  it("groups entries as certificates, then employmentReferences, then diplomas", () => {
    const employmentReference = {
      ...validEntry,
      category: "employmentReferences" as const,
      fileName: "reference.pdf",
    };
    const diploma = {
      ...validEntry,
      category: "diplomas" as const,
      fileName: "diploma.pdf",
    };

    const groups = groupReferenceDocumentsByCategory([
      employmentReference,
      diploma,
      validEntry,
    ]);

    expect(groups.map((group) => group.category)).toEqual([
      "certificates",
      "employmentReferences",
      "diplomas",
    ]);
    expect(groups[0].entries).toEqual([validEntry]);
    expect(groups[1].entries).toEqual([employmentReference]);
    expect(groups[2].entries).toEqual([diploma]);
  });

  it("omits a category with no entries entirely", () => {
    const groups = groupReferenceDocumentsByCategory([validEntry]);
    expect(groups).toEqual([
      { category: "certificates", entries: [validEntry] },
    ]);
  });

  it("returns an empty array for no entries", () => {
    expect(groupReferenceDocumentsByCategory([])).toEqual([]);
  });
});
