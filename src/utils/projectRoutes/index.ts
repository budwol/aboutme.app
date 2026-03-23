import { ProjectEntry } from "@/app-data";

export type ProjectRouteLang = "de" | "en";

export function createProjectSlug(title: string, index: number): string {
  const baseSlug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${baseSlug || "project"}-${index + 1}`;
}

export function findProjectBySlug(
  projects: ProjectEntry[],
  slug?: string | null,
): { project: ProjectEntry; index: number } | undefined {
  if (!slug) {
    return undefined;
  }

  for (const [index, project] of projects.entries()) {
    if (createProjectSlug(project.title, index) === slug) {
      return { project, index };
    }
  }

  return undefined;
}

export function getProjectPathSegment(lang: ProjectRouteLang): string {
  return lang === "de" ? "projekte" : "projects";
}
