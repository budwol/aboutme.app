const supportedProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);

function parseOpenableURL(url: string): URL | undefined {
  try {
    const trimmedUrl = url.trim();
    if (
      !trimmedUrl ||
      (!/^[a-z][a-z\d+.-]*:/i.test(trimmedUrl) && !trimmedUrl.startsWith("/"))
    ) {
      return undefined;
    }
    const parsedUrl = new URL(trimmedUrl, window.location.href);
    return supportedProtocols.has(parsedUrl.protocol) ? parsedUrl : undefined;
  } catch {
    return undefined;
  }
}

async function canOpenURL(url: string): Promise<boolean> {
  return parseOpenableURL(url) !== undefined;
}

async function openURL(url: string): Promise<void> {
  if (typeof window === "undefined") return;

  const parsedUrl = parseOpenableURL(url);
  if (!parsedUrl) {
    throw new Error(`Unsupported URL: ${url}`);
  }

  if (parsedUrl.protocol === "mailto:" || parsedUrl.protocol === "tel:") {
    window.open(parsedUrl.href, "_self");
    return;
  }

  window.open(parsedUrl.href, "_blank", "noopener,noreferrer");
}

export const Linking = { canOpenURL, openURL };
