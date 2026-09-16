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
      // entries[0].contentRect measures only the box's *content* area,
      // excluding the padding and border that styles.detailsBox also
      // adds -- using that here under-measured the box by exactly
      // padding+border on every expand, clipping that much off the
      // bottom once the surrounding wrapper's overflow:hidden height was
      // set from it. offsetHeight is the actual border-box footprint the
      // wrapper needs to fit.
      const nextHeight = (entries[0].target as HTMLElement).offsetHeight;
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
