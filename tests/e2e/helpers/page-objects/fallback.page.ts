import { expect, Page } from "@playwright/test";
import { exampleAppData } from "../../fixtures/example-app-data";

export class FallbackPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToUnknownRoute() {
    await this.page.goto("/missing-route");
  }

  async navigateToUnknownProjectRoute() {
    await this.page.goto("/projects/missing-project");
  }

  async navigateToUnknownProjectRouteMobile() {
    await this.page.goto("/projects/missing-project");
  }

  async assertRedirectedToHome() {
    await expect(this.page).toHaveURL(/\/$/);
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.projects.items[0].title,
    );
  }

  async assertRedirectedToProjects() {
    await expect(this.page).toHaveURL(/\/projects$/);
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.projects.title,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.projects.items[0].title,
    );
  }
}
