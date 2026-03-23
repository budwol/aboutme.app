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
  return Promise.resolve().then(() => {
    // app-data.json is generated locally and intentionally ignored by git
    return require("../app-data.json") as unknown;
  });
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
