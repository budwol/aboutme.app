import { describe, expect, it } from "@jest/globals";
import {
  buildDisclaimerHtml,
  buildPrivacyHtml,
  getLicensesHtmlContent,
  getTermsHtmlContent,
} from "@components/screens/legalContent";
import { testAppData } from "@/test/testAppData";

describe("legalContent", () => {
  it("injects app data into disclaimer and privacy html", () => {
    const disclaimer = buildDisclaimerHtml(testAppData, "de");
    const privacy = buildPrivacyHtml(testAppData, "de");

    expect(disclaimer).toContain(testAppData.profile.name);
    expect(disclaimer).toContain(testAppData.contact.addressStreet);
    expect(disclaimer).toContain(testAppData.contact.phone);
    expect(disclaimer).toContain("§ 5 DDG");
    expect(privacy).toContain(testAppData.contact.email);
    expect(privacy).toContain(testAppData.contact.addressCountry);
    expect(privacy).toContain("§ 25 Abs. 2 Nr. 2 TDDDG");
    expect(privacy).toContain(
      "Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde",
    );
  });

  it("escapes injected app data before rendering html", () => {
    const disclaimer = buildDisclaimerHtml(
      {
        ...testAppData,
        profile: {
          ...testAppData.profile,
          name: `<img src=x onerror="alert(1)">`,
        },
      },
      "de",
    );

    expect(disclaimer).toContain(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
    );
    expect(disclaimer).not.toContain('<img src=x onerror="alert(1)">');
  });

  it("returns translated legal documents", () => {
    expect(getTermsHtmlContent("de")).toContain("Nutzungshinweis");
    expect(getTermsHtmlContent("en")).toContain("Terms of Use");
    expect(getLicensesHtmlContent("de")).toContain(
      "Verwendete Kerntechnologien",
    );
    expect(getLicensesHtmlContent("en")).toContain("Core technologies used");
    expect(buildPrivacyHtml(testAppData, "en")).toContain("Privacy Policy");
    expect(buildDisclaimerHtml(testAppData, "en")).toContain("Imprint");
  });
});
