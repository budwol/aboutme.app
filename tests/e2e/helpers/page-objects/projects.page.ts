import { expect, Page } from "@playwright/test";
import {
  exampleAppData,
  exampleAppDataDe,
} from "../../fixtures/example-app-data";

export class ProjectsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToPage() {
    await this.page.goto("/projects");
  }

  async navigateToGermanPage() {
    await this.page.goto("/projekte");
  }

  async assertIsOnPage() {
    await expect(this.page).toHaveURL(/\/projects$/);
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.projects.title,
    );
  }

  async assertGermanIsOnPage() {
    await expect(this.page).toHaveURL(/\/projekte$/);
    await expect(this.page.locator("body")).toContainText(
      exampleAppDataDe.projects.title,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppDataDe.projects.highlights[0],
    );
  }

  async assertContent() {
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.projects.subtitle,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.projects.context,
    );

    for (const item of exampleAppData.projects.highlights) {
      await expect(this.page.locator("body")).toContainText(item);
    }

    for (const item of exampleAppData.projects.items) {
      await expect(this.page.locator("body")).toContainText(item.title);
      await expect(this.page.locator("body")).toContainText(item.subtitle);
    }
  }

  async assertGermanContent() {
    await expect(this.page.locator("body")).toContainText(
      exampleAppDataDe.projects.subtitle,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppDataDe.projects.context,
    );

    for (const item of exampleAppDataDe.projects.highlights) {
      await expect(this.page.locator("body")).toContainText(item);
    }

    for (const item of exampleAppDataDe.projects.items) {
      await expect(this.page.locator("body")).toContainText(item.title);
      await expect(this.page.locator("body")).toContainText(item.subtitle);
    }
  }

  async assertMobileContent() {
    await expect(this.page.locator("body")).toContainText("Mobile First");
    await expect(this.page.locator("body")).toContainText("Geo Data");
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.projects.items[0].title,
    );
  }

  async openFirstProject() {
    const firstProject = this.page.getByLabel(
      `Open project ${exampleAppData.projects.items[0].title}`,
    );

    await firstProject.last().click();
  }

  async openSecondProject() {
    const secondProject = this.page.getByLabel(
      `Open project ${exampleAppData.projects.items[1].title}`,
    );

    await secondProject.last().click();
  }
}
