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
    ).toBe('<a href="https://example.com" target="_blank">safe</a>');
    expect(sanitizeHtml('<a href="data:text/html;base64,abc">unsafe</a>')).toBe(
      "<a>unsafe</a>",
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
});
