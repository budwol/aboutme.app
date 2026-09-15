import { CSSProperties } from "react";
import { appLayoutConstants } from "@constants/layoutConstants";

export const periodWidth = appLayoutConstants.experiencePeriodWidth;
export const dotColumnWidth = appLayoutConstants.experienceDotColumnWidth;
export const minCardWidth = appLayoutConstants.experienceMinCardWidth;
export const maxCardWidth = appLayoutConstants.experienceMaxCardWidth;
export const compactBreakpoint = appLayoutConstants.experienceCompactBreakpoint;
export const compactSidePadding =
  appLayoutConstants.experienceCompactSidePadding;
export const detailsTopSpacing = appLayoutConstants.experienceDetailsTopSpacing;
export const detailsHeightBuffer =
  appLayoutConstants.experienceDetailsHeightBuffer;

export const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: appLayoutConstants.contentSectionGap,
    paddingBlock: appLayoutConstants.contentSectionPaddingVertical,
  },
  centerWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingInline: 16,
  },
  centerWrapperCompact: {
    alignItems: "stretch",
    paddingInline: 0,
  },
  timelineWrapper: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    gap: 20,
  },
  timelineLineCompact: {
    left: compactSidePadding + dotColumnWidth / 2,
    top: 6,
    bottom: 6,
  },
  timelineLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    borderRadius: 2,
    opacity: 0.4,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: appLayoutConstants.globalListGap,
  },
  rowCompact: {
    gap: appLayoutConstants.globalListGap,
    paddingLeft: compactSidePadding,
  },
  periodColumn: {
    width: periodWidth,
  },
  periodText: {
    paddingBlock: 12,
  },
  periodTextCompact: {
    paddingTop: 0,
    paddingBottom: 10,
    lineHeight: "18px",
  },
  dotColumn: {
    display: "flex",
    flexDirection: "column",
    width: dotColumnWidth,
    alignItems: "center",
    paddingTop: 15,
  },
  dotColumnCompact: {
    paddingTop: 2,
  },
  dot: {
    width: 12,
    height: 12,
    boxSizing: "border-box",
    borderRadius: 6,
    borderWidth: 2,
    borderStyle: "solid",
    marginLeft: 2,
  },
  cardColumn: {
    display: "flex",
    flexDirection: "column",
    width: minCardWidth,
  },
  cardColumnCompact: {
    flex: 1,
    minWidth: 0,
    width: undefined,
  },
  companyLinkRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  companyLinkPressable: {
    alignSelf: "flex-start",
    position: "relative",
    zIndex: 2,
    borderRadius: 8,
    paddingInline: 4,
    paddingBlock: 4,
    marginInline: -4,
    marginBlock: 0,
  },
  companyLinkText: {
    textDecorationLine: "underline",
  },
  companyLinkIcon: {
    opacity: 0.9,
  },
  actionRow: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    alignItems: "flex-end",
  },
  footerActionRow: {
    display: "flex",
    flexDirection: "column",
    marginTop: 24,
    width: "100%",
    alignItems: "center",
  },
  expandButton: {
    marginTop: 8,
    paddingInline: 10,
    paddingBlock: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "solid",
  },
  expandButtonText: {
    letterSpacing: 0.2,
  },
  detailsBox: {
    display: "flex",
    flexDirection: "column",
    marginTop: detailsTopSpacing,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: appLayoutConstants.globalCornerRadius,
    minWidth: 0,
  },
  detailsClip: {
    overflow: "hidden",
  },
  detailCard: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    minWidth: 0,
    padding: 10,
    borderRadius: 12,
  },
  detailMarker: {
    width: 8,
    minWidth: 8,
    height: 8,
    borderRadius: 999,
    alignSelf: "center",
  },
  detailText: {
    flex: 1,
    minWidth: 0,
    lineHeight: "18px",
  },
  techSection: {
    display: "flex",
    flexDirection: "column",
    marginTop: 2,
    gap: 8,
  },
  techLabel: {
    opacity: 0.9,
  },
  techList: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    minWidth: 0,
  },
} satisfies Record<string, CSSProperties>;
