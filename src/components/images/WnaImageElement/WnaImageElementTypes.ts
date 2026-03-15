import { WnaImageStyleProps } from "@components/images/WnaImage";
import Colors from "@constants/theme/colors";

export type WnaImageElementProps = {
  appColors: Colors;
  imageUrl: string;
  altText: string;
  style?: WnaImageStyleProps | WnaImageStyleProps[];
  grayScale?: boolean;
  contentFit?: "contain" | "cover";
  overwriteAnimationSpeed?: number;
};

export type WnaImageElementState = {
  loadedImageUrl: string;
  cachedImageBase64Url: string;
};
