import { test } from "@playwright/test";
import { ContactPage } from "../../helpers/page-objects/contact.page";

test("user can trigger the contact actions on a mobile portrait viewport", async ({
  page,
}) => {
  const contactPage = new ContactPage(page);

  await test.step("navigate to the contact page", async () => {
    await contactPage.navigateToPage();
    await contactPage.assertIsOnPage();
    await contactPage.assertContent();
  });

  await test.step("open the linkedin profile", async () => {
    await contactPage.prepareExternalUrlCapture();
    await contactPage.openLinkedInProfile();
    await contactPage.assertIsOnLinkedInPage();
  });

  await test.step("open the xing profile", async () => {
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
