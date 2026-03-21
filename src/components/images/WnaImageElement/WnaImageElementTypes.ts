import { ImageProps, ImageSource } from "expo-image";
import { WnaImageStyleProps } from "@components/images/WnaImage";
import Colors from "@constants/theme/colors";

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
