import { describe, expect, it } from "@jest/globals";
import {
  escapeHtml,
  isHtml,
  sanitizeHtml,
  stripHtml,
} from "@utils/htmlSanitizer";

describe("html sanitizer", () => {
  it("escapes plain text before html interpolation", () => {
    expect(escapeHtml(`Tom & "<Jerry>"`)).toBe(
      "Tom &amp; &quot;&lt;Jerry&gt;&quot;",
    );
  });

  it("strips unsafe tags and attributes", () => {
    const input =
      '<p onclick="alert(1)">Hello</p><script>alert(1)</script><a href="javascript:alert(1)">x</a>';

    expect(sanitizeHtml(input)).toBe("<p>Hello</p><a>x</a>");
  });

  it("keeps only the allowed link protocols", () => {
    expect(
      sanitizeHtml(
        '<a href="https://example.com" target="_blank" rel="noopener">safe</a>',
      ),
    ).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">safe</a>',
    );
    expect(sanitizeHtml('<a href="/contact">local</a>')).toBe(
      '<a href="/contact">local</a>',
    );
    expect(sanitizeHtml('<a href="data:text/html;base64,abc">unsafe</a>')).toBe(
      "<a>unsafe</a>",
    );
  });

  it("forces rel=noopener noreferrer on target=_blank links regardless of input", () => {
    expect(
      sanitizeHtml('<a href="https://example.com" target="_blank">x</a>'),
    ).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">x</a>',
    );
    expect(
      sanitizeHtml(
        '<a href="https://example.com" target="_blank" rel="opener">x</a>',
      ),
    ).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">x</a>',
    );
  });

  it("does not add rel when target is not _blank", () => {
    expect(
      sanitizeHtml('<a href="https://example.com" target="_self">x</a>'),
    ).toBe('<a href="https://example.com" target="_self">x</a>');
    expect(sanitizeHtml('<a href="https://example.com">x</a>')).toBe(
      '<a href="https://example.com">x</a>',
    );
  });

  it("drops tags that are not on the allowlist", () => {
    expect(
      sanitizeHtml('<iframe src="https://example.com"></iframe><p>safe</p>'),
    ).toBe("<p>safe</p>");
  });

  it("keeps the helper functions working", () => {
    expect(isHtml("<p>hello</p>")).toBe(true);
    expect(stripHtml("<p>hello</p>")).toBe("hello");
  });

  it("handles undefined input by defaulting to an empty value", () => {
    expect(escapeHtml()).toBe("");
    expect(sanitizeHtml()).toBe("");
    expect(isHtml()).toBe(false);
    expect(stripHtml()).toBe("");
  });

  it("drops the href and target attributes when they are absent or disallowed", () => {
    expect(sanitizeHtml('<a target="_top">no href</a>')).toBe("<a>no href</a>");
  });
});
