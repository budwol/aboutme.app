import { expect, Locator } from "@playwright/test";
import {
  exampleAppData,
  exampleAppDataDe,
} from "../../fixtures/example-app-data";
import { BasePage } from "./base.page";

export class HomePage extends BasePage {
  async navigateToPage() {
    await this.page.goto("/");
  }

  async navigateToGermanPage() {
    await this.page.goto("/");
  }

  async assertIsOnPage() {
    await expect(this.page).toHaveURL(/\/$/);
    await expect(this.page.getByText("Portfolio").first()).toBeVisible();
    await this.assertScreenBackgroundImageCoversViewport();
  }

  async assertGermanIsOnPage() {
    await expect(this.page).toHaveURL(/\/$/);
    await expect(this.page.getByText("Portfolio").first()).toBeVisible();
    await this.assertScreenBackgroundImageCoversViewport();
  }

  private introName(): Locator {
    return this.page.getByText(exampleAppData.profile.name).first();
  }

  private introTitle(): Locator {
    return this.page.getByText(exampleAppData.profile.title).first();
  }

  async expectIntroToAppear() {
    await expect(this.introName()).toBeVisible();
    await expect(this.introTitle()).toBeVisible();
  }

  async expectGermanIntroToAppear() {
    await expect(
      this.page.getByText(exampleAppDataDe.profile.name).first(),
    ).toBeVisible();
    await expect(
      this.page.getByText(exampleAppDataDe.profile.title).first(),
    ).toBeVisible();
  }

  async expectHomeToBeReady() {
    await expect(
      this.page.getByText(exampleAppData.projects.items[0].title).first(),
    ).toBeVisible();
  }

  async expectGermanHomeToBeReady() {
    await expect(
      this.page.getByText(exampleAppDataDe.projects.items[0].title).first(),
    ).toBeVisible();
  }

  async assertProfileContent() {
    await expect(
      this.page.getByText(exampleAppData.profile.name).nth(1),
    ).toBeVisible();
    await expect(this.page.getByText(exampleAppData.profile.title)).toHaveCount(
      2,
    );

    for (const line of exampleAppData.profile.description) {
      await expect(this.page.getByText(line)).toBeVisible();
    }

    await expect(this.page.getByText("Primary Techstack")).toBeVisible();
    await expect(this.page.getByText("Secondary Techstack")).toBeVisible();

    for (const item of exampleAppData.profile.primaryTechStack) {
      await expect(this.body()).toContainText(item);
    }

    for (const item of exampleAppData.profile.secondaryTechStack) {
      await expect(this.body()).toContainText(item);
    }
  }

  async assertExperiencePreviewContent() {
    await expect(
      this.page.getByText(exampleAppData.experience.title).first(),
    ).toBeVisible();
    await expect(
      this.page.getByText(exampleAppData.experience.subtitle),
    ).toBeVisible();
    await expect(
      this.page.getByText(exampleAppData.experience.firstCompany).first(),
    ).toBeVisible();
    await expect(
      this.page.getByText(exampleAppData.experience.firstRole).first(),
    ).toBeVisible();
    await expect(
      this.page.getByText(exampleAppData.experience.firstDescription).first(),
    ).toBeVisible();
    await expect(
      this.page.getByText(exampleAppData.experience.footerAction).first(),
    ).toBeVisible();
  }

  async assertExperienceTimelineDotsAlignWithPeriods() {
    // Regression test: dotColumn's paddingTop must keep each timeline dot
    // vertically centered on its row's period-year text. A stale padding
    // value (15px, tuned for an earlier, taller period text style) put
    // the years about 9-10px above their dots once that style changed
    // without a matching update here.
    const result = await this.page.evaluate(() => {
      const dots = Array.from(document.querySelectorAll("div")).filter(
        (element): element is HTMLDivElement =>
          element.style.width === "12px" &&
          element.style.borderRadius === "6px",
      );

      const diffs = dots
        .map((dot) => {
          const dotColumn = dot.parentElement;
          const row = dotColumn?.parentElement;
          const periodSpan = row?.firstElementChild?.querySelector("span");
          if (!periodSpan) return null;

          const dotRect = dot.getBoundingClientRect();
          const periodRect = periodSpan.getBoundingClientRect();

          return Math.abs(
            dotRect.top +
              dotRect.height / 2 -
              (periodRect.top + periodRect.height / 2),
          );
        })
        .filter((diff): diff is number => diff !== null);

      return { rowCount: diffs.length, maxDiff: Math.max(0, ...diffs) };
    });

    expect(result.rowCount).toBeGreaterThan(0);
    expect(result.maxDiff).toBeLessThanOrEqual(1.5);
  }

  async expandFirstExperienceItem() {
    await this.page
      .getByText(exampleAppData.experience.showDetails, { exact: false })
      .first()
      .click();
  }

  async collapseFirstExperienceItem() {
    await this.page
      .getByText(exampleAppData.experience.hideDetails, { exact: false })
      .first()
      .click();
  }

  async assertFirstExperienceItemExpanded() {
    await expect(
      this.page.getByText(exampleAppData.experience.firstDetail),
    ).toBeVisible();
    await expect(
      this.page.getByText(exampleAppData.experience.firstTech),
    ).toBeVisible();

    // Regression test: WnaExperienceDetailsBox used to measure its content
    // via ResizeObserverEntry.contentRect (content box only), silently
    // clipping ~26px (styles.detailsBox's own padding + border) off the
    // bottom of every expanded card. toBeVisible() alone doesn't catch
    // that -- it only checks the element's own box has a non-zero size,
    // not whether an ancestor's overflow:hidden height actually fits it.
    await expect
      .poll(() =>
        this.page.evaluate((techText) => {
          const clip = document.querySelector(
            "[id^='wna-experience-details-']",
          );
          const techBadge = Array.from(document.querySelectorAll("span")).find(
            (span) => span.textContent === techText,
          );
          if (!clip || !techBadge) return null;

          return (
            techBadge.getBoundingClientRect().bottom <=
            clip.getBoundingClientRect().bottom + 0.5
          );
        }, exampleAppData.experience.firstTech),
      )
      .toBe(true);
  }

  async assertFirstExperienceItemCollapsed() {
    await expect(
      this.page
        .getByText(exampleAppData.experience.showDetails, {
          exact: false,
        })
        .first(),
    ).toBeVisible();
  }

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

  async openExperiencePage() {
    await this.page
      .getByText(exampleAppData.experience.footerAction)
      .first()
      .click();
  }

  async openProjectsPageFromHeader() {
    // Unlike openProjectsPage() (the in-content "Show more" link near the
    // bottom of the projects preview), the header button is always
    // visible and never needs Playwright to auto-scroll it into view
    // first -- important for tests asserting an exact scroll position,
    // since that auto-scroll would otherwise move it itself.
    await this.page
      .locator("#wna-header-actions")
      .getByRole("button", { name: "Some Projects" })
      .click();
  }

  async openProjectsPage() {
    await this.page
      .getByText(exampleAppData.projects.footerAction)
      .nth(1)
      .click();
  }

  async assertProjectsPreviewContent() {
    await expect(
      this.page.getByText(exampleAppData.projects.title).first(),
    ).toBeVisible();
    await expect(
      this.page.getByText(exampleAppData.projects.subtitle),
    ).toBeVisible();
    await expect(
      this.page.getByText(exampleAppData.projects.context),
    ).toBeVisible();

    for (const item of exampleAppData.projects.highlights) {
      await expect(this.page.getByText(item)).toBeVisible();
    }

    for (const item of exampleAppData.projects.items) {
      await expect(this.page.getByText(item.title).first()).toBeVisible();
    }

    await expect(
      this.page.getByText(exampleAppData.projects.footerAction).nth(1),
    ).toBeVisible();
  }

  async assertContactContent() {
    for (const action of exampleAppData.contact.actions) {
      await expect(this.page.getByText(action).first()).toBeVisible();
    }
  }

  async assertGermanContent() {
    await expect(this.body()).toContainText(exampleAppDataDe.profile.name);
    await expect(this.body()).toContainText(exampleAppDataDe.profile.title);
    await expect(this.body()).toContainText(exampleAppDataDe.experience.title);
    await expect(this.body()).toContainText(exampleAppDataDe.projects.title);
    await expect(this.body()).toContainText(exampleAppDataDe.contact.title);
  }
}
