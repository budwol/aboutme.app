import { expect } from "@playwright/test";
import { exampleAppData } from "../../fixtures/example-app-data";
import { BasePage } from "./base.page";

export class FallbackPage extends BasePage {
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
    await expect(this.body()).toContainText(
      exampleAppData.projects.items[0].title,
    );
  }

  async assertRedirectedToProjects() {
    await expect(this.page).toHaveURL(/\/projects$/);
    await expect(this.body()).toContainText(exampleAppData.projects.title);
    await expect(this.body()).toContainText(
      exampleAppData.projects.items[0].title,
    );
  }
}
