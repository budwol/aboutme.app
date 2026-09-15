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
  boxSizing?: "border-box" | "content-box";
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
  // The CSS width this source is actually rendered at, for the `sizes`
  // attribute. Distinct from `width` (the source file's own pixel
  // resolution, used for `srcSet`'s "w" descriptor) -- conflating the
  // two makes the browser think the element renders at each source's
  // full resolution and pick a far larger file than the layout needs.
  // Falls back to `width` when omitted, matching sources that render at
  // their native resolution.
  displayWidth?: number;
};

export type WnaImageElementState = {
  loadedImageUrl: string;
  cachedImageBase64Url: string;
};
