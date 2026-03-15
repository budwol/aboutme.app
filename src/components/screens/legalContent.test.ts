import { defaultAppData } from "@/app-data";
import { describe, expect, it } from "@jest/globals";
import {
  buildDisclaimerHtml,
  buildPrivacyHtml,
  getLicensesHtmlContent,
  getTermsHtmlContent,
} from "@components/screens/legalContent";

describe("legalContent", () => {
  it("injects app data into disclaimer and privacy html", () => {
    const disclaimer = buildDisclaimerHtml(defaultAppData, "de");
    const privacy = buildPrivacyHtml(defaultAppData, "de");

    expect(disclaimer).toContain(defaultAppData.profile.name);
    expect(disclaimer).toContain(defaultAppData.contact.addressStreet);
    expect(disclaimer).toContain(defaultAppData.contact.phone);
    expect(disclaimer).toContain("§ 5 DDG");
    expect(privacy).toContain(defaultAppData.contact.email);
    expect(privacy).toContain(defaultAppData.contact.addressCountry);
    expect(privacy).toContain("§ 25 Abs. 2 Nr. 2 TDDDG");
    expect(privacy).toContain(
      "Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde",
    );
  });

  it("escapes injected app data before rendering html", () => {
    const disclaimer = buildDisclaimerHtml(
      {
        ...defaultAppData,
        profile: {
          ...defaultAppData.profile,
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
    expect(buildPrivacyHtml(defaultAppData, "en")).toContain("Privacy Policy");
    expect(buildDisclaimerHtml(defaultAppData, "en")).toContain("Imprint");
  });
});
