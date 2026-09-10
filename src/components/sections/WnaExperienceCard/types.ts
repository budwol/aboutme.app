import { WnaSectionProps } from "@components/sections/WnaSectionProps";
import { AppData } from "@/app-data";

export type WnaExperienceCardProps = WnaSectionProps & {
  maxItems?: number;
  showDetails?: boolean;
  expandAllDetailsByDefault?: boolean;
  footerActionLabel?: string;
  onFooterActionPress?: () => void;
};

export type WnaExperienceItem = AppData["experience"][number];

export type WnaExperienceSharedProps = Pick<
  WnaExperienceCardProps,
  "appColors" | "appStyle" | "t"
>;
