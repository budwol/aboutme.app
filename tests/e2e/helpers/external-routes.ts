import { BrowserContext, Page } from "@playwright/test";

export async function stubGithubRoute(target: BrowserContext | Page) {
  const routeTarget = "context" in target ? target.context() : target;

  await routeTarget.route("https://github.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body>stub github page</body></html>",
    });
  });
}

export async function stubLinkedInRoute(target: BrowserContext | Page) {
  const routeTarget = "context" in target ? target.context() : target;

  await routeTarget.route("https://linkedin.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body>stub linkedin page</body></html>",
    });
  });

  await routeTarget.route("https://www.linkedin.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body>stub linkedin page</body></html>",
    });
  });
}

export async function stubXingRoute(target: BrowserContext | Page) {
  const routeTarget = "context" in target ? target.context() : target;

  await routeTarget.route("https://xing.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body>stub xing page</body></html>",
    });
  });

  await routeTarget.route("https://www.xing.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body>stub xing page</body></html>",
    });
  });
}
