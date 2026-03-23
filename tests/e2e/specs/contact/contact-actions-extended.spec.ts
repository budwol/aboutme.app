import { test } from "@playwright/test";
import {
  stubLinkedInRoute,
  stubXingRoute,
} from "../../helpers/external-routes";
import { ContactPage } from "../../helpers/page-objects/contact.page";

test("user can trigger the remaining web contact actions", async ({ page }) => {
  const contactPage = new ContactPage(page);

  await test.step("prepare external route stubs and navigate to contact", async () => {
    await stubLinkedInRoute(page);
    await stubXingRoute(page);
    await contactPage.navigateToPage();
    await contactPage.assertIsOnPage();
    await contactPage.assertContent();
  });

  await test.step("open the linkedin profile action", async () => {
    await contactPage.prepareExternalUrlCapture();
    await contactPage.openLinkedInProfile();
    await contactPage.assertIsOnLinkedInPage();
  });

  await test.step("open the xing profile action", async () => {
    await contactPage.prepareExternalUrlCapture();
    await contactPage.openXingProfile();
    await contactPage.assertIsOnXingPage();
  });

  await test.step("open the email action", async () => {
    await contactPage.prepareExternalUrlCapture();
    await contactPage.openEmailAction();
    await contactPage.assertIsOnEmailLink();
  });
});
