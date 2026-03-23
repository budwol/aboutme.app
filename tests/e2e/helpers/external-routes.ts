import { BrowserContext, Page } from "@playwright/test";

function getRouteTarget(target: BrowserContext | Page) {
  return "context" in target ? target.context() : target;
}

async function stubExternalRoute(
  target: BrowserContext | Page,
  pattern: string,
  body: string,
) {
  await getRouteTarget(target).route(pattern, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body,
    });
  });
}

export async function stubGithubRoute(target: BrowserContext | Page) {
  await stubExternalRoute(
    target,
    "https://github.com/**",
    "<html><body>stub github page</body></html>",
  );
}

export async function stubLinkedInRoute(target: BrowserContext | Page) {
  await stubExternalRoute(
    target,
    "https://linkedin.com/**",
    "<html><body>stub linkedin page</body></html>",
  );
  await stubExternalRoute(
    target,
    "https://www.linkedin.com/**",
    "<html><body>stub linkedin page</body></html>",
  );
}

export async function stubXingRoute(target: BrowserContext | Page) {
  await stubExternalRoute(
    target,
    "https://xing.com/**",
    "<html><body>stub xing page</body></html>",
  );
  await stubExternalRoute(
    target,
    "https://www.xing.com/**",
    "<html><body>stub xing page</body></html>",
  );
}

export async function installExternalUrlCapture(page: Page) {
  await page.evaluate(() => {
    // Some actions end up on window.open, others on a plain anchor click.
    // Capturing both paths once keeps the specs calmer.
    (
      window as Window & {
        __wnaLastOpenedUrl?: string | null;
        __wnaExternalCaptureInstalled?: boolean;
        open?: (
          url?: string | URL | undefined,
          target?: string,
        ) => Window | null;
      }
    ).__wnaLastOpenedUrl = null;

    if (
      !(window as Window & { __wnaExternalCaptureInstalled?: boolean })
        .__wnaExternalCaptureInstalled
    ) {
      const originalOpen = window.open.bind(window);
      const originalAnchorClick = HTMLAnchorElement.prototype.click;

      window.open = (url?: string | URL, target?: string) => {
        (
          window as Window & {
            __wnaLastOpenedUrl?: string | null;
            __wnaExternalCaptureInstalled?: boolean;
          }
        ).__wnaLastOpenedUrl = String(url ?? "");

        return originalOpen(url, target);
      };

      HTMLAnchorElement.prototype.click = function click() {
        (
          window as Window & {
            __wnaLastOpenedUrl?: string | null;
          }
        ).__wnaLastOpenedUrl = this.href;

        return originalAnchorClick.call(this);
      };

      (
        window as Window & { __wnaExternalCaptureInstalled?: boolean }
      ).__wnaExternalCaptureInstalled = true;
    }
  });
}
