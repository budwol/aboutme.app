export type SupportedLang = "de" | "en";

export type RepoVisibility = "private" | "public";

export type ProjectHighlightEntry = {
  icon: string;
  text: string;
};

export type ExperienceEntry = {
  period: string;
  duration: string;
  role: string;
  company: string;
  companyUrl?: string;
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
  repoVisibility?: RepoVisibility;
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
  projectsHighlights: ProjectHighlightEntry[];
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

export type ProfileInput = Partial<AppData["profile"]> & {
  titleDe?: string;
  titleEn?: string;
  descriptionDe?: string | string[];
  descriptionEn?: string | string[];
};

export type ProjectEntryInput = Partial<ProjectEntry> & {
  titleDe?: string;
  titleEn?: string;
  subtitleDe?: string;
  subtitleEn?: string;
  contextDe?: string;
  contextEn?: string;
  descriptionDe?: string;
  descriptionEn?: string;
};

export type ExperienceEntryInput = Partial<ExperienceEntry> & {
  periodDe?: string;
  periodEn?: string;
  roleDe?: string;
  roleEn?: string;
  companyUrl?: string;
  descriptionDe?: string;
  descriptionEn?: string;
  detailsDe?: string[];
  detailsEn?: string[];
};

export type ProjectHighlightEntryInput = Partial<ProjectHighlightEntry> & {
  textDe?: string;
  textEn?: string;
};

export type AppDataInput = Partial<AppData> & {
  profile?: ProfileInput;
  techStack?: Partial<AppData["techStack"]>;
  contact?: Partial<AppData["contact"]>;
  projectsSubtitleDe?: string;
  projectsSubtitleEn?: string;
  projectsContextDe?: string;
  projectsContextEn?: string;
  projectDetailsContextDe?: string;
  projectDetailsContextEn?: string;
  projectsHighlights?: ProjectHighlightEntryInput[];
  projects?: ProjectEntryInput[];
  experienceSubtitleDe?: string;
  experienceSubtitleEn?: string;
  experience?: ExperienceEntryInput[];
};
