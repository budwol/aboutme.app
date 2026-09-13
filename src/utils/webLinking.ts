const supportedProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);

async function canOpenURL(url: string): Promise<boolean> {
  try {
    const trimmedUrl = url.trim();
    if (
      !trimmedUrl ||
      (!/^[a-z][a-z\d+.-]*:/i.test(trimmedUrl) && !trimmedUrl.startsWith("/"))
    ) {
      return false;
    }
    const parsedUrl = new URL(trimmedUrl, window.location.href);
    return supportedProtocols.has(parsedUrl.protocol);
  } catch {
    return false;
  }
}

async function openURL(url: string): Promise<void> {
  if (typeof window === "undefined") return;

  if (!(await canOpenURL(url))) {
    throw new Error(`Unsupported URL: ${url}`);
  }

  const parsedUrl = new URL(url, window.location.href);
  if (parsedUrl.protocol === "mailto:" || parsedUrl.protocol === "tel:") {
    window.location.assign(parsedUrl.href);
    return;
  }

  const openedWindow = window.open(
    parsedUrl.href,
    "_blank",
    "noopener,noreferrer",
  );
  if (!openedWindow) {
    window.location.assign(parsedUrl.href);
  }
}

export const Linking = { canOpenURL, openURL };
