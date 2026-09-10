import { describe, expect, it, jest } from "@jest/globals";
import { showWnaToast, subscribeWnaToast } from "@components/feedback/wnaToast";

describe("wnaToast", () => {
  it("notifies subscribers and stops after unsubscribe", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeWnaToast(listener);
    const toast = { type: "info" as const, text2: "Ready" };

    showWnaToast(toast);
    unsubscribe();
    showWnaToast({ type: "error", text2: "Failed" });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(toast);
  });
});
