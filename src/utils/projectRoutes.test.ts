import { testAppData } from "@/test/testAppData";
import {
  createProjectSlug,
  findProjectBySlug,
  getProjectPathSegment,
} from "@utils/projectRoutes";
import { describe, expect, it } from "@jest/globals";

describe("projectRoutes", () => {
  it("creates stable project slugs with an index suffix", () => {
    expect(createProjectSlug("Hello World", 0)).toBe("hello-world-1");
    expect(createProjectSlug("Ä Ö Ü", 1)).toBe("a-o-u-2");
  });

  it("finds projects by their derived slug", () => {
    const match = findProjectBySlug(testAppData.projects, "pizza-app-1");

    expect(match?.project.title).toBe(testAppData.projects[0].title);
    expect(match?.index).toBe(0);
  });

  it("returns localized project path segments", () => {
    expect(getProjectPathSegment("de")).toBe("projekte");
    expect(getProjectPathSegment("en")).toBe("projects");
  });
});
