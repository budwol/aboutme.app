import { expect, Page } from "@playwright/test";
import {
  exampleAppData,
  exampleAppDataDe,
} from "../../fixtures/example-app-data";
import { BasePage } from "./base.page";

export class ExperiencePage extends BasePage {
  private openedCompanyPopup: Page | undefined;

  async navigateToPage() {
    await this.page.goto("/experience");
  }

  async navigateToGermanPage() {
    await this.page.goto("/taetigkeiten");
  }

  async assertIsOnPage() {
    await expect(this.page).toHaveURL(/\/experience$/);
    await expect(this.body()).toContainText(exampleAppData.experience.title);
    await this.assertScreenBackgroundImageCoversViewport();
  }

  async assertGermanIsOnPage() {
    await expect(this.page).toHaveURL(/\/taetigkeiten$/);
    await expect(this.body()).toContainText(exampleAppDataDe.experience.title);
    await this.assertScreenBackgroundImageCoversViewport();
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
    const popupPromise = this.page.waitForEvent("popup");
    await this.page.getByTestId("experience-company-link-0").last().click();
    this.openedCompanyPopup = await popupPromise;
  }

  async assertFirstCompanyUrlOpened() {
    const expectedUrl = exampleAppData.experience.firstCompanyUrl.replace(
      /\/$/,
      "",
    );

    await this.openedCompanyPopup?.waitForLoadState("domcontentloaded");
    const actualUrl = (this.openedCompanyPopup?.url() ?? "").replace(/\/$/, "");

    expect(actualUrl).toBe(expectedUrl);
  }
}
