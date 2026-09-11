import { appLayoutConstants } from "@constants/layoutConstants";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  cardContent: {
    width: "100%",
    gap: appLayoutConstants.contentSectionGap,
  },
  heroSection: {
    width: "100%",
  },
  heroBadgeContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    zIndex: 1,
  },
  heroBottomLeftStack: {
    position: "absolute",
    bottom: 16,
    left: 16,
    zIndex: 1,
    gap: 12,
    alignItems: "flex-start",
  },
  heroActionContainer: {
    position: "absolute",
    bottom: 16,
    right: 16,
    zIndex: 1,
  },
  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: appLayoutConstants.globalCornerRadius,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  contentBody: {
    gap: appLayoutConstants.contentSectionGap,
  },
  contentSection: {
    gap: appLayoutConstants.contentSectionGap - 4,
  },
  stackGroup: {
    gap: 12,
  },
  actionSection: {
    alignItems: "flex-end",
    gap: 12,
  },
  actionLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 16,
  },
  actionButton: {
    minWidth: 160,
    marginHorizontal: 0,
    height: appLayoutConstants.textInputHeight,
    borderRadius: appLayoutConstants.globalCornerRadius,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.52)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: appLayoutConstants.contentPaddingBottom + 4,
    cursor: "auto",
  },
  modalDialog: {
    width: "100%",
    maxWidth: 560,
    padding: appLayoutConstants.contentSectionGap,
    borderRadius: appLayoutConstants.globalCornerRadius,
    borderWidth: 1,
    gap: appLayoutConstants.contentSectionGap - 4,
    cursor: "auto",
  },
  modalHeader: {
    gap: 8,
  },
  modalHeaderTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  modalHeaderCopy: {
    flex: 1,
    gap: 8,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  modalBody: {
    gap: 10,
  },
  modalActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalActionButton: {
    flexGrow: 1,
    flexBasis: 208,
    minWidth: 208,
  },
  descriptionSection: {
    gap: 16,
    padding: appLayoutConstants.contentSectionPaddingVertical + 4,
    borderRadius: appLayoutConstants.globalCornerRadius,
    borderWidth: 1,
  },
  contextSection: {
    padding: 16,
    borderRadius: appLayoutConstants.globalCornerRadius,
    borderWidth: 1,
    gap: 8,
  },
  projectContextText: {
    fontStyle: "italic",
    fontWeight: "400",
  },
  descriptionGroup: {
    gap: 20,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletGroup: {
    gap: 12,
    paddingTop: 4,
  },
  bulletMarker: {
    minWidth: 12,
  },
  bulletText: {
    flex: 1,
  },
});
