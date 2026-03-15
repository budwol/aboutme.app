import { normalizeSiteUrl } from "@utils/appConfig";

export type ExperienceEntry = {
  period: string;
  role: string;
  company: string;
  description: string;
  opacity?: number;
};

export type ProjectEntry = {
  title: string;
  subtitle?: string;
  tech?: string;
  opacity?: number;
  imageL: string;
  imageM: string;
  imageS: string;
};

export type AppData = {
  siteUrl: string;
  backgroundImage: string;
  accentColor: string;
  profile: {
    name: string;
    title: string;
    avatar: string;
    description: string[];
  };
  techStack: {
    primary: string[];
    secondary: string[];
  };
  projects: ProjectEntry[];
  projectsSubtitle?: string;
  experience: ExperienceEntry[];
  experienceSubtitle?: string;
  contact: {
    phone: string;
    email: string;
    addressCountry: string;
    addressStreet: string;
    addressZipCode: string;
    addressCity: string;
    github: string;
    xing: string;
    linkedin: string;
  };
};

export const DEFAULT_APP_DATA: AppData = {
  siteUrl: "http://localhost:8081",
  backgroundImage: "bg.webp",
  accentColor: "#61afa7",
  profile: {
    name: "Your Name",
    title: "Software Developer",
    avatar: "default_avatar.webp",
    description: ["Lorem Impsum", "Lorem Impsum", "Lorem Impsum"],
  },
  techStack: {
    primary: ["Primary 1", "Primary 2", "Primary 3"],
    secondary: ["Secondary 1", "Secondary 2", "Secondary 3"],
  },
  projectsSubtitle: "Some private side projects",
  projects: [
    {
      title: "Project 1",
      subtitle: "Container App",
      tech: "Code",
      opacity: 1,
      imageL: "app1_1024.webp",
      imageM: "app1_300.webp",
      imageS: "app1_300.webp",
    },
  ],
  experienceSubtitle: "My career path",
  experience: [
    {
      company: "Company",
      role: "Software Dev",
      period: "2010-2015",
      description: "Wrote code.",
      opacity: 1,
    },
  ],
  contact: {
    phone: "0118999",
    email: "your@email.com",
    addressCountry: "Detuschland",
    addressStreet: "Straße 1",
    addressZipCode: "01234",
    addressCity: "Berlin",
    github: "https://github.com/budwol",
    xing: "https://xing.com",
    linkedin: "https://linkedin.com",
  },
};

type AppDataInput = Partial<AppData> & {
  profile?: Partial<AppData["profile"]>;
  techStack?: Partial<AppData["techStack"]>;
  contact?: Partial<AppData["contact"]>;
  projects?: Partial<ProjectEntry>[];
  experience?: Partial<ExperienceEntry>[];
};

const DEFAULT_PROJECT_ENTRY = DEFAULT_APP_DATA.projects[0];
const DEFAULT_EXPERIENCE_ENTRY = DEFAULT_APP_DATA.experience[0];

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

function asStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value.filter(
    (entry): entry is string =>
      typeof entry === "string" && entry.trim() !== "",
  );

  return items.length > 0 ? items : fallback;
}

function asNumberOrUndefined(value: unknown, fallback?: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeProjectEntry(entry: Partial<ProjectEntry>): ProjectEntry {
  return {
    title: asString(entry.title, DEFAULT_PROJECT_ENTRY.title),
    subtitle: asString(entry.subtitle, DEFAULT_PROJECT_ENTRY.subtitle ?? ""),
    tech: asString(entry.tech, DEFAULT_PROJECT_ENTRY.tech ?? ""),
    opacity: asNumberOrUndefined(entry.opacity, DEFAULT_PROJECT_ENTRY.opacity),
    imageL: asString(entry.imageL, DEFAULT_PROJECT_ENTRY.imageL),
    imageM: asString(entry.imageM, DEFAULT_PROJECT_ENTRY.imageM),
    imageS: asString(entry.imageS, DEFAULT_PROJECT_ENTRY.imageS),
  };
}

function normalizeExperienceEntry(
  entry: Partial<ExperienceEntry>,
): ExperienceEntry {
  return {
    period: asString(entry.period, DEFAULT_EXPERIENCE_ENTRY.period),
    role: asString(entry.role, DEFAULT_EXPERIENCE_ENTRY.role),
    company: asString(entry.company, DEFAULT_EXPERIENCE_ENTRY.company),
    description: asString(
      entry.description,
      DEFAULT_EXPERIENCE_ENTRY.description,
    ),
    opacity: asNumberOrUndefined(
      entry.opacity,
      DEFAULT_EXPERIENCE_ENTRY.opacity,
    ),
  };
}

export function normalizeAppData(input: unknown): AppData {
  const data = (
    typeof input === "object" && input !== null ? input : {}
  ) as AppDataInput;

  return {
    siteUrl: normalizeSiteUrl(data.siteUrl ?? DEFAULT_APP_DATA.siteUrl),
    backgroundImage: asString(
      data.backgroundImage,
      DEFAULT_APP_DATA.backgroundImage,
    ),
    accentColor: asString(data.accentColor, DEFAULT_APP_DATA.accentColor),
    profile: {
      name: asString(data.profile?.name, DEFAULT_APP_DATA.profile.name),
      title: asString(data.profile?.title, DEFAULT_APP_DATA.profile.title),
      avatar: asString(data.profile?.avatar, DEFAULT_APP_DATA.profile.avatar),
      description: asStringArray(
        data.profile?.description,
        DEFAULT_APP_DATA.profile.description,
      ),
    },
    techStack: {
      primary: asStringArray(
        data.techStack?.primary,
        DEFAULT_APP_DATA.techStack.primary,
      ),
      secondary: asStringArray(
        data.techStack?.secondary,
        DEFAULT_APP_DATA.techStack.secondary,
      ),
    },
    projectsSubtitle: asString(
      data.projectsSubtitle,
      DEFAULT_APP_DATA.projectsSubtitle ?? "",
    ),
    projects:
      data.projects?.map((entry) => normalizeProjectEntry(entry)) ??
      DEFAULT_APP_DATA.projects,
    experienceSubtitle: asString(
      data.experienceSubtitle,
      DEFAULT_APP_DATA.experienceSubtitle ?? "",
    ),
    experience:
      data.experience?.map((entry) => normalizeExperienceEntry(entry)) ??
      DEFAULT_APP_DATA.experience,
    contact: {
      phone: asString(data.contact?.phone, DEFAULT_APP_DATA.contact.phone),
      email: asString(data.contact?.email, DEFAULT_APP_DATA.contact.email),
      addressCountry: asString(
        data.contact?.addressCountry,
        DEFAULT_APP_DATA.contact.addressCountry,
      ),
      addressStreet: asString(
        data.contact?.addressStreet,
        DEFAULT_APP_DATA.contact.addressStreet,
      ),
      addressZipCode: asString(
        data.contact?.addressZipCode,
        DEFAULT_APP_DATA.contact.addressZipCode,
      ),
      addressCity: asString(
        data.contact?.addressCity,
        DEFAULT_APP_DATA.contact.addressCity,
      ),
      github: asString(data.contact?.github, DEFAULT_APP_DATA.contact.github),
      xing: asString(data.contact?.xing, DEFAULT_APP_DATA.contact.xing),
      linkedin: asString(
        data.contact?.linkedin,
        DEFAULT_APP_DATA.contact.linkedin,
      ),
    },
  };
}

type AppDataModule = {
  default: unknown;
};

export const loadAppData = async (
  loadModule: () => Promise<AppDataModule> = () => import("../app-data.json"),
): Promise<AppData> => {
  try {
    const data = await loadModule();
    return normalizeAppData(data.default);
  } catch {
    console.warn("app-data.json not found -> using defaults");
    return normalizeAppData(DEFAULT_APP_DATA);
  }
};
