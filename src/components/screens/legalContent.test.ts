import { DEFAULT_APP_DATA } from "@/app-data";
import { describe, expect, it } from "@jest/globals";
import {
  buildDisclaimerHtml,
  buildPrivacyHtml,
  licensesHtmlContent,
  termsHtmlContent,
} from "@components/screens/legalContent";

describe("legalContent", () => {
  it("injects app data into disclaimer and privacy html", () => {
    const disclaimer = buildDisclaimerHtml(DEFAULT_APP_DATA);
    const privacy = buildPrivacyHtml(DEFAULT_APP_DATA);

    expect(disclaimer).toContain(DEFAULT_APP_DATA.profile.name);
    expect(disclaimer).toContain(DEFAULT_APP_DATA.contact.addressStreet);
    expect(privacy).toContain(DEFAULT_APP_DATA.contact.email);
    expect(privacy).toContain(DEFAULT_APP_DATA.contact.addressCountry);
  });

  it("keeps static legal documents available", () => {
    expect(termsHtmlContent).toContain("Nutzungshinweis");
    expect(licensesHtmlContent).toContain("Open Source Software");
  });
});
