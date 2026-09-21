import { describe, expect, it } from "@jest/globals";
import {
  lookupDocumentSize,
  parseDocumentSizeManifest,
} from "@utils/documentSizeManifest";

describe("parseDocumentSizeManifest", () => {
  it("returns every well-formed entry unchanged", () => {
    expect(parseDocumentSizeManifest({ "/files/CV_DE.pdf": 12345 })).toEqual({
      "/files/CV_DE.pdf": 12345,
    });
  });

  it("returns an empty object for a non-object value", () => {
    expect(parseDocumentSizeManifest(undefined)).toEqual({});
    expect(parseDocumentSizeManifest(null)).toEqual({});
    expect(parseDocumentSizeManifest("not an object")).toEqual({});
  });

  it("returns an empty object for an array", () => {
    expect(parseDocumentSizeManifest([1, 2, 3])).toEqual({});
  });

  it("drops an entry whose size isn't a finite, non-negative number", () => {
    expect(
      parseDocumentSizeManifest({
        good: 100,
        negative: -1,
        notANumber: "100",
        notFinite: NaN,
      }),
    ).toEqual({ good: 100 });
  });
});

describe("lookupDocumentSize", () => {
  const manifest = { "/files/CV_DE.pdf": 12345 };

  it("finds a size by exact pathname", () => {
    expect(lookupDocumentSize(manifest, "/files/CV_DE.pdf")).toBe(12345);
  });

  it("strips a cache-busting query string before looking up", () => {
    expect(lookupDocumentSize(manifest, "/files/CV_DE.pdf?v=abc123")).toBe(
      12345,
    );
  });

  it("returns undefined for a url not in the manifest", () => {
    expect(lookupDocumentSize(manifest, "/files/missing.pdf")).toBeUndefined();
  });
});
