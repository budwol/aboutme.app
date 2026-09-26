/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, expect, it, jest } from "@jest/globals";
import WnaDocumentsUnlockGate from "@components/documents/WnaDocumentsUnlockGate";
import TestRenderer, { act } from "react-test-renderer";

function mockElement(name: string) {
  const { createElement } = require("react") as typeof import("react");

  return function MockElement(props: unknown) {
    return createElement(name, props as Record<string, unknown>);
  };
}

jest.mock("@components/buttons/WnaButtonIconText", () =>
  mockElement("WnaButtonIconText"),
);
jest.mock("@components/icon/WnaIcon/WnaIcon", () => mockElement("WnaIcon"));
jest.mock("@components/display/WnaSeparatorHorizontal", () =>
  mockElement("WnaSeparatorHorizontal"),
);

function renderGate(bodyText?: string) {
  let tree: ReturnType<typeof TestRenderer.create> | undefined;
  act(() => {
    tree = TestRenderer.create(
      <WnaDocumentsUnlockGate
        appColors={
          {
            accent4: "#61afa7",
            coolgray2: "#ccc",
            coolgray5: "#999",
            background: "#fff",
            text: "#000",
            red4: "#f75056",
          } as never
        }
        appStyle={{ textNeutralMedium: {}, textNeutralTitleLarge: {} } as never}
        t={((value: string) => value) as never}
        bodyText={bodyText}
        password=""
        setPassword={() => undefined}
        error={null}
        isVerifying={false}
        onUnlock={() => undefined}
      />,
    );
  });
  return tree!;
}

function findSpanTexts(tree: ReturnType<typeof TestRenderer.create>) {
  return tree.root
    .findAll((node: { type: unknown }) => node.type === "span")
    .map((node: { props: { children?: unknown } }) => node.props.children);
}

describe("WnaDocumentsUnlockGate", () => {
  it("shows the body text below the title when one is passed", () => {
    const tree = renderGate("downloadsUnlockBodyDocument");

    expect(findSpanTexts(tree)).toEqual([
      "downloadsUnlockTitle",
      "downloadsUnlockBodyDocument",
    ]);
  });

  it("shows only the title when no body text is passed", () => {
    const tree = renderGate();

    expect(findSpanTexts(tree)).toEqual(["downloadsUnlockTitle"]);
  });
});
