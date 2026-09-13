import { appLayoutConstants } from "@constants/layoutConstants";
import { StyleSheet, ViewStyle } from "react-native";

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
  modalRoot: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  } as unknown as ViewStyle,
  modalBackdrop: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.58)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: appLayoutConstants.contentSectionGap,
    cursor: "auto",
  } as unknown as ViewStyle,
  modalDialog: {
    width: "100%",
    maxWidth: 560,
    padding: appLayoutConstants.contentSectionGap,
    borderRadius: appLayoutConstants.globalCornerRadius,
    borderWidth: 1,
    gap: 16,
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
    gap: 8,
  },
  modalActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 16,
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
