import { WnaResponsiveImageSource } from "@components/images/WnaImage";
import { imageConstants } from "@constants/imageConstants";

function trimLeadingSlashes(value: string): string {
  return value.replace(/^\/+/, "");
}

function withoutExtension(value: string): string {
  return value.replace(/\.[^.]+$/, "");
}

export function getAvatarImageSources(
  avatarFileName: string,
  displayWidth: number,
): WnaResponsiveImageSource[] {
  const normalizedFileName = trimLeadingSlashes(
    `${avatarFileName ?? ""}`.trim(),
  );

  if (normalizedFileName === "") {
    return [];
  }

  const avatarVariantFileName = `${withoutExtension(normalizedFileName)}_${imageConstants.avatarResponsiveSize}.webp`;

  // The four `width` values below are each source file's own pixel
  // resolution (for srcSet's "w" descriptor / picking the right file
  // for the viewer's device-pixel ratio) -- the avatar always renders
  // at the same fixed `displayWidth` regardless of which one loads, so
  // `sizes` must describe that, not these resolutions (see
  // WnaImageElement.getSizes and its regression test).
  return [
    {
      imageUrl: `images/${avatarVariantFileName}`,
      width: imageConstants.avatarResponsiveSize,
      webMaxViewportWidth: imageConstants.avatarResponsiveViewportWidth,
      displayWidth,
    },
    {
      imageUrl: `images/${withoutExtension(normalizedFileName)}_${imageConstants.avatarCompactSize}.webp`,
      width: imageConstants.avatarCompactSize,
      webMaxViewportWidth: imageConstants.avatarCompactViewportWidth,
      displayWidth,
    },
    {
      imageUrl: `images/${withoutExtension(normalizedFileName)}_${imageConstants.avatarIntermediateSize}.webp`,
      width: imageConstants.avatarIntermediateSize,
      webMaxViewportWidth: imageConstants.avatarIntermediateViewportWidth,
      displayWidth,
    },
    {
      imageUrl: `images/${normalizedFileName}`,
      width: imageConstants.avatarOriginalSize,
      webMaxViewportWidth: imageConstants.avatarOriginalViewportWidth,
      displayWidth,
    },
  ];
}
