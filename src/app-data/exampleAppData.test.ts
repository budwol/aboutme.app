import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "@jest/globals";

type ExampleAppData = {
  backgroundImage?: string;
  accentColor?: string;
  profile: {
    name: string;
    titleDe: string;
    titleEn: string;
    avatar: string;
    descriptionDe: string[];
    descriptionEn: string[];
  };
  techStack: { primary: string[]; secondary: string[] };
  tools: { primary: string[]; secondary: string[] };
  skillLevels: Record<string, "junior" | "mid" | "senior" | "expert">;
  softSkills: {
    primary: { nameDe: string; nameEn: string; level: string }[];
  };
  certificates: { nameDe: string; nameEn: string }[];
  projects: {
    titleDe: string;
    titleEn: string;
    imageL: string;
    imageM: string;
    imageS: string;
  }[];
  experience: {
    periodDe: string;
    periodEn: string;
    roleDe: string;
    roleEn: string;
    company: string;
  }[];
  contact: {
    email: string;
    addressCountry: string;
    addressStreet: string;
    addressZipCode: string;
    addressCity: string;
  };
};

const exampleAppData = JSON.parse(
  readFileSync(path.resolve(process.cwd(), "app-data.example.json"), "utf8"),
) as ExampleAppData;

describe("app-data.example.json", () => {
  it("contains the current data model used by initialization and E2E tests", () => {
    expect(exampleAppData).toEqual(
      expect.objectContaining({
        profile: expect.any(Object),
        techStack: expect.any(Object),
        tools: expect.any(Object),
        skillLevels: expect.any(Object),
        softSkills: expect.any(Object),
        certificates: expect.any(Array),
        projects: expect.any(Array),
        experience: expect.any(Array),
        contact: expect.any(Object),
      }),
    );

    expect(exampleAppData.profile).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        titleDe: expect.any(String),
        titleEn: expect.any(String),
        avatar: expect.any(String),
        descriptionDe: expect.any(Array),
        descriptionEn: expect.any(Array),
      }),
    );
    expect(exampleAppData.projects.length).toBeGreaterThan(0);
    expect(exampleAppData.experience.length).toBeGreaterThan(0);
  });

  it("defines a valid skill level for every tech and tool", () => {
    const entries = [
      ...exampleAppData.techStack.primary,
      ...exampleAppData.techStack.secondary,
      ...exampleAppData.tools.primary,
      ...exampleAppData.tools.secondary,
    ];

    expect(entries).not.toHaveLength(0);
    expect(new Set(entries).size).toBe(entries.length);

    for (const entry of entries) {
      expect(exampleAppData.skillLevels[entry]).toMatch(
        /^(junior|mid|senior|expert)$/,
      );
    }
  });

  it("keeps the localized collections complete", () => {
    for (const skill of exampleAppData.softSkills.primary) {
      expect(skill.nameDe).toEqual(expect.any(String));
      expect(skill.nameEn).toEqual(expect.any(String));
      expect(skill.level).toMatch(/^(junior|mid|senior|expert)$/);
    }

    for (const certificate of exampleAppData.certificates) {
      expect(certificate.nameDe).toEqual(expect.any(String));
      expect(certificate.nameEn).toEqual(expect.any(String));
    }

    for (const project of exampleAppData.projects) {
      expect(project.titleDe).toEqual(expect.any(String));
      expect(project.titleEn).toEqual(expect.any(String));
      expect(project.imageL).toEqual(expect.any(String));
      expect(project.imageM).toEqual(expect.any(String));
      expect(project.imageS).toEqual(expect.any(String));
    }

    for (const entry of exampleAppData.experience) {
      expect(entry.periodDe).toEqual(expect.any(String));
      expect(entry.periodEn).toEqual(expect.any(String));
      expect(entry.roleDe).toEqual(expect.any(String));
      expect(entry.roleEn).toEqual(expect.any(String));
      expect(entry.company).toEqual(expect.any(String));
    }
  });
});
