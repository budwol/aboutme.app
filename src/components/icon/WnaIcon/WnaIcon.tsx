import { iconMap, WnaIconProps } from "@components/icon/WnaIcon/WnaIconMap";
import { CSSProperties } from "react";

export default function WnaIcon({
  iconName,
  size = 24,
  color = "currentColor",
  style,
}: WnaIconProps) {
  const d = iconMap[iconName];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      style={style as CSSProperties}
    >
      <path d={d} />
    </svg>
  );
}
