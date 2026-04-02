import { test } from "@playwright/test";
import { ContactPage } from "../../helpers/page-objects/contact.page";

test.use({ locale: "de-DE" });

test("user opens the german contact route and sees german contact content", async ({
  page,
}) => {
  const contactPage = new ContactPage(page);

  await test.step("navigate to the german contact page", async () => {
    await contactPage.navigateToGermanPage();
    await contactPage.assertGermanIsOnPage();
  });

  await test.step("verify german contact content", async () => {
    await contactPage.assertGermanContent();
  });
});
