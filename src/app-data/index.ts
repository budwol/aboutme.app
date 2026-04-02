import {
  defaultAppData,
  normalizeAppData,
  normalizeLoadedAppData,
} from "@/app-data/shared";

export type { AppData, ExperienceEntry, ProjectEntry } from "@/app-data/shared";
export {
  defaultAppData,
  normalizeAppData,
  normalizeLoadedAppData,
  unwrapLoadedAppData,
} from "@/app-data/shared";

async function readAppDataModule(): Promise<unknown> {
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

export const loadAppData = async (
  loadModule: () => Promise<unknown> = readAppDataModule,
) => {
  try {
    return normalizeLoadedAppData(await loadModule());
  } catch {
    console.warn("app-data.json not found -> using defaults");
    return normalizeAppData(defaultAppData);
  }
};
