import { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
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
  }

  async assertGermanIsOnPage() {
    await expect(this.page).toHaveURL(/\/$/);
    await expect(this.page.getByText("Portfolio").first()).toBeVisible();
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

  async openExperiencePage() {
    await this.page
      .getByText(exampleAppData.experience.footerAction)
      .first()
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
