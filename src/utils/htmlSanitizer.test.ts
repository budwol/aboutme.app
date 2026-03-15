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

  it("keeps basic helpers working", () => {
    expect(isHtml("<p>hello</p>")).toBe(true);
    expect(stripHtml("<p>hello</p>")).toBe("hello");
  });
});
