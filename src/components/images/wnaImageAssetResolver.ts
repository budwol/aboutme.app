import { ProjectEntry } from "@/app-data";
import { imageConstants } from "@constants/imageConstants";

export function getProjectImageForWidth(
  project: Pick<ProjectEntry, "imageL" | "imageM" | "imageS">,
  width: number,
) {
  if (width <= imageConstants.projectImageBreakpointSmall) {
    return project.imageS;
  }

  if (width <= imageConstants.projectImageBreakpointMedium) {
    return project.imageM;
  }

  return project.imageL;
}
