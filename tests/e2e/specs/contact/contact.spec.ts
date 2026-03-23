import { test } from "@playwright/test";
import { ContactPage } from "../../helpers/page-objects/contact.page";

test("user opens the contact page and sees the expected contact content", async ({
  page,
}) => {
  const contactPage = new ContactPage(page);

  await test.step("navigate to the contact page", async () => {
    await contactPage.navigateToPage();
    await contactPage.assertIsOnPage();
  });

  await test.step("verify contact content", async () => {
    await contactPage.assertContent();
  });
});
