import { expect, Page } from "@playwright/test";
import { installExternalUrlCapture } from "../external-routes";

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  protected body() {
    return this.page.locator("body");
  }

  async prepareExternalUrlCapture() {
    await installExternalUrlCapture(this.page);
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
}
