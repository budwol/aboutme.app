import { describe, expect, it, jest } from "@jest/globals";
import { DEFAULT_APP_DATA, loadAppData, normalizeAppData } from "@/app-data";

describe("normalizeAppData", () => {
  it("deep-merges nested objects instead of dropping defaults", () => {
    const data = normalizeAppData({
      profile: { name: "Jane Doe" },
      contact: { email: "jane@example.com" },
    });

    expect(data.profile.name).toBe("Jane Doe");
    expect(data.profile.title).toBe(DEFAULT_APP_DATA.profile.title);
    expect(data.contact.email).toBe("jane@example.com");
    expect(data.contact.addressCity).toBe(DEFAULT_APP_DATA.contact.addressCity);
  });

  it("normalizes project and experience lists with defaults", () => {
    const data = normalizeAppData({
      siteUrl: "https://portfolio.example.com/",
      projects: [{ title: "Custom Project", imageM: "hero.png" }],
      experience: [{ role: "Engineer" }],
    });

    expect(data.siteUrl).toBe("https://portfolio.example.com");
    expect(data.projects[0]).toMatchObject({
      title: "Custom Project",
      imageM: "hero.png",
      imageL: DEFAULT_APP_DATA.projects[0].imageL,
    });
    expect(data.experience[0]).toMatchObject({
      role: "Engineer",
      company: DEFAULT_APP_DATA.experience[0].company,
    });
  });

  it("falls back safely for invalid top-level and nested values", () => {
    const data = normalizeAppData({
      siteUrl: 1234,
      backgroundImage: null,
      accentColor: [],
      profile: {
        description: [null, "", "Focused builder"] as unknown as string[],
      },
      techStack: {
        primary: "typescript" as unknown as string[],
      },
      contact: {
        github: {},
      },
    });

    expect(data.siteUrl).toBe(DEFAULT_APP_DATA.siteUrl);
    expect(data.backgroundImage).toBe(DEFAULT_APP_DATA.backgroundImage);
    expect(data.accentColor).toBe(DEFAULT_APP_DATA.accentColor);
    expect(data.profile.description).toEqual(["Focused builder"]);
    expect(data.techStack.primary).toEqual(DEFAULT_APP_DATA.techStack.primary);
    expect(data.contact.github).toBe(DEFAULT_APP_DATA.contact.github);
  });

  it("normalizes the default fallback when app-data loading fails", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const data = await loadAppData(async () => {
      throw new Error("missing");
    });

    expect(data).toEqual(normalizeAppData(DEFAULT_APP_DATA));
    expect(data).not.toBe(DEFAULT_APP_DATA);
    expect(warnSpy).toHaveBeenCalledWith(
      "app-data.json not found -> using defaults",
    );

    warnSpy.mockRestore();
  });
});
