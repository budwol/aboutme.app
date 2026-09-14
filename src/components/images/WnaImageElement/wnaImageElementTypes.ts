import Colors from "@constants/theme/colors";

export type WnaImageStyleProps = {
  height?: number | `${number}%` | "auto";
  width?: number | `${number}%` | "auto";
  minWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  maxWidth?: number;
  borderRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: "solid" | "dashed" | "dotted";
  opacity?: number;
  aspectRatio?: number;
};

export type WnaImageStyle =
  | WnaImageStyleProps
  | false
  | null
  | undefined
  | WnaImageStyle[];

export type WnaImageElementProps = {
  appColors: Colors;
  imageUrl?: string;
  source?: string | WnaImageSource | WnaImageSource[];
  altText: string;
  style?: WnaImageStyle;
  grayScale?: boolean;
  contentFit?: "contain" | "cover";
  overwriteAnimationSpeed?: number;
  priority?: "low" | "normal" | "high";
  responsivePolicy?: "static" | "live";
};

export type WnaImageSource = {
  uri: string;
  width?: number;
  height?: number;
  webMaxViewportWidth?: number;
};

export type WnaImageElementState = {
  loadedImageUrl: string;
  cachedImageBase64Url: string;
};
