import { WnaSectionProps } from "@components/sections/wnaSectionProps";
import { AppData } from "@/app-data";

export type WnaExperienceSectionProps = WnaSectionProps & {
  maxItems?: number;
  showDetails?: boolean;
  expandAllDetailsByDefault?: boolean;
  footerActionLabel?: string;
  onFooterActionPress?: () => void;
};

export type WnaExperienceItem = AppData["experience"][number];

export type WnaExperienceSharedProps = Pick<
  WnaExperienceSectionProps,
  "appColors" | "appStyle" | "t"
>;
