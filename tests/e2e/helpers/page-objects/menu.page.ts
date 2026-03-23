import { expect, Page } from "@playwright/test";
import { exampleAppData } from "../../fixtures/example-app-data";

export class MenuPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private body() {
    return this.page.locator("body");
  }

  async navigateToPage() {
    await this.page.goto("/menu");
  }

  async assertIsOnPage() {
    await expect(this.page).toHaveURL(/\/menu$/);
    await expect(this.body()).toContainText(exampleAppData.menu.title);
  }

  async assertContent() {
    await expect(this.body()).toContainText(exampleAppData.menu.theme);
    await expect(this.body()).toContainText(exampleAppData.menu.legal);
    await expect(this.body()).toContainText(exampleAppData.menu.disclaimer);
    await expect(this.body()).toContainText(exampleAppData.menu.privacy);
    await expect(this.body()).toContainText(exampleAppData.menu.terms);
    await expect(this.body()).toContainText(exampleAppData.menu.licenses);
  }

  async openDisclaimerPage() {
    await this.page.getByText(exampleAppData.menu.disclaimer).first().click();
  }

  async openPrivacyPage() {
    await this.page.getByText(exampleAppData.menu.privacy).first().click();
  }

  async openTermsPage() {
    await this.page.getByText(exampleAppData.menu.terms).first().click();
  }

  async openLicensesPage() {
    await this.page.getByText(exampleAppData.menu.licenses).first().click();
  }

  async toggleTheme(currentLabel: string) {
    await this.page.getByText(currentLabel, { exact: true }).first().click();
    await this.page.waitForTimeout(2500);
  }

  async assertThemeLabel(label: string) {
    await expect(this.page.locator("body")).toContainText(label);
  }
}
