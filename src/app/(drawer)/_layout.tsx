import { useWnaAppLifecycle, useWnaTheme } from "@/state/WnaAppContext";
import { appMotionConstants } from "@constants/motionConstants";
import { Slot } from "expo-router";
import WnaDrawerMenu from "@/navigation/components/WnaDrawerMenu";
import React, { CSSProperties, useEffect, useState } from "react";

const drawerWidth = 300;

export default function DrawerLayout() {
  const { appColors } = useWnaTheme();
  const { closeDrawer, isDrawerOpen } = useWnaAppLifecycle();
  const canAnimate = typeof document !== "undefined" && Boolean(document.body);
  const [isActive, setIsActive] = useState(!canAnimate && isDrawerOpen);

  useEffect(() => {
    if (!isDrawerOpen || !canAnimate) {
      setIsActive(isDrawerOpen);
      return;
    }

    setIsActive(false);
    const timeout = window.setTimeout(() => setIsActive(true), 16);
    return () => window.clearTimeout(timeout);
  }, [canAnimate, isDrawerOpen]);

  useEffect(() => {
    if (!isDrawerOpen || typeof document === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeDrawer, isDrawerOpen]);

  return (
    <>
      <Slot />
      {React.createElement(
        "div",
        {
          id: "wna-drawer-overlay",
          style: {
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            pointerEvents: isDrawerOpen ? "auto" : "none",
          } as CSSProperties,
        },
        React.createElement("div", {
          "data-testid": "wna-drawer-backdrop",
          onClick: closeDrawer,
          style: {
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            opacity: isActive ? 1 : 0,
            transition: `opacity ${appMotionConstants.defaultAnimationDuration}ms ease-out`,
          } as CSSProperties,
        }),
        React.createElement(
          "div",
          {
            "data-testid": "wna-drawer-panel",
            style: {
              position: "relative",
              display: "flex",
              flexDirection: "column",
              width: drawerWidth,
              height: "100%",
              backgroundColor: appColors.isDark
                ? appColors.staticCoolgray8
                : appColors.white,
              transform: isActive ? "translateX(0)" : "translateX(100%)",
              transition: `transform ${appMotionConstants.defaultAnimationDuration}ms ease-out`,
            } as CSSProperties,
          },
          <WnaDrawerMenu />,
        ),
      )}
    </>
  );
}
