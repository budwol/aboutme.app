import { defaultAppData } from "@/app-data/defaults";
import {
  normalizeAppData,
  normalizeLoadedAppData,
} from "@/app-data/normalization";
import Logger from "@/utils/logger";

export { defaultAppData } from "@/app-data/defaults";
export { normalizeAppData } from "@/app-data/normalization";
export type { AppData, ExperienceEntry, ProjectEntry } from "@/app-data/types";

async function readAppDataModule(): Promise<unknown> {
  const embeddedAppData = readEmbeddedAppData();

  if (embeddedAppData) {
    return embeddedAppData;
  }

  const response = await fetch("/app-data.json", {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`app-data fetch failed: ${response.status}`);
  }

  return response.json();
}

function readEmbeddedAppData(): unknown | null {
  if (typeof document === "undefined") {
    return null;
  }

  const appDataScript = document.getElementById("wna-app-data");
  const appDataJson = appDataScript?.textContent?.trim();

  if (!appDataJson) {
    return null;
  }

  return JSON.parse(appDataJson);
}

export const loadAppData = async (
  loadModule: () => Promise<unknown> = readAppDataModule,
) => {
  try {
    return normalizeLoadedAppData(await loadModule());
  } catch {
    Logger.warn(loadAppData.name, "app-data.json not found -> using defaults");
    return normalizeAppData(defaultAppData);
  }
};
