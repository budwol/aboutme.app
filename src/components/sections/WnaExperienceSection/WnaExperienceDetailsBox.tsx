import React, {
  CSSProperties,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  detailsHeightBuffer,
  detailsTopSpacing,
  styles,
} from "./wnaExperienceSectionStyles";

type WnaExperienceDetailsBoxProps = {
  isExpanded: boolean;
  backgroundColor: string;
  borderColor: string;
  children: ReactNode;
};

export default function WnaExperienceDetailsBox({
  isExpanded,
  backgroundColor,
  borderColor,
  children,
}: WnaExperienceDetailsBoxProps) {
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const detailsId = useId();
  const targetHeight = isExpanded
    ? contentHeight + detailsTopSpacing + detailsHeightBuffer
    : 0;

  useEffect(() => {
    const node = contentRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const nextHeight = entries[0].contentRect.height;
      setContentHeight((current) =>
        nextHeight !== current ? nextHeight : current,
      );
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return React.createElement(
    "div",
    {
      id: `wna-experience-details-${detailsId}`,
      style: {
        ...styles.detailsClip,
        height: targetHeight,
      } as CSSProperties,
    },
    React.createElement(
      "div",
      {
        ref: contentRef,
        style: {
          ...styles.detailsBox,
          borderColor,
          backgroundColor,
        } as CSSProperties,
      },
      children,
    ),
  );
}
