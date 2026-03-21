import { WnaResponsiveImageSource } from "@components/images/WnaImage";

const avatarResponsiveSize = 300;
const avatarResponsiveViewportWidth = 1200;
const avatarOriginalSize = 1024;

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

  const avatarVariantFileName = `${withoutExtension(normalizedFileName)}_${avatarResponsiveSize}.webp`;

  return [
    {
      imageUrl: `images/${avatarVariantFileName}`,
      width: avatarResponsiveSize,
      webMaxViewportWidth: avatarResponsiveViewportWidth,
    },
    {
      imageUrl: `images/${normalizedFileName}`,
      width: avatarOriginalSize,
      webMaxViewportWidth: avatarOriginalSize * 2,
    },
  ];
}
