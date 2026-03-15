import { ProjectEntry } from "@/app-data";

const projectImageBreakpointSmall = 480;
const projectImageBreakpointMedium = 960;

export function getProjectImageForWidth(
  project: Pick<ProjectEntry, "imageL" | "imageM" | "imageS">,
  width: number,
) {
  if (width <= projectImageBreakpointSmall) {
    return project.imageS;
  }

  if (width <= projectImageBreakpointMedium) {
    return project.imageM;
  }

  return project.imageL;
}
