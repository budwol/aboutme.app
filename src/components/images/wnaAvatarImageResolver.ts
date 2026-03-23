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
): WnaResponsiveImageSource[] {
  const normalizedFileName = trimLeadingSlashes(
    `${avatarFileName ?? ""}`.trim(),
  );

  if (normalizedFileName === "") {
    return [];
  }

  const avatarVariantFileName = `${withoutExtension(normalizedFileName)}_${imageConstants.avatarResponsiveSize}.webp`;

  return [
    {
      imageUrl: `images/${avatarVariantFileName}`,
      width: imageConstants.avatarResponsiveSize,
      webMaxViewportWidth: imageConstants.avatarResponsiveViewportWidth,
    },
    {
      imageUrl: `images/${normalizedFileName}`,
      width: imageConstants.avatarOriginalSize,
      webMaxViewportWidth: imageConstants.avatarOriginalSize * 2,
    },
  ];
}
