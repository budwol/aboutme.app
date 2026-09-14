import { convertHexToRgba } from "@/utils/colorConverter";
import Logger from "@/utils/logger";
import { cleanAndTruncate } from "@utils/cleanAndTruncate";
import { getVersionedLocalAssetUrl } from "@/utils/versionedAssetUrl";
import WnaActivityIndicator from "@components/feedback/WnaActivityIndicator";
import Colors from "@constants/theme/colors";
import React, { CSSProperties, memo, useMemo } from "react";
import WnaImageElement from "@components/images/WnaImageElement/WnaImageElement";
import {
  WnaImageSource,
  WnaImageStyle,
  WnaImageStyleProps,
} from "@components/images/WnaImageElement/wnaImageElementTypes";

export type { WnaImageStyleProps };

export type WnaImageProps = {
  appColors: Colors;
  imageUrl: string;
  imageTitle: string;
  style?: WnaImageStyle;
  sources?: WnaResponsiveImageSource[];
  thumbnailUrl?: string | null;
  placeholderUrl?: string | null;
  hideBackground?: boolean;
  showActivityIndicator?: boolean;
  grayScale?: boolean;
  contentFit?: "contain" | "cover";
  overwriteAnimationSpeed?: number;
  priority?: "low" | "normal" | "high";
  responsivePolicy?: "static" | "live";
};

export type WnaResponsiveImageSource = {
  imageUrl: string;
  width: number;
  height?: number;
  webMaxViewportWidth?: number;
};

type ImageState = {
  loadedImageUrl: string;
  cachedImageBase64Url: string;
};

type ImageSourceInput = Pick<
  WnaImageProps,
  "imageUrl" | "placeholderUrl" | "thumbnailUrl"
>;

const _blurHash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

function normalizeLocalImageUrl(imageUrl: string): string {
  if (
    imageUrl === "" ||
    imageUrl.startsWith("http") ||
    imageUrl.startsWith("data:")
  ) {
    return imageUrl;
  }

  return getVersionedLocalAssetUrl(`/${imageUrl.replace(/^\/+/, "")}`);
}

function resolveImageState(props: ImageSourceInput): ImageState {
  try {
    let imageUrl = props.imageUrl;

    if (imageUrl === "") imageUrl = props.thumbnailUrl ?? "";
    if (imageUrl === "") imageUrl = props.placeholderUrl ?? "";

    if (imageUrl === "") {
      Logger.warn("WnaImage", "imageUrl is empty");
      return { cachedImageBase64Url: "", loadedImageUrl: "" };
    }

    if (!imageUrl.startsWith("http")) {
      const normalizedImageUrl = normalizeLocalImageUrl(imageUrl);
      return {
        cachedImageBase64Url: normalizedImageUrl,
        loadedImageUrl: normalizedImageUrl,
      };
    }

    return {
      cachedImageBase64Url: imageUrl,
      loadedImageUrl: props.imageUrl,
    };
  } catch (error) {
    Logger.error("WnaImage", error);
    return { cachedImageBase64Url: "", loadedImageUrl: "" };
  }
}

function shouldRenderImage(prevProps: WnaImageProps, nextProps: WnaImageProps) {
  return (
    nextProps.imageUrl !== prevProps.imageUrl ||
    nextProps.imageTitle !== prevProps.imageTitle ||
    nextProps.hideBackground !== prevProps.hideBackground ||
    nextProps.placeholderUrl !== prevProps.placeholderUrl ||
    nextProps.style !== prevProps.style ||
    nextProps.sources !== prevProps.sources ||
    nextProps.thumbnailUrl !== prevProps.thumbnailUrl ||
    nextProps.grayScale !== prevProps.grayScale ||
    nextProps.contentFit !== prevProps.contentFit ||
    nextProps.showActivityIndicator !== prevProps.showActivityIndicator ||
    nextProps.overwriteAnimationSpeed !== prevProps.overwriteAnimationSpeed ||
    nextProps.priority !== prevProps.priority ||
    nextProps.responsivePolicy !== prevProps.responsivePolicy
  );
}

function WnaImage(props: WnaImageProps) {
  const { imageUrl, placeholderUrl, thumbnailUrl } = props;
  const normalizedImageUrl = useMemo(
    () => normalizeLocalImageUrl(imageUrl),
    [imageUrl],
  );
  const imageState = useMemo(
    () => resolveImageState({ imageUrl, placeholderUrl, thumbnailUrl }),
    [imageUrl, placeholderUrl, thumbnailUrl],
  );

  const displayImageUrl = useMemo(
    () =>
      imageState.cachedImageBase64Url !== null &&
      imageState.cachedImageBase64Url !== ""
        ? imageState.cachedImageBase64Url
        : (props.placeholderUrl ?? _blurHash),
    [imageState.cachedImageBase64Url, props.placeholderUrl],
  );

  const altText = useMemo(
    () => cleanAndTruncate(props.imageTitle ?? props.imageUrl),
    [props.imageTitle, props.imageUrl],
  );
  const normalizedSources = useMemo<WnaImageSource[] | undefined>(() => {
    if (!props.sources || props.sources.length === 0) {
      return undefined;
    }

    return props.sources.map((source) => ({
      uri: normalizeLocalImageUrl(source.imageUrl),
      width: source.width,
      height: source.height ?? source.width,
      webMaxViewportWidth: source.webMaxViewportWidth,
    }));
  }, [props.sources]);

  const needsToLoadImage = imageState.loadedImageUrl !== normalizedImageUrl;
  const needsToShowActivityIndicator =
    needsToLoadImage || imageState.cachedImageBase64Url === "";
  const contentFit = props.contentFit ?? "cover";
  const wrapperBackgroundStyle = useMemo(
    () => ({
      backgroundColor:
        props.hideBackground === true
          ? "transparent"
          : convertHexToRgba("#000000", 0.5),
    }),
    [props.hideBackground],
  );

  return React.createElement(
    "div",
    {
      style: {
        ...styles.wrapper,
        ...wrapperBackgroundStyle,
        ...flattenStyle(props.style),
      } as CSSProperties,
    },
    props.showActivityIndicator ? (
      <WnaActivityIndicator
        appColors={props.appColors}
        style={styles.overlay}
      />
    ) : null,
    needsToShowActivityIndicator ? null : (
      <WnaImageElement
        appColors={props.appColors}
        style={props.style}
        imageUrl={displayImageUrl}
        source={normalizedSources ?? displayImageUrl}
        altText={altText}
        grayScale={props.grayScale}
        contentFit={contentFit}
        overwriteAnimationSpeed={props.overwriteAnimationSpeed}
        priority={props.priority}
        responsivePolicy={props.responsivePolicy}
      />
    ),
  );
}

export default memo(
  WnaImage,
  (prevProps, nextProps) => !shouldRenderImage(prevProps, nextProps),
);

function flattenStyle(style: WnaImageStyle): CSSProperties {
  if (!Array.isArray(style)) return (style || {}) as CSSProperties;
  return style.reduce<CSSProperties>(
    (result, entry) => Object.assign(result, flattenStyle(entry)),
    {},
  );
}

const styles = {
  wrapper: {
    // React Native Views are implicitly `position: relative`; a DOM `div`
    // is `static` by default. `overlay` below is `position: absolute` and
    // needs this as its containing block.
    position: "relative",
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
} satisfies Record<string, CSSProperties>;
