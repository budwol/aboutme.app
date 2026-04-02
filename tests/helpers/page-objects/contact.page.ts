import { expect } from "@playwright/test";
import {
  exampleAppData,
  exampleAppDataDe,
} from "../../fixtures/example-app-data";
import { BasePage } from "./base.page";

export class ContactPage extends BasePage {
  private actionButton(label: string) {
    return this.page.getByLabel(label).first();
  }

  async navigateToPage() {
    await this.page.goto("/contact");
  }

  async navigateToGermanPage() {
    await this.page.goto("/kontakt");
  }

  async assertIsOnPage() {
    await expect(this.page).toHaveURL(/\/contact$/);
    await expect(this.body()).toContainText(exampleAppData.contact.title);
    await expect(this.body()).toContainText(exampleAppData.contact.subtitle);
  }

  async assertGermanIsOnPage() {
    await expect(this.page).toHaveURL(/\/kontakt$/);
    await expect(this.body()).toContainText(exampleAppDataDe.contact.title);
    await expect(this.body()).toContainText(exampleAppDataDe.contact.subtitle);
    await expect(this.body()).toContainText(exampleAppDataDe.contact.name);
  }

  async assertGermanContent() {
    await expect(this.body()).toContainText(exampleAppDataDe.contact.name);
    await expect(this.body()).toContainText(exampleAppDataDe.contact.street);
    await expect(this.body()).toContainText(exampleAppDataDe.contact.city);
    await expect(this.body()).toContainText(exampleAppDataDe.contact.country);

    for (const action of exampleAppDataDe.contact.actions) {
      await expect(this.body()).toContainText(action);
    }
  }

  async assertContent() {
    await expect(this.body()).toContainText(exampleAppData.contact.name);
    await expect(this.body()).toContainText(exampleAppData.contact.street);
    await expect(this.body()).toContainText(exampleAppData.contact.city);
    await expect(this.body()).toContainText(exampleAppData.contact.country);

    for (const action of exampleAppData.contact.actions) {
      await expect(this.body()).toContainText(action);
    }
  }

  async openGithubProfile() {
    const popupPromise = this.page.waitForEvent("popup");
    await this.actionButton(exampleAppData.contact.actions[0]).click();
    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded");
  }

  async assertIsOnGithubPage() {
    const pages = this.page.context().pages();
    const githubPage = pages[pages.length - 1];
    await expect(githubPage).toHaveURL(/github\.com/);
  }

  async openLinkedInProfile() {
    await this.actionButton(exampleAppData.contact.actions[1]).click();
  }

  async assertIsOnLinkedInPage() {
    await this.assertLastOpenedUrlMatches(/linkedin\.com/);
  }

  async openXingProfile() {
    await this.actionButton(exampleAppData.contact.actions[2]).click();
  }

  async assertIsOnXingPage() {
    await this.assertLastOpenedUrlMatches(/xing\.com/);
  }

  async openCallAction() {
    await this.actionButton(exampleAppData.contact.actions[3]).click();
  }

  async assertIsOnPhoneLink() {
    await this.assertLastOpenedUrlMatches(/^tel:/);
  }

  async openEmailAction() {
    await this.actionButton(exampleAppData.contact.actions[4]).click();
  }

  async assertIsOnEmailLink() {
    await this.assertLastOpenedUrlMatches(/^mailto:/);
  }
}
