import { expect, Page } from "@playwright/test";
import {
  ContrastTheme,
  findContrastProblems,
  formatFindings,
} from "./measurePageContrast";

// Every screen a visitor can reach, with the example app-data the e2e
// server serves.
export const contrastPages = [
  { name: "home", path: "/" },
  { name: "experience", path: "/experience" },
  { name: "projects", path: "/projects" },
  { name: "project details", path: "/projects/pizza-app-1" },
  { name: "contact", path: "/contact" },
  { name: "menu", path: "/menu" },
];

export const contrastThemes: ContrastTheme[] = ["light", "dark"];

export async function expectReadableText(
  page: Page,
  theme: ContrastTheme,
  path: string,
) {
  await page.goto(path);

  const problems = await findContrastProblems(page);

  expect(
    problems,
    `Text below the WCAG AA contrast minimum (${theme} mode, ${path}):\n` +
      formatFindings(problems),
  ).toEqual([]);
}
