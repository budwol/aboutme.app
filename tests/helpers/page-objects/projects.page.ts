import { expect } from "@playwright/test";
import {
  exampleAppData,
  exampleAppDataDe,
} from "../../fixtures/example-app-data";
import { BasePage } from "./base.page";

export class ProjectsPage extends BasePage {
  private projectButton(title: string) {
    return this.page.getByLabel(`Open project ${title}`).last();
  }

  async navigateToPage() {
    await this.page.goto("/projects");
  }

  async navigateToGermanPage() {
    await this.page.goto("/projekte");
  }

  async assertIsOnPage() {
    await expect(this.page).toHaveURL(/\/projects$/);
    await expect(this.body()).toContainText(exampleAppData.projects.title);
  }

  async assertGermanIsOnPage() {
    await expect(this.page).toHaveURL(/\/projekte$/);
    await expect(this.body()).toContainText(exampleAppDataDe.projects.title);
    await expect(this.body()).toContainText(
      exampleAppDataDe.projects.highlights[0],
    );
  }

  async assertContent() {
    await expect(this.body()).toContainText(exampleAppData.projects.subtitle);
    await expect(this.body()).toContainText(exampleAppData.projects.context);

    for (const item of exampleAppData.projects.highlights) {
      await expect(this.body()).toContainText(item);
    }

    for (const item of exampleAppData.projects.items) {
      await expect(this.body()).toContainText(item.title);
      await expect(this.body()).toContainText(item.subtitle);
    }
  }

  async assertGermanContent() {
    await expect(this.body()).toContainText(exampleAppDataDe.projects.subtitle);
    await expect(this.body()).toContainText(exampleAppDataDe.projects.context);

    for (const item of exampleAppDataDe.projects.highlights) {
      await expect(this.body()).toContainText(item);
    }

    for (const item of exampleAppDataDe.projects.items) {
      await expect(this.body()).toContainText(item.title);
      await expect(this.body()).toContainText(item.subtitle);
    }
  }

  async assertMobileContent() {
    await expect(this.body()).toContainText("Mobile First");
    await expect(this.body()).toContainText("Geo Data");
    await expect(this.body()).toContainText(
      exampleAppData.projects.items[0].title,
    );
  }

  async openFirstProject() {
    await this.projectButton(exampleAppData.projects.items[0].title).click();
  }

  async openSecondProject() {
    await this.projectButton(exampleAppData.projects.items[1].title).click();
  }
}
