import { convertHexToRgba } from "@/utils/colorConverter";
import Logger from "@/utils/logger";
import { cleanAndTruncate } from "@/utils/stringHelper";
import WnaActivityIndicator from "@components/misc/WnaActivityIndicator";
import Colors from "@constants/theme/colors";
import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import WnaImageElement from "./WnaImageElement/WnaImageElement";

export type WnaImageStyleProps = {
  height?: number;
  width?: number;
  minWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  maxWidth?: number;
  borderRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  opacity?: number;
  aspectRatio?: number;
};

export type WnaImageProps = {
  appColors: Colors;
  imageUrl: string;
  imageTitle: string;
  style?: WnaImageStyleProps | WnaImageStyleProps[];
  thumbnailUrl?: string | null;
  placeholderUrl?: string | null;
  hideBackground?: boolean;
  showActivityIndicator?: boolean;
  grayScale?: boolean;
  contentFit?: "contain" | "cover";
  overwriteAnimationSpeed?: number;
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
    imageUrl.startsWith("/") ||
    imageUrl.startsWith("data:")
  ) {
    return imageUrl;
  }

  return `/${imageUrl.replace(/^\/+/, "")}`;
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
    nextProps.thumbnailUrl !== prevProps.thumbnailUrl ||
    nextProps.grayScale !== prevProps.grayScale ||
    nextProps.contentFit !== prevProps.contentFit ||
    nextProps.showActivityIndicator !== prevProps.showActivityIndicator ||
    nextProps.overwriteAnimationSpeed !== prevProps.overwriteAnimationSpeed
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

  return (
    <View style={[styles.wrapper, wrapperBackgroundStyle, props.style]}>
      {props.showActivityIndicator ? (
        <WnaActivityIndicator
          appColors={props.appColors}
          style={styles.overlay}
        />
      ) : null}
      {needsToShowActivityIndicator ? null : (
        <WnaImageElement
          appColors={props.appColors}
          style={props.style}
          imageUrl={displayImageUrl}
          altText={altText}
          grayScale={props.grayScale}
          contentFit={contentFit}
          overwriteAnimationSpeed={props.overwriteAnimationSpeed}
        />
      )}
    </View>
  );
}

export default memo(
  WnaImage,
  (prevProps, nextProps) => !shouldRenderImage(prevProps, nextProps),
);

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});
