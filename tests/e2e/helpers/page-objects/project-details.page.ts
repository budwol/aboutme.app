import { expect, Page } from "@playwright/test";
import { exampleAppData } from "../../fixtures/example-app-data";
import { installExternalUrlCapture } from "../external-routes";

export class ProjectDetailsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private body() {
    return this.page.locator("body");
  }

  private textAction(label: string) {
    return this.page.getByRole("button", { name: label, exact: true }).first();
  }

  async navigateToPage() {
    await this.page.goto("/projects/pizza-app-1");
  }

  async assertIsOnPage() {
    await expect(this.page).toHaveURL(/\/projects\/pizza-app-1$/);
    await expect(this.body()).toContainText(
      exampleAppData.projectDetails.firstProject.title,
    );
  }

  async assertContent() {
    await expect(this.body()).toContainText(
      exampleAppData.projectDetails.firstProject.subtitle,
    );
    await expect(this.body()).toContainText(
      exampleAppData.projectDetails.context,
    );
    await expect(this.body()).toContainText(
      exampleAppData.projectDetails.firstProject.context,
    );
    await expect(this.body()).toContainText(
      exampleAppData.projectDetails.firstProject.description,
    );
    await expect(this.body()).toContainText(
      exampleAppData.projectDetails.technologiesTitle,
    );

    for (const tech of exampleAppData.projectDetails.firstProject.techstack) {
      await expect(this.body()).toContainText(tech);
    }

    await expect(this.body()).toContainText(
      exampleAppData.projectDetails.githubAction,
    );
  }

  async openPrivateRepoModal() {
    await this.textAction(exampleAppData.projectDetails.githubAction).click();
  }

  async assertPrivateRepoModal() {
    await expect(this.body()).toContainText(
      exampleAppData.projectDetails.privateRepoTitle,
    );
    await expect(this.body()).toContainText(
      exampleAppData.projectDetails.emailAction,
    );
    await expect(this.body()).toContainText(
      exampleAppData.projectDetails.continueToPage,
    );
    await expect(this.body()).toContainText(
      exampleAppData.projectDetails.privateRepoBody,
    );
  }

  async closePrivateRepoModal() {
    await this.page.getByRole("button", { name: "Close", exact: true }).click();
  }

  async assertPrivateRepoModalClosed() {
    await expect(this.body()).not.toContainText(
      exampleAppData.projectDetails.privateRepoTitle,
    );
  }

  async continueToRepositoryPage() {
    const popupPromise = this.page.waitForEvent("popup");
    await this.page
      .getByText(exampleAppData.projectDetails.continueToPage, { exact: true })
      .click();
    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded");
  }

  async assertIsOnGithubPage() {
    const pages = this.page.context().pages();
    const githubPage = pages[pages.length - 1];
    await expect(githubPage).toHaveURL(/github\.com/);
  }

  async goBack() {
    await this.page.goBack();
  }

  async prepareExternalUrlCapture() {
    await installExternalUrlCapture(this.page);
  }

  async openWebApp() {
    await this.textAction(exampleAppData.projectDetails.webAppAction).click();
  }

  async openPlayStore() {
    await this.textAction(
      exampleAppData.projectDetails.playStoreAction,
    ).click();
  }

  async openPrivateRepoEmailAction() {
    await this.page
      .getByRole("button", {
        name: exampleAppData.projectDetails.emailAction,
        exact: true,
      })
      .last()
      .click();
  }

  async assertLastOpenedUrlMatches(pattern: RegExp) {
    await expect
      .poll(async () =>
        this.page.evaluate(
          () =>
            (
              window as Window & {
                __wnaLastOpenedUrl?: string | null;
              }
            ).__wnaLastOpenedUrl ?? "",
        ),
      )
      .toMatch(pattern);
  }

  async assertIsOnProject(index: number) {
    const project = exampleAppData.projects.items[index];

    await expect(this.page).toHaveURL(new RegExp(`/projects/.+$`));
    await expect(this.body()).toContainText(project.title);
    await expect(this.body()).toContainText(project.subtitle);
  }
}
