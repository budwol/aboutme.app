import { test } from "@playwright/test";
import {
  contrastPages,
  contrastThemes,
  expectReadableText,
} from "../../helpers/contrast/contrastPages";
import { useStoredTheme } from "../../helpers/contrast/measurePageContrast";

for (const theme of contrastThemes) {
  test.describe(`${theme} mode`, () => {
    test.beforeEach(async ({ page }) => {
      await useStoredTheme(page, theme);
    });

    for (const { name, path } of contrastPages) {
      test(`all text on the ${name} page meets WCAG AA contrast`, async ({
        page,
      }) => {
        test.setTimeout(120000);
        await expectReadableText(page, theme, path);
      });
    }
  });
}
