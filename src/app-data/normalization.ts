import { defaultAppData } from "@/app-data/defaults";
import { calculateExperienceDuration } from "@/app-data/experienceDuration";
import {
  asString,
  asStringArray,
  firstNonEmptyString,
  getLocalizedString,
  getLocalizedStringArray,
  getSupportedLang,
} from "@/app-data/localization";
import {
  AppData,
  AppDataInput,
  ExperienceEntry,
  ExperienceEntryInput,
  ProjectEntry,
  ProjectEntryInput,
  ProjectHighlightEntry,
  ProjectHighlightEntryInput,
  RepoVisibility,
  SupportedLang,
} from "@/app-data/types";
import { normalizeSiteUrl } from "@utils/appConfig";

const defaultProjectEntry = defaultAppData.projects[0];
const defaultExperienceEntry = defaultAppData.experience[0];

function asNumberOrUndefined(value: unknown, fallback?: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asRepoVisibility(
  value: unknown,
  fallback?: RepoVisibility,
): RepoVisibility | undefined {
  return value === "private" || value === "public" ? value : fallback;
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
    repoVisibility: asRepoVisibility(
      entry.repoVisibility,
      defaultProjectEntry.repoVisibility,
    ),
    webUrl: firstNonEmptyString(entry.webUrl),
    playStoreUrl: firstNonEmptyString(entry.playStoreUrl),
    techstack: asStringArray(entry.techstack, defaultProjectEntry.techstack),
    opacity: asNumberOrUndefined(entry.opacity, defaultProjectEntry.opacity),
    imageL: asString(entry.imageL, defaultProjectEntry.imageL),
    imageM: asString(entry.imageM, defaultProjectEntry.imageM),
    imageS: asString(entry.imageS, defaultProjectEntry.imageS),
  };
}

function normalizeProjectHighlightEntry(
  entry: ProjectHighlightEntryInput,
  lang: SupportedLang,
): ProjectHighlightEntry | undefined {
  const icon = firstNonEmptyString(entry.icon);
  const text = firstNonEmptyString(
    getLocalizedString(lang, "", entry.text, entry.textDe, entry.textEn),
  );

  if (!icon || !text) {
    return undefined;
  }

  return { icon, text };
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
      calculatedDuration ??
        period ??
        // istanbul ignore next -- period always resolves to a non-empty string via defaultExperienceEntry.period
        defaultExperienceEntry.duration,
    ),
    role: getLocalizedString(
      lang,
      defaultExperienceEntry.role,
      entry.role,
      entry.roleDe,
      entry.roleEn,
    ),
    company: asString(entry.company, defaultExperienceEntry.company),
    companyUrl: firstNonEmptyString(entry.companyUrl),
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
      // istanbul ignore next -- defaultAppData always provides this field
      defaultAppData.projectsSubtitle ?? "",
      data.projectsSubtitle,
      data.projectsSubtitleDe,
      data.projectsSubtitleEn,
    ),
    projectsContext: getLocalizedString(
      lang,
      // istanbul ignore next -- defaultAppData always provides this field
      defaultAppData.projectsContext ?? "",
      data.projectsContext,
      data.projectsContextDe,
      data.projectsContextEn,
    ),
    projectsHighlights:
      data.projectsHighlights
        ?.map((entry) => normalizeProjectHighlightEntry(entry, lang))
        .filter((entry): entry is ProjectHighlightEntry => Boolean(entry)) ??
      defaultAppData.projectsHighlights,
    projectDetailsContext: getLocalizedString(
      lang,
      // istanbul ignore next -- defaultAppData always provides this field
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
      // istanbul ignore next -- defaultAppData always provides this field
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
