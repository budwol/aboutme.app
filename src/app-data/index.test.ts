import { describe, expect, it, jest } from "@jest/globals";
import { defaultAppData, loadAppData, normalizeAppData } from "@/app-data";

describe("normalizeAppData", () => {
  it("deep-merges nested objects instead of dropping defaults", () => {
    const data = normalizeAppData(
      {
        profile: { name: "Jane Doe" },
        contact: { email: "jane@example.com" },
      },
      "en",
    );

    expect(data.profile.name).toBe("Jane Doe");
    expect(data.profile.title).toBe(defaultAppData.profile.title);
    expect(data.contact.email).toBe("jane@example.com");
    expect(data.contact.addressCity).toBe(defaultAppData.contact.addressCity);
  });

  it("prefers localized profile content for the selected language", () => {
    const dataDe = normalizeAppData(
      {
        profile: {
          titleDe: "Softwareentwickler",
          titleEn: "Software Engineer",
          descriptionDe: "Deutsch",
          descriptionEn: "English",
        },
      },
      "de",
    );
    const dataEn = normalizeAppData(
      {
        profile: {
          titleDe: "Softwareentwickler",
          titleEn: "Software Engineer",
          descriptionDe: "Deutsch",
          descriptionEn: "English",
        },
      },
      "en",
    );

    expect(dataDe.profile.title).toBe("Softwareentwickler");
    expect(dataDe.profile.description).toBe("Deutsch");
    expect(dataEn.profile.title).toBe("Software Engineer");
    expect(dataEn.profile.description).toBe("English");
  });

  it("normalizes project and experience lists with localized defaults", () => {
    const data = normalizeAppData(
      {
        siteUrl: "https://portfolio.example.com/",
        projectsSubtitleDe: "Private Arbeit",
        projectsSubtitleEn: "Private work",
        projectsContextDe: "Deutscher Projekthinweis",
        projectsContextEn: "English project note",
        projectsHighlights: [
          {
            icon: "phone",
            textDe: "Mobile First",
            textEn: "Mobile First",
          },
        ],
        projectDetailsContextDe: "Deutscher Detailhinweis",
        projectDetailsContextEn: "English detail note",
        projects: [
          {
            titleDe: "Benutzerdefiniertes Projekt",
            titleEn: "Custom Project",
            contextDe: "Deutscher Projektkontext",
            contextEn: "English project context",
            descriptionDe: "Deutsche Beschreibung",
            descriptionEn: "English description",
            repoUrl: "https://github.com/example/custom-project",
            repoVisibility: "private",
            webUrl: "https://app.example.com/custom-project",
            playStoreUrl:
              "https://play.google.com/store/apps/details?id=com.example.customproject",
            techstack: ["TypeScript", "React Native"],
            imageM: "hero.png",
          },
        ],
        experienceSubtitleDe: "Karriereweg",
        experienceSubtitleEn: "Career path",
        experience: [
          {
            roleDe: "Ingenieur",
            roleEn: "Engineer",
            periodDe: "seit 05/2024",
            periodEn: "since 05/2024",
            companyUrl: "https://company.example.com",
            descriptionDe: "Deutsch",
            descriptionEn: "English",
            detailsDe: ["Fokus Deutsch"],
            detailsEn: ["Focus English"],
            techstack: ["C#", ".NET"],
          },
        ],
      },
      "en",
    );

    expect(data.siteUrl).toBe("https://portfolio.example.com");
    expect(data.projectsSubtitle).toBe("Private work");
    expect(data.projectsContext).toBe("English project note");
    expect(data.projectsHighlights).toEqual([
      { icon: "phone", text: "Mobile First" },
    ]);
    expect(data.projectDetailsContext).toBe("English detail note");
    expect(data.projects[0]).toMatchObject({
      title: "Custom Project",
      context: "English project context",
      description: "English description",
      repoUrl: "https://github.com/example/custom-project",
      repoVisibility: "private",
      webUrl: "https://app.example.com/custom-project",
      playStoreUrl:
        "https://play.google.com/store/apps/details?id=com.example.customproject",
      techstack: ["TypeScript", "React Native"],
      imageM: "hero.png",
      imageL: defaultAppData.projects[0].imageL,
    });
    expect(data.experienceSubtitle).toBe("Career path");
    expect(data.experience[0]).toMatchObject({
      role: "Engineer",
      period: "since 05/2024",
      description: "English",
      company: defaultAppData.experience[0].company,
      companyUrl: "https://company.example.com",
      details: ["Focus English"],
      techstack: ["C#", ".NET"],
    });
    expect(data.experience[0].duration).toMatch(/yr|yrs|mo|mos/);
  });

  it("falls back safely for invalid top-level and nested values", () => {
    const data = normalizeAppData(
      {
        siteUrl: 1234,
        backgroundImage: null,
        accentColor: [],
        profile: {
          descriptionDe: [null, "", "Focused builder"] as unknown as string[],
        },
        techStack: {
          primary: "typescript" as unknown as string[],
        },
        contact: {
          github: {},
        },
        experience: [{ periodDe: "..." }],
      },
      "de",
    );

    expect(data.siteUrl).toBe(defaultAppData.siteUrl);
    expect(data.backgroundImage).toBe(defaultAppData.backgroundImage);
    expect(data.accentColor).toBe(defaultAppData.accentColor);
    expect(data.profile.description).toBe("Focused builder");
    expect(data.techStack.primary).toEqual(defaultAppData.techStack.primary);
    expect(data.contact.github).toBe(defaultAppData.contact.github);
    expect(data.experience[0].duration).toBe("...");
  });

  it("calculates experience duration from the localized period", () => {
    const data = normalizeAppData(
      {
        experience: [
          {
            periodDe: "09/2020 - 04/2024",
            periodEn: "09/2020 - 04/2024",
          },
          {
            periodDe: "06/2020 – 08/2020",
            periodEn: "06/2020 – 08/2020",
          },
          {
            periodDe: "01/2019 – 01/2020",
            periodEn: "01/2019 – 01/2020",
          },
        ],
      },
      "de",
    );

    expect(data.experience[0].duration).toBe("3 J. 8 Mon.");
    expect(data.experience[1].duration).toBe("3 Mon.");
    expect(data.experience[2].duration).toBe("1 J. 1 Mon.");
  });

  it("calculates open-ended experience durations for since/seit periods", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-21T12:00:00Z"));

    const dataEn = normalizeAppData(
      {
        experience: [
          {
            periodEn: "since 05/2024",
          },
        ],
      },
      "en",
    );

    const dataDe = normalizeAppData(
      {
        experience: [
          {
            periodDe: "seit 05/2024",
          },
        ],
      },
      "de",
    );

    expect(dataEn.experience[0].duration).toBe("1 yr 11 mos");
    expect(dataDe.experience[0].duration).toBe("1 J. 11 Mon.");

    jest.useRealTimers();
  });

  it("falls back from localized fields to legacy ones", () => {
    const data = normalizeAppData(
      {
        profile: {
          title: "Legacy Title",
          description: ["Legacy Description"],
        },
        projects: [{ title: "Legacy Project", imageM: "hero.png" }],
      },
      "en",
    );

    expect(data.profile.title).toBe("Legacy Title");
    expect(data.profile.description).toBe("Legacy Description");
    expect(data.projects[0].title).toBe("Legacy Project");
    expect(data.projects[0].techstack).toEqual(
      defaultAppData.projects[0].techstack,
    );
  });

  it("normalizes the default fallback when app-data loading fails", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const data = await loadAppData(async () => {
      throw new Error("missing");
    });

    expect(data).toEqual(normalizeAppData(defaultAppData));
    expect(data).not.toBe(defaultAppData);
    expect(warnSpy).toHaveBeenCalledWith(
      "app-data.json not found -> using defaults",
    );

    warnSpy.mockRestore();
  });

  it("loads app-data from a direct json object export", async () => {
    const data = await loadAppData(async () => ({
      siteUrl: "https://portfolio.example.com/",
      profile: {
        name: "budwol",
      },
    }));

    expect(data.siteUrl).toBe("https://portfolio.example.com");
    expect(data.profile.name).toBe("budwol");
  });

  it("loads app-data from a default export wrapper", async () => {
    const data = await loadAppData(async () => ({
      default: {
        siteUrl: "https://portfolio.example.com/",
        profile: {
          name: "budwol",
        },
      },
    }));

    expect(data.siteUrl).toBe("https://portfolio.example.com");
    expect(data.profile.name).toBe("budwol");
  });
});
