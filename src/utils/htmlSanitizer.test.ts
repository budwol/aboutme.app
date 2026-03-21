import { describe, expect, it } from "@jest/globals";
import {
  escapeHtml,
  isHtml,
  sanitizeHtml,
  stripHtml,
} from "@utils/htmlSanitizer";

describe("htmlSanitizer", () => {
  it("escapes dynamic text for html interpolation", () => {
    expect(escapeHtml(`Tom & "<Jerry>"`)).toBe(
      "Tom &amp; &quot;&lt;Jerry&gt;&quot;",
    );
  });

  it("removes unsafe tags and attributes from html", () => {
    const input =
      '<p onclick="alert(1)">Hello</p><script>alert(1)</script><a href="javascript:alert(1)">x</a>';

    expect(sanitizeHtml(input)).toBe("<p>Hello</p><a>x</a>");
  });

  it("keeps only explicitly allowed anchor href protocols", () => {
    expect(
      sanitizeHtml(
        '<a href="https://example.com" target="_blank" rel="noopener">safe</a>',
      ),
    ).toBe('<a href="https://example.com" target="_blank">safe</a>');
    expect(sanitizeHtml('<a href="data:text/html;base64,abc">unsafe</a>')).toBe(
      "<a>unsafe</a>",
    );
  });

  it("removes disallowed tags instead of passing them through", () => {
    expect(
      sanitizeHtml('<iframe src="https://example.com"></iframe><p>safe</p>'),
    ).toBe("<p>safe</p>");
  });

  it("keeps basic helpers working", () => {
    expect(isHtml("<p>hello</p>")).toBe(true);
    expect(stripHtml("<p>hello</p>")).toBe("hello");
  });
});
