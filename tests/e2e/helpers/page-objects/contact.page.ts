import { expect, Page } from "@playwright/test";
import {
  exampleAppData,
  exampleAppDataDe,
} from "../../fixtures/example-app-data";

export class ContactPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToPage() {
    await this.page.goto("/contact");
  }

  async navigateToGermanPage() {
    await this.page.goto("/kontakt");
  }

  async assertIsOnPage() {
    await expect(this.page).toHaveURL(/\/contact$/);
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.contact.title,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.contact.subtitle,
    );
  }

  async assertGermanIsOnPage() {
    await expect(this.page).toHaveURL(/\/kontakt$/);
    await expect(this.page.locator("body")).toContainText(
      exampleAppDataDe.contact.title,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppDataDe.contact.subtitle,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppDataDe.contact.name,
    );
  }

  async assertGermanContent() {
    await expect(this.page.locator("body")).toContainText(
      exampleAppDataDe.contact.name,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppDataDe.contact.street,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppDataDe.contact.city,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppDataDe.contact.country,
    );

    for (const action of exampleAppDataDe.contact.actions) {
      await expect(this.page.locator("body")).toContainText(action);
    }
  }

  async assertContent() {
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.contact.name,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.contact.street,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.contact.city,
    );
    await expect(this.page.locator("body")).toContainText(
      exampleAppData.contact.country,
    );

    for (const action of exampleAppData.contact.actions) {
      await expect(this.page.locator("body")).toContainText(action);
    }
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

  async openGithubProfile() {
    const popupPromise = this.page.waitForEvent("popup");
    await this.page
      .getByLabel(exampleAppData.contact.actions[0])
      .first()
      .click();
    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded");
  }

  async assertIsOnGithubPage() {
    const pages = this.page.context().pages();
    const githubPage = pages[pages.length - 1];
    await expect(githubPage).toHaveURL(/github\.com/);
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

  async openLinkedInProfile() {
    await this.page
      .getByLabel(exampleAppData.contact.actions[1])
      .first()
      .click();
  }

  async assertIsOnLinkedInPage() {
    await this.assertLastOpenedUrlMatches(/linkedin\.com/);
  }

  async openXingProfile() {
    await this.page
      .getByLabel(exampleAppData.contact.actions[2])
      .first()
      .click();
  }

  async assertIsOnXingPage() {
    await this.assertLastOpenedUrlMatches(/xing\.com/);
  }

  async openCallAction() {
    await this.page
      .getByLabel(exampleAppData.contact.actions[3])
      .first()
      .click();
  }

  async assertIsOnPhoneLink() {
    await this.assertLastOpenedUrlMatches(/^tel:/);
  }

  async openEmailAction() {
    await this.page
      .getByLabel(exampleAppData.contact.actions[4])
      .first()
      .click();
  }

  async assertIsOnEmailLink() {
    await this.assertLastOpenedUrlMatches(/^mailto:/);
  }
}
