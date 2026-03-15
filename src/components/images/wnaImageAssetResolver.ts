import { ProjectEntry } from "@/app-data";

const PROJECT_IMAGE_BREAKPOINT_SMALL = 480;
const PROJECT_IMAGE_BREAKPOINT_MEDIUM = 960;

export function getProjectImageForWidth(
  project: Pick<ProjectEntry, "imageL" | "imageM" | "imageS">,
  width: number,
) {
  if (width <= PROJECT_IMAGE_BREAKPOINT_SMALL) {
    return project.imageS;
  }

  if (width <= PROJECT_IMAGE_BREAKPOINT_MEDIUM) {
    return project.imageM;
  }

  return project.imageL;
}
