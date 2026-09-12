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

  async assertNavigationTransitionUsesBackground() {
    const overlay = this.page.locator("#navigation-transition-overlay");
    const background = this.page.locator("#navigation-transition-background");
    const image = background.locator("img");

    await expect(overlay).toBeVisible({ timeout: 1000 });
    await expect(image).toHaveAttribute("src", /bg\.webp/);
    await expect
      .poll(async () =>
        overlay.evaluate((element) =>
          Number(window.getComputedStyle(element).opacity),
        ),
      )
      .toBeGreaterThan(0);
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

            return {
              backgroundColor:
                window.getComputedStyle(background).backgroundColor,
              backgroundCoversViewport:
                backgroundRect.width >= window.innerWidth - 1 &&
                backgroundRect.height >= window.innerHeight - 1,
              hasDefaultImage: imageSource.includes("bg.webp"),
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
