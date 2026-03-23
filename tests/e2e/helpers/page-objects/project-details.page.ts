import { expect, Page } from "@playwright/test";
import { exampleAppData } from "../../fixtures/example-app-data";

export class ProjectDetailsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToPage() {
    await this.page.goto("/projects/pizza-app-1");
  }

  async assertIsOnPage() {
    await expect(this.page).toHaveURL(/\/projects\/pizza-app-1$/);
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.projectDetails.firstProject.title,
    );
  }

  async assertContent() {
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.projectDetails.firstProject.subtitle,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.projectDetails.context,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.projectDetails.firstProject.context,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.projectDetails.firstProject.description,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.projectDetails.technologiesTitle,
    );

    for (const tech of exampleAppData.projectDetails.firstProject.techstack) {
      await expect(this.page.locator("body")).toContainText(tech);
    }

    await expect(this.page.locator("body")).toContainText(
      exampleAppData.projectDetails.githubAction,
    );
  }

  async openPrivateRepoModal() {
    await this.page
      .getByRole("button", {
        name: exampleAppData.projectDetails.githubAction,
        exact: true,
      })
      .first()
      .click();
  }

  async assertPrivateRepoModal() {
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.projectDetails.privateRepoTitle,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.projectDetails.emailAction,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.projectDetails.continueToPage,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.projectDetails.privateRepoBody,
    );
  }

  async closePrivateRepoModal() {
    await this.page.getByRole("button", { name: "Close", exact: true }).click();
  }

  async assertPrivateRepoModalClosed() {
    await expect(this.page.locator("body")).not.toContainText(
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
    await this.page.evaluate(() => {
      (
        window as Window & {
          __wnaLastOpenedUrl?: string | null;
          __wnaExternalCaptureInstalled?: boolean;
          open?: (
            url?: string | URL | undefined,
            target?: string,
          ) => Window | null;
        }
      ).__wnaLastOpenedUrl = null;

      if (
        !(window as Window & { __wnaExternalCaptureInstalled?: boolean })
          .__wnaExternalCaptureInstalled
      ) {
        const originalOpen = window.open.bind(window);
        const originalAnchorClick = HTMLAnchorElement.prototype.click;

        window.open = (url?: string | URL, target?: string) => {
          (
            window as Window & {
              __wnaLastOpenedUrl?: string | null;
              __wnaExternalCaptureInstalled?: boolean;
            }
          ).__wnaLastOpenedUrl = String(url ?? "");

          return originalOpen(url, target);
        };

        HTMLAnchorElement.prototype.click = function click() {
          (
            window as Window & {
              __wnaLastOpenedUrl?: string | null;
            }
          ).__wnaLastOpenedUrl = this.href;

          return originalAnchorClick.call(this);
        };

        (
          window as Window & { __wnaExternalCaptureInstalled?: boolean }
        ).__wnaExternalCaptureInstalled = true;
      }
    });
  }

  async openWebApp() {
    await this.page
      .getByRole("button", {
        name: exampleAppData.projectDetails.webAppAction,
        exact: true,
      })
      .first()
      .click();
  }

  async openPlayStore() {
    await this.page
      .getByRole("button", {
        name: exampleAppData.projectDetails.playStoreAction,
        exact: true,
      })
      .first()
      .click();
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
    await expect(this.page.locator("body")).toContainText(project.title);
    await expect(this.page.locator("body")).toContainText(project.subtitle);
  }
}
