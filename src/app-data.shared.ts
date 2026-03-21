import { i18n } from "@services/i18n/i18n";
import { normalizeSiteUrl } from "@utils/appConfig";

type SupportedLang = "de" | "en";

export type ExperienceEntry = {
  period: string;
  duration: string;
  role: string;
  company: string;
  description: string;
  details: string[];
  techstack: string[];
  opacity?: number;
};

export type ProjectEntry = {
  title: string;
  subtitle?: string;
  context?: string;
  description?: string;
  repoUrl?: string;
  webUrl?: string;
  playStoreUrl?: string;
  techstack: string[];
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
    description: string;
  };
  techStack: {
    primary: string[];
    secondary: string[];
  };
  projects: ProjectEntry[];
  projectsSubtitle?: string;
  projectsContext?: string;
  projectDetailsContext?: string;
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

export const defaultAppData: AppData = {
  siteUrl: "http://localhost:8081",
  backgroundImage: "bg.webp",
  accentColor: "#61afa7",
  profile: {
    name: "Your Name",
    title: "Software Developer",
    avatar: "default_avatar.webp",
    description: "Lorem Ipsum\nLorem Ipsum\nLorem Ipsum",
  },
  techStack: {
    primary: ["Primary 1", "Primary 2", "Primary 3"],
    secondary: ["Secondary 1", "Secondary 2", "Secondary 3"],
  },
  projectsSubtitle: "Some private side projects",
  projectsContext:
    "Private end-to-end projects from concept and architecture to deployment and operation.",
  projectDetailsContext:
    "This project is part of a private end-to-end portfolio and reflects responsibility across conception, architecture, implementation, deployment, and operation.",
  projects: [
    {
      title: "Project 1",
      subtitle: "Container App",
      description: "Short project summary.",
      repoUrl: "https://github.com/example/project-1",
      techstack: ["Code"],
      opacity: 1,
      imageL: "default_project.webp",
      imageM: "default_project.webp",
      imageS: "default_project.webp",
    },
  ],
  experienceSubtitle: "My career path",
  experience: [
    {
      company: "Company",
      role: "Software Dev",
      period: "2010-2015",
      duration: "3Y 5M",
      description: "Wrote code.",
      details: [],
      techstack: [],
      opacity: 1,
    },
  ],
  contact: {
    phone: "0118999",
    email: "your@email.com",
    addressCountry: "Deutschland",
    addressStreet: "Straße 1",
    addressZipCode: "01234",
    addressCity: "Berlin",
    github: "https://github.com/budwol",
    xing: "https://xing.com",
    linkedin: "https://linkedin.com",
  },
};

type ProfileInput = Partial<AppData["profile"]> & {
  titleDe?: string;
  titleEn?: string;
  descriptionDe?: string | string[];
  descriptionEn?: string | string[];
};

type ProjectEntryInput = Partial<ProjectEntry> & {
  titleDe?: string;
  titleEn?: string;
  subtitleDe?: string;
  subtitleEn?: string;
  contextDe?: string;
  contextEn?: string;
  descriptionDe?: string;
  descriptionEn?: string;
};

type ExperienceEntryInput = Partial<ExperienceEntry> & {
  periodDe?: string;
  periodEn?: string;
  roleDe?: string;
  roleEn?: string;
  descriptionDe?: string;
  descriptionEn?: string;
  detailsDe?: string[];
  detailsEn?: string[];
};

type AppDataInput = Partial<AppData> & {
  profile?: ProfileInput;
  techStack?: Partial<AppData["techStack"]>;
  contact?: Partial<AppData["contact"]>;
  projectsSubtitleDe?: string;
  projectsSubtitleEn?: string;
  projectsContextDe?: string;
  projectsContextEn?: string;
  projectDetailsContextDe?: string;
  projectDetailsContextEn?: string;
  projects?: ProjectEntryInput[];
  experienceSubtitleDe?: string;
  experienceSubtitleEn?: string;
  experience?: ExperienceEntryInput[];
};

const defaultProjectEntry = defaultAppData.projects[0];
const defaultExperienceEntry = defaultAppData.experience[0];

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

function getSupportedLang(
  lang = i18n.resolvedLanguage ?? i18n.language,
): SupportedLang {
  return lang === "de" ? "de" : "en";
}

function firstNonEmptyString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }

  return undefined;
}

function firstNonEmptyCollection(...values: unknown[]): unknown {
  for (const value of values) {
    if (Array.isArray(value) && value.length > 0) {
      return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }

  return undefined;
}

function getLocalizedString(
  lang: SupportedLang,
  fallback: string,
  plainValue?: unknown,
  deValue?: unknown,
  enValue?: unknown,
) {
  const preferred = lang === "de" ? deValue : enValue;
  const alternate = lang === "de" ? enValue : deValue;

  return asString(
    firstNonEmptyString(preferred, plainValue, alternate),
    fallback,
  );
}

function getLocalizedStringArray(
  lang: SupportedLang,
  fallback: string[],
  plainValue?: unknown,
  deValue?: unknown,
  enValue?: unknown,
) {
  const preferred = lang === "de" ? deValue : enValue;
  const alternate = lang === "de" ? enValue : deValue;
  const rawValue = firstNonEmptyCollection(preferred, plainValue, alternate);

  return typeof rawValue === "string"
    ? [rawValue.trim()]
    : asStringArray(rawValue, fallback);
}

function parsePeriodStart(period: string): Date | null {
  const match = period.match(/(\d{2})\/(\d{4})/);
  if (!match) {
    return null;
  }

  const month = Number(match[1]) - 1;
  const year = Number(match[2]);

  return Number.isFinite(month) && Number.isFinite(year)
    ? new Date(year, month, 1)
    : null;
}

function parsePeriodEnd(period: string): Date | null {
  const matches = [...period.matchAll(/(\d{2})\/(\d{4})/g)];
  const lastMatch = matches.at(-1);

  if (!lastMatch) {
    return null;
  }

  const month = Number(lastMatch[1]) - 1;
  const year = Number(lastMatch[2]);

  return Number.isFinite(month) && Number.isFinite(year)
    ? new Date(year, month, 1)
    : null;
}

function calculateExperienceDuration(period: string, lang: SupportedLang) {
  const start = parsePeriodStart(period);
  const end = /\b(today|heute|current|since|seit)\b/i.test(period)
    ? new Date()
    : parsePeriodEnd(period);

  if (!start || !end || end < start) {
    return null;
  }

  const totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1;

  if (!Number.isFinite(totalMonths) || totalMonths <= 0) {
    return null;
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (lang === "de") {
    const parts = [];
    if (years > 0) {
      parts.push(`${years} J.`);
    }
    if (months > 0) {
      parts.push(`${months} Mon.`);
    }
    return parts.join(" ") || "1 Mon.";
  }

  const parts = [];
  if (years > 0) {
    parts.push(`${years} ${years === 1 ? "yr" : "yrs"}`);
  }
  if (months > 0) {
    parts.push(`${months} ${months === 1 ? "mo" : "mos"}`);
  }
  return parts.join(" ") || "1 mo";
}

function normalizeProjectEntry(
  entry: ProjectEntryInput,
  lang: SupportedLang,
): ProjectEntry {
  return {
    title: getLocalizedString(
      lang,
      defaultProjectEntry.title,
      entry.title,
      entry.titleDe,
      entry.titleEn,
    ),
    subtitle: firstNonEmptyString(
      getLocalizedString(
        lang,
        "",
        entry.subtitle,
        entry.subtitleDe,
        entry.subtitleEn,
      ),
    ),
    context: firstNonEmptyString(
      getLocalizedString(
        lang,
        "",
        entry.context,
        entry.contextDe,
        entry.contextEn,
      ),
    ),
    description: firstNonEmptyString(
      getLocalizedString(
        lang,
        "",
        entry.description,
        entry.descriptionDe,
        entry.descriptionEn,
      ),
    ),
    repoUrl: firstNonEmptyString(entry.repoUrl),
    webUrl: firstNonEmptyString(entry.webUrl),
    playStoreUrl: firstNonEmptyString(entry.playStoreUrl),
    techstack: asStringArray(entry.techstack, defaultProjectEntry.techstack),
    opacity: asNumberOrUndefined(entry.opacity, defaultProjectEntry.opacity),
    imageL: asString(entry.imageL, defaultProjectEntry.imageL),
    imageM: asString(entry.imageM, defaultProjectEntry.imageM),
    imageS: asString(entry.imageS, defaultProjectEntry.imageS),
  };
}

function normalizeExperienceEntry(
  entry: ExperienceEntryInput,
  lang: SupportedLang,
): ExperienceEntry {
  const period = getLocalizedString(
    lang,
    defaultExperienceEntry.period,
    entry.period,
    entry.periodDe,
    entry.periodEn,
  );

  const calculatedDuration = calculateExperienceDuration(period, lang);

  return {
    period,
    duration: asString(
      entry.duration,
      calculatedDuration ?? period ?? defaultExperienceEntry.duration,
    ),
    role: getLocalizedString(
      lang,
      defaultExperienceEntry.role,
      entry.role,
      entry.roleDe,
      entry.roleEn,
    ),
    company: asString(entry.company, defaultExperienceEntry.company),
    description: getLocalizedString(
      lang,
      defaultExperienceEntry.description,
      entry.description,
      entry.descriptionDe,
      entry.descriptionEn,
    ),
    details: getLocalizedStringArray(
      lang,
      defaultExperienceEntry.details,
      entry.details,
      entry.detailsDe,
      entry.detailsEn,
    ),
    techstack: asStringArray(entry.techstack, defaultExperienceEntry.techstack),
    opacity: asNumberOrUndefined(entry.opacity, defaultExperienceEntry.opacity),
  };
}

export function normalizeAppData(
  input: unknown,
  lang = getSupportedLang(),
): AppData {
  const data = (
    typeof input === "object" && input !== null ? input : {}
  ) as AppDataInput;

  return {
    siteUrl: normalizeSiteUrl(data.siteUrl ?? defaultAppData.siteUrl),
    backgroundImage: asString(
      data.backgroundImage,
      defaultAppData.backgroundImage,
    ),
    accentColor: asString(data.accentColor, defaultAppData.accentColor),
    profile: {
      name: asString(data.profile?.name, defaultAppData.profile.name),
      title: getLocalizedString(
        lang,
        defaultAppData.profile.title,
        data.profile?.title,
        data.profile?.titleDe,
        data.profile?.titleEn,
      ),
      avatar: asString(data.profile?.avatar, defaultAppData.profile.avatar),
      description: getLocalizedStringArray(
        lang,
        defaultAppData.profile.description.split("\n"),
        data.profile?.description,
        data.profile?.descriptionDe,
        data.profile?.descriptionEn,
      ).join("\n"),
    },
    techStack: {
      primary: asStringArray(
        data.techStack?.primary,
        defaultAppData.techStack.primary,
      ),
      secondary: asStringArray(
        data.techStack?.secondary,
        defaultAppData.techStack.secondary,
      ),
    },
    projectsSubtitle: getLocalizedString(
      lang,
      defaultAppData.projectsSubtitle ?? "",
      data.projectsSubtitle,
      data.projectsSubtitleDe,
      data.projectsSubtitleEn,
    ),
    projectsContext: getLocalizedString(
      lang,
      defaultAppData.projectsContext ?? "",
      data.projectsContext,
      data.projectsContextDe,
      data.projectsContextEn,
    ),
    projectDetailsContext: getLocalizedString(
      lang,
      defaultAppData.projectDetailsContext ?? "",
      data.projectDetailsContext,
      data.projectDetailsContextDe,
      data.projectDetailsContextEn,
    ),
    projects:
      data.projects?.map((entry) => normalizeProjectEntry(entry, lang)) ??
      defaultAppData.projects,
    experienceSubtitle: getLocalizedString(
      lang,
      defaultAppData.experienceSubtitle ?? "",
      data.experienceSubtitle,
      data.experienceSubtitleDe,
      data.experienceSubtitleEn,
    ),
    experience:
      data.experience?.map((entry) => normalizeExperienceEntry(entry, lang)) ??
      defaultAppData.experience,
    contact: {
      phone: asString(data.contact?.phone, defaultAppData.contact.phone),
      email: asString(data.contact?.email, defaultAppData.contact.email),
      addressCountry: asString(
        data.contact?.addressCountry,
        defaultAppData.contact.addressCountry,
      ),
      addressStreet: asString(
        data.contact?.addressStreet,
        defaultAppData.contact.addressStreet,
      ),
      addressZipCode: asString(
        data.contact?.addressZipCode,
        defaultAppData.contact.addressZipCode,
      ),
      addressCity: asString(
        data.contact?.addressCity,
        defaultAppData.contact.addressCity,
      ),
      github: asString(data.contact?.github, defaultAppData.contact.github),
      xing: asString(data.contact?.xing, defaultAppData.contact.xing),
      linkedin: asString(
        data.contact?.linkedin,
        defaultAppData.contact.linkedin,
      ),
    },
  };
}

export function unwrapLoadedAppData(data: unknown): unknown {
  return typeof data === "object" && data !== null && "default" in data
    ? (data as { default?: unknown }).default
    : data;
}

export function normalizeLoadedAppData(data: unknown): AppData {
  return normalizeAppData(unwrapLoadedAppData(data));
}
