import { ImageProps, ImageSource } from "expo-image";
import Colors from "@constants/theme/colors";

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

export type WnaImageElementProps = {
  appColors: Colors;
  imageUrl?: string;
  source?: string | ImageSource | ImageSource[];
  altText: string;
  style?: WnaImageStyleProps | WnaImageStyleProps[];
  grayScale?: boolean;
  contentFit?: "contain" | "cover";
  overwriteAnimationSpeed?: number;
  priority?: ImageProps["priority"];
  responsivePolicy?: ImageProps["responsivePolicy"];
};

export type WnaImageElementState = {
  loadedImageUrl: string;
  cachedImageBase64Url: string;
};
