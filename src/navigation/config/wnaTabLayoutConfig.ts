import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";

export type WnaTabScreenConfig = {
  name: string;
  icon: keyof typeof iconMap;
};

export const tabScreenConfigEn: WnaTabScreenConfig[] = [
  { name: "index", icon: "home" },
  { name: "projects", icon: "rocket-launch-outline" },
  { name: "experience", icon: "walk" },
  { name: "contact", icon: "email" },
  { name: "menu", icon: "menu" },
];

export const tabScreenConfigDe: WnaTabScreenConfig[] = [
  { name: "index", icon: "home" },
  { name: "projekte", icon: "rocket-launch-outline" },
  { name: "taetigkeiten", icon: "walk" },
  { name: "kontakt", icon: "email-outline" },
  { name: "menu", icon: "menu" },
];
