import { StyleSheet } from "react-native";
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

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: appLayoutConstants.contentSectionGap,
    paddingVertical: appLayoutConstants.contentSectionPaddingVertical,
  },
  centerWrapper: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  centerWrapperCompact: {
    alignItems: "stretch",
    paddingHorizontal: 0,
  },
  timelineWrapper: {
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
    paddingVertical: 12,
  },
  periodTextCompact: {
    paddingTop: 0,
    paddingBottom: 10,
    lineHeight: 18,
  },
  dotColumn: {
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
    borderRadius: 6,
    borderWidth: 2,
    marginLeft: 2,
  },
  cardColumn: {
    width: minCardWidth,
  },
  cardColumnCompact: {
    flex: 1,
    minWidth: 0,
    width: undefined,
  },
  companyLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  companyLinkPressable: {
    alignSelf: "flex-start",
    position: "relative",
    zIndex: 2,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginHorizontal: -4,
    marginVertical: -2,
  },
  companyLinkText: {
    textDecorationLine: "underline",
  },
  companyLinkIcon: {
    opacity: 0.9,
  },
  actionRow: {
    width: "100%",
    alignItems: "flex-end",
  },
  footerActionRow: {
    marginTop: 24,
    width: "100%",
    alignItems: "center",
  },
  expandButton: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  expandButtonText: {
    letterSpacing: 0.2,
  },
  detailsBox: {
    marginTop: detailsTopSpacing,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderRadius: appLayoutConstants.globalCornerRadius,
    minWidth: 0,
  },
  detailsClip: {
    overflow: "hidden",
  },
  detailCard: {
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
    lineHeight: 18,
  },
  techSection: {
    marginTop: 2,
    gap: 8,
  },
  techLabel: {
    opacity: 0.9,
  },
  techList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    minWidth: 0,
  },
});
