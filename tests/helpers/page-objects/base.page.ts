import { expect, Page } from "@playwright/test";
import { installExternalUrlCapture } from "../external-routes";

export abstract class BasePage {
  readonly page: Page;
  private readonly browserErrors: string[] = [];

  constructor(page: Page) {
    this.page = page;
    page.on("pageerror", (error) => {
      this.browserErrors.push(`pageerror: ${error.message}`);
    });
    page.on("console", (message) => {
      if (message.type() === "error") {
        const location = message.location().url;
        this.browserErrors.push(
          `console.error: ${message.text()}${location ? ` [${location}]` : ""}`,
        );
      }
    });
    page.on("requestfailed", (request) => {
      if (request.url().startsWith("http://127.0.0.1:")) {
        this.browserErrors.push(
          `requestfailed: ${request.method()} ${request.url()} (${request.failure()?.errorText ?? "unknown"})`,
        );
      }
    });
  }

  protected body() {
    return this.page.locator("body");
  }

  async assertScreenBackgroundImageCoversViewport() {
    await expect
      .poll(async () =>
        this.page.evaluate(() => {
          const backgrounds = Array.from(
            document.querySelectorAll("#screen-background"),
          ).filter(
            (background): background is HTMLElement =>
              background instanceof HTMLElement,
          );

          const candidates = backgrounds.map((background) => {
            const image = background.querySelector("img");
            const backgroundRect = background.getBoundingClientRect();
            const imageRect = image?.getBoundingClientRect();
            const imageSource =
              image instanceof HTMLImageElement
                ? image.currentSrc || image.src
                : "";
            const imageLoaded =
              image instanceof HTMLImageElement &&
              image.complete &&
              image.naturalWidth > 0;

            return {
              backgroundColor:
                window.getComputedStyle(background).backgroundColor,
              backgroundCoversViewport:
                backgroundRect.width >= window.innerWidth - 1 &&
                backgroundRect.height >= window.innerHeight - 1,
              hasDefaultImage: imageSource.includes("bg.webp"),
              imageLoaded,
              imageCoversViewport:
                !!imageRect &&
                imageRect.width >= window.innerWidth - 1 &&
                imageRect.height >= window.innerHeight - 1,
            };
          });

          return {
            candidates,
            hasViewportBackground: candidates.some(
              (candidate) =>
                candidate.backgroundCoversViewport &&
                candidate.hasDefaultImage &&
                candidate.imageLoaded &&
                candidate.imageCoversViewport,
            ),
            visibleBackgroundCount: candidates.filter(
              (candidate) =>
                candidate.backgroundCoversViewport &&
                candidate.imageCoversViewport,
            ).length,
            whiteOnlyBackgroundCount: candidates.filter(
              (candidate) =>
                candidate.backgroundColor === "rgb(255, 255, 255)" &&
                candidate.backgroundCoversViewport &&
                !candidate.hasDefaultImage,
            ).length,
          };
        }),
      )
      .toEqual(
        expect.objectContaining({
          hasViewportBackground: true,
          whiteOnlyBackgroundCount: 0,
        }),
      );
    this.assertNoBrowserErrors();
  }

  private assertNoBrowserErrors() {
    expect(this.browserErrors).toEqual([]);
  }

  protected clearBrowserErrors() {
    this.browserErrors.length = 0;
  }

  // Every route's scrollable content lives in its own internal
  // overflow:auto div (there's a fixed header/footer chrome around it),
  // never the window/document -- see useWnaScrollY.ts, which is what
  // saves and restores a position under this exact container.
  async scrollMainContentBy(delta: number) {
    await this.page.evaluate((amount) => {
      const container = Array.from(document.querySelectorAll("div")).find(
        (element) =>
          getComputedStyle(element).overflowY === "auto" &&
          !element.closest("#wna-drawer-overlay"),
      );
      container?.scrollBy(0, amount);
    }, delta);
  }

  async getMainContentScrollTop(): Promise<number> {
    return this.page.evaluate(() => {
      const container = Array.from(document.querySelectorAll("div")).find(
        (element) =>
          getComputedStyle(element).overflowY === "auto" &&
          !element.closest("#wna-drawer-overlay"),
      );
      return container?.scrollTop ?? 0;
    });
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
    this.assertNoBrowserErrors();
  }
}
