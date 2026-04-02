import { expect } from "@playwright/test";
import {
  exampleAppData,
  exampleAppDataDe,
} from "../../fixtures/example-app-data";
import { BasePage } from "./base.page";

export class ExperiencePage extends BasePage {
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

  async openFirstCompanyLink() {
    await this.page.getByTestId("experience-company-link-0").last().click();
  }

  async assertFirstCompanyUrlOpened() {
    const expectedUrl = exampleAppData.experience.firstCompanyUrl.replace(
      /\/$/,
      "",
    );

    await expect
      .poll(async () =>
        this.page
          .evaluate(
            () =>
              (
                window as Window & {
                  __wnaLastOpenedUrl?: string | null;
                }
              ).__wnaLastOpenedUrl ?? "",
          )
          .then((url) => url.replace(/\/$/, "")),
      )
      .toBe(expectedUrl);
  }
}
