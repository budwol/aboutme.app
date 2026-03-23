import { expect, Page } from "@playwright/test";
import {
  exampleAppData,
  exampleAppDataDe,
} from "../../fixtures/example-app-data";

export class LegalPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToPage(path: string) {
    await this.page.goto(path);
  }

  async navigateToGermanPrivacyPage() {
    await this.page.goto("/menu/datenschutz");
  }

  async navigateToGermanTermsPage() {
    await this.page.goto("/menu/nutzungsbedingungen");
  }

  async navigateToGermanLicensesPage() {
    await this.page.goto("/menu/lizenzen");
  }

  async assertIsOnPage(pathSuffix: RegExp, expectedText: string) {
    await expect(this.page).toHaveURL(pathSuffix);
    await expect(this.page.locator("body")).toContainText(expectedText);
  }

  async assertIsOnGermanPrivacyPage() {
    await this.assertIsOnPage(/\/menu\/datenschutz$/, "Datenschutz");
  }

  async assertIsOnGermanTermsPage() {
    await this.assertIsOnPage(
      /\/menu\/nutzungsbedingungen$/,
      "Nutzungsbedingungen",
    );
  }

  async assertIsOnGermanLicensesPage() {
    await this.assertIsOnPage(/\/menu\/lizenzen$/, "Lizenzen");
  }

  async navigateToGermanDisclaimerPage() {
    await this.page.goto("/menu/impressum");
  }

  async assertIsOnGermanDisclaimerPage() {
    await this.assertIsOnPage(/\/menu\/impressum$/, "Impressum");
  }

  async assertDisclaimerContent() {
    await expect(this.page.locator("body")).toContainText("Imprint");
    await expect(this.page.locator("body")).toContainText(
      "Provider information pursuant to Section 5 DDG",
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.contact.email,
    );
  }

  async assertGermanDisclaimerContent() {
    await expect(this.page.locator("body")).toContainText("Impressum");
    await expect(this.page.locator("body")).toContainText(
      "Angaben gemäß § 5 DDG",
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppDataDe.contact.email,
    );
  }

  async assertPrivacyContent() {
    await expect(this.page.locator("body")).toContainText("Privacy Policy");
    await expect(this.page.locator("body")).toContainText("Controller");
    await expect(this.page.locator("body")).toContainText(
      "Right to data portability",
    );
  }

  async assertGermanPrivacyContent() {
    await expect(this.page.locator("body")).toContainText(
      "Datenschutzerklärung",
    );
    await expect(this.page.locator("body")).toContainText("Verantwortlicher");
    await expect(this.page.locator("body")).toContainText(
      "Recht auf Datenübertragbarkeit",
    );
  }

  async assertTermsContent() {
    await expect(this.page.locator("body")).toContainText("Terms of Use");
    await expect(this.page.locator("body")).toContainText(
      "general information",
    );
  }

  async assertGermanTermsContent() {
    await expect(this.page.locator("body")).toContainText("Nutzungshinweis");
    await expect(this.page.locator("body")).toContainText(
      "allgemeinen Information",
    );
  }

  async assertLicensesContent() {
    await expect(this.page.locator("body")).toContainText(
      "Open Source Software",
    );
    await expect(this.page.locator("body")).toContainText(
      "Core technologies used",
    );
    await expect(this.page.locator("body")).toContainText("React Native Web");
  }

  async assertGermanLicensesContent() {
    await expect(this.page.locator("body")).toContainText(
      "Open Source Software",
    );
    await expect(this.page.locator("body")).toContainText(
      "Verwendete Kerntechnologien",
    );
    await expect(this.page.locator("body")).toContainText("React Native Web");
  }

  async goBack() {
    await this.page.goBack();
  }
}
