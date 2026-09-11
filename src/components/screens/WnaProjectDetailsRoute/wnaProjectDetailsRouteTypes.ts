import type { AppData, ProjectEntry } from "@/app-data";
import type { useWnaTheme } from "@/state/WnaAppContext";

export type WnaProjectDetailsThemeProps = {
  appColors: ReturnType<typeof useWnaTheme>["appColors"];
  appStyle: ReturnType<typeof useWnaTheme>["appStyle"];
};

export type WnaProjectLink = {
  url: string;
  label: string;
  icon: "github" | "web" | "google-play";
};

export type WnaProjectDetailsProject = ProjectEntry;

export type WnaProjectDetailsAppData = AppData;
