import Colors from "@constants/theme/colors";

export type WnaToastType = "themeChange" | "success" | "info" | "error";

export type WnaToast = {
  type: WnaToastType;
  text1?: string;
  text2?: string;
  props?: {
    appColors?: Colors;
  };
};

type WnaToastListener = (toast: WnaToast) => void;

const listeners = new Set<WnaToastListener>();

export function showWnaToast(toast: WnaToast) {
  listeners.forEach((listener) => listener(toast));
}

export function subscribeWnaToast(listener: WnaToastListener) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}
