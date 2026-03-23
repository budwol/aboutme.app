import { expect, Page } from "@playwright/test";
import {
  exampleAppData,
  exampleAppDataDe,
} from "../../fixtures/example-app-data";

export class ExperiencePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private body() {
    return this.page.locator("body");
  }

  async navigateToPage() {
    await this.page.goto("/experience");
  }

  async navigateToGermanPage() {
    await this.page.goto("/taetigkeiten");
  }

  async assertIsOnPage() {
    await expect(this.page).toHaveURL(/\/experience$/);
    await expect(this.body()).toContainText(exampleAppData.experience.title);
  }

  async assertGermanIsOnPage() {
    await expect(this.page).toHaveURL(/\/taetigkeiten$/);
    await expect(this.body()).toContainText(exampleAppDataDe.experience.title);
  }

  async assertContent() {
    await expect(this.body()).toContainText(exampleAppData.experience.subtitle);

    for (const item of exampleAppData.experience.items) {
      await expect(this.body()).toContainText(item.company);
      await expect(this.body()).toContainText(item.role);
      await expect(this.body()).toContainText(item.description);
    }
  }

  async assertGermanContent() {
    await expect(this.body()).toContainText(
      exampleAppDataDe.experience.subtitle,
    );

    for (const item of exampleAppDataDe.experience.items) {
      await expect(this.body()).toContainText(item.company);
      await expect(this.body()).toContainText(item.role);
      await expect(this.body()).toContainText(item.description);
    }
  }
}
