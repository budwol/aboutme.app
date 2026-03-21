import { describe, expect, it } from "@jest/globals";
import { getAvatarImageSources } from "@components/images/wnaAvatarImageResolver";

describe("getAvatarImageSources", () => {
  it("returns responsive avatar sources for the welcome hero", () => {
    expect(getAvatarImageSources("ava.webp")).toEqual([
      {
        imageUrl: "images/ava_300.webp",
        width: 300,
        webMaxViewportWidth: 1200,
      },
      {
        imageUrl: "images/ava.webp",
        width: 1024,
        webMaxViewportWidth: 2048,
      },
    ]);
  });

  it("returns an empty list for an empty avatar file name", () => {
    expect(getAvatarImageSources("")).toEqual([]);
  });
});
