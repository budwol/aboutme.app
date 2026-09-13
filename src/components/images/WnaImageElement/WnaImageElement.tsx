import {
  WnaImageElementProps,
  WnaImageStyleProps,
} from "@components/images/WnaImageElement/wnaImageElementTypes";
import { appMotionConstants } from "@constants/motionConstants";
import { memo, useState } from "react";

function flattenStyle(
  style: WnaImageElementProps["style"],
): WnaImageStyleProps {
  if (style === false || style === null || style === undefined) {
    return {};
  }

  if (!Array.isArray(style)) {
    return style;
  }

  return style.reduce<WnaImageStyleProps>(
    (flattenedStyle, styleEntry) =>
      Object.assign(flattenedStyle, flattenStyle(styleEntry)),
    {},
  );
}

function getImageSources(props: WnaImageElementProps) {
  if (!props.source) {
    return [];
  }

  return Array.isArray(props.source)
    ? props.source
    : typeof props.source === "string"
      ? [{ uri: props.source }]
      : [props.source];
}

function getSizes(
  sources: ReturnType<typeof getImageSources>,
): string | undefined {
  const sizedSources = sources.filter(
    (source) =>
      source.width !== undefined && source.webMaxViewportWidth !== undefined,
  );

  if (sizedSources.length === 0) {
    return undefined;
  }

  return `${sizedSources
    .slice(0, -1)
    .map(
      (source) =>
        `(max-width: ${source.webMaxViewportWidth}px) ${source.width}px`,
    )
    .join(", ")}, ${sizedSources.at(-1)!.width}px`;
}

function WnaImageElement(props: WnaImageElementProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const sources = getImageSources(props);
  const source = sources[0]?.uri ?? props.imageUrl ?? "";
  const srcSet = sources
    .filter((imageSource) => imageSource.width !== undefined)
    .map((imageSource) => `${imageSource.uri} ${imageSource.width}w`)
    .join(", ");
  const style = flattenStyle(props.style);
  const imageStyle = {
    ...style,
    objectFit: props.contentFit ?? "cover",
    filter: props.grayScale ? "grayscale(100%)" : undefined,
    opacity: isLoaded ? 1 : 0,
    transition: `opacity ${props.overwriteAnimationSpeed ?? appMotionConstants.defaultAnimationDuration}ms ease`,
  } as React.CSSProperties;

  return (
    <img
      src={source}
      srcSet={srcSet || undefined}
      sizes={getSizes(sources)}
      alt={props.altText}
      decoding="async"
      loading={props.priority === "high" ? "eager" : "lazy"}
      fetchPriority={props.priority === "high" ? "high" : "auto"}
      style={imageStyle}
      onLoad={() => setIsLoaded(true)}
    />
  );
}

export default memo(WnaImageElement);
