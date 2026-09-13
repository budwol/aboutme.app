import { ViewStyle } from "react-native";
import { CSSProperties, ReactNode } from "react";

type GradientPoint = [number, number] | { x: number; y: number };

export type WnaCssGradientProps = {
  colors: string[];
  locations?: number[];
  start?: GradientPoint;
  end?: GradientPoint;
  style?: ViewStyle | ViewStyle[];
  children?: ReactNode;
};

function getPoint(
  point: GradientPoint | undefined,
  fallback: [number, number],
) {
  if (!point) return fallback;
  return Array.isArray(point) ? point : [point.x, point.y];
}

function getDirection(
  start: GradientPoint | undefined,
  end: GradientPoint | undefined,
) {
  const [startX, startY] = getPoint(start, [0.5, 0]);
  const [endX, endY] = getPoint(end, [0.5, 1]);
  const degrees = (Math.atan2(endX - startX, startY - endY) * 180) / Math.PI;
  return `${degrees}deg`;
}

function flattenStyle(style: WnaCssGradientProps["style"]): CSSProperties {
  if (!Array.isArray(style)) return (style ?? {}) as CSSProperties;
  return style.reduce<CSSProperties>(
    (result, entry) => Object.assign(result, flattenStyle(entry)),
    {},
  );
}

export default function WnaCssGradient({
  colors,
  locations,
  start,
  end,
  style,
  children,
}: WnaCssGradientProps) {
  const gradient = colors
    .map((color, index) => {
      const location = locations?.[index];
      return location === undefined ? color : `${color} ${location * 100}%`;
    })
    .join(", ");

  return (
    <div
      style={{
        ...flattenStyle(style),
        backgroundImage: `linear-gradient(${getDirection(start, end)}, ${gradient})`,
      }}
    >
      {children}
    </div>
  );
}
