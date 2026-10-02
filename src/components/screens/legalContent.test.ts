import { describe, expect, it, jest } from "@jest/globals";
import {
  buildDisclaimerHtml,
  buildPrivacyHtml,
  getLicensesHtmlContent,
  getTermsHtmlContent,
} from "@components/screens/legalContent";
import { testAppData } from "@/app-data/testAppData";
import type { LegalData } from "@utils/legalData";

const legalData: LegalData = {
  name: testAppData.profile.name,
  addressStreet: "Straße 1",
  addressZipCode: "01234",
  addressCity: "Berlin",
  addressCountry: "Deutschland",
  email: testAppData.contact.email,
};

const mockGetLangCode = jest.fn<() => string>();

jest.mock("@/i18n/i18n", () => ({
  getLangCode: () => mockGetLangCode(),
}));

describe("legalContent", () => {
  it("injects app data into disclaimer and privacy html", () => {
    const disclaimer = buildDisclaimerHtml(testAppData, legalData, "de");
    const privacy = buildPrivacyHtml(testAppData, legalData, "de");

    expect(disclaimer).toContain(testAppData.profile.name);
    expect(disclaimer).toContain("Straße 1<br/>01234 Berlin<br/>Deutschland");
    expect(disclaimer).not.toContain("Telefon");
    expect(disclaimer).toContain("§ 5 DDG");
    expect(privacy).toContain(testAppData.contact.email);
    expect(privacy).toContain("Straße 1<br/>01234 Berlin<br/>Deutschland");
    expect(privacy).not.toContain("Telefon");
    expect(privacy).toContain("§ 25 Abs. 2 Nr. 2 TDDDG");
    expect(privacy).toContain(
      "Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde",
    );
  });

  it("escapes injected app data before rendering html", () => {
    const maliciousName = `<script>alert("x")</script>`;

    const disclaimer = buildDisclaimerHtml(
      {
        ...testAppData,
        profile: {
          ...testAppData.profile,
          name: maliciousName,
        },
      },
      { ...legalData, addressStreet: maliciousName },
      "de",
    );

    expect(disclaimer).toContain(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
    );
    expect(disclaimer).not.toContain(maliciousName);
  });

  it("shows a loading note while the address is still loading", () => {
    expect(buildDisclaimerHtml(testAppData, undefined, "de")).toContain(
      "Anschrift wird geladen",
    );
    expect(buildPrivacyHtml(testAppData, undefined, "en")).toContain(
      "Loading address",
    );
  });

  it("asks for the address by e-mail when it could not be loaded", () => {
    expect(buildDisclaimerHtml(testAppData, null, "de")).toContain(
      "Bitte per E-Mail anfragen",
    );
    expect(buildPrivacyHtml(testAppData, null, "en")).toContain(
      "Please request it by e-mail",
    );
  });

  it("returns translated legal documents", () => {
    expect(getTermsHtmlContent("de")).toContain("Nutzungshinweis");
    expect(getTermsHtmlContent("en")).toContain("Terms of Use");
    expect(getLicensesHtmlContent("de")).toContain(
      "Verwendete Kerntechnologien",
    );
    expect(getLicensesHtmlContent("en")).toContain("Core technologies used");
    expect(buildPrivacyHtml(testAppData, legalData, "en")).toContain(
      "Privacy Policy",
    );
    expect(buildDisclaimerHtml(testAppData, legalData, "en")).toContain(
      "Imprint",
    );
  });

  it("falls back to the detected language when none is provided (German)", () => {
    mockGetLangCode.mockReturnValue("de");

    expect(buildDisclaimerHtml(testAppData, legalData)).toContain("Impressum");
    expect(buildPrivacyHtml(testAppData, legalData)).toContain(
      "Datenschutzerklärung",
    );
    expect(getTermsHtmlContent()).toContain("Nutzungshinweis");
    expect(getLicensesHtmlContent()).toContain("Verwendete Kerntechnologien");
  });

  it("falls back to the detected language when none is provided (English)", () => {
    mockGetLangCode.mockReturnValue("en");

    expect(buildDisclaimerHtml(testAppData, legalData)).toContain("Imprint");
    expect(buildPrivacyHtml(testAppData, legalData)).toContain(
      "Privacy Policy",
    );
    expect(getTermsHtmlContent()).toContain("Terms of Use");
    expect(getLicensesHtmlContent()).toContain("Core technologies used");
  });

  it("treats an unsupported detected language as English", () => {
    mockGetLangCode.mockReturnValue("fr");

    expect(getTermsHtmlContent()).toContain("Terms of Use");
  });
});
