import { readFileSync } from "node:fs";
import path from "node:path";
import de from "../../../src/i18n/de.json";
import en from "../../../src/i18n/en.json";

const appDataExample = JSON.parse(
  readFileSync(path.resolve(process.cwd(), "app-data.example.json"), "utf8"),
) as {
  profile: {
    name: string;
    titleDe: string;
    titleEn: string;
    descriptionDe: string[];
    descriptionEn: string[];
  };
  techStack: {
    primary: string[];
    secondary: string[];
  };
  projectsSubtitleDe?: string;
  projectsSubtitleEn?: string;
  projectsContextDe?: string;
  projectsContextEn?: string;
  projectDetailsContextDe?: string;
  projectDetailsContextEn?: string;
  projectsHighlights: { textDe: string; textEn: string }[];
  projects: {
    titleDe: string;
    titleEn: string;
    subtitleDe?: string;
    subtitleEn?: string;
    contextDe?: string;
    contextEn?: string;
    descriptionDe?: string;
    descriptionEn?: string;
    webUrl?: string;
    playStoreUrl?: string;
    techstack?: string[];
  }[];
  experienceSubtitleDe?: string;
  experienceSubtitleEn?: string;
  experience: {
    company: string;
    roleDe: string;
    roleEn: string;
    descriptionDe: string;
    descriptionEn: string;
    detailsDe?: string[];
    detailsEn?: string[];
    techstack?: string[];
  }[];
  contact: {
    email: string;
    addressCountry: string;
    addressStreet: string;
    addressZipCode: string;
    addressCity: string;
  };
};

function buildExampleAppData(lang: "de" | "en") {
  const isGerman = lang === "de";
  const common = isGerman ? de.common : en.common;

  return {
    profile: {
      name: appDataExample.profile.name,
      title: (isGerman
        ? appDataExample.profile.titleDe
        : appDataExample.profile.titleEn
      ).toUpperCase(),
      description: isGerman
        ? appDataExample.profile.descriptionDe
        : appDataExample.profile.descriptionEn,
      primaryTechStack: appDataExample.techStack.primary,
      secondaryTechStack: appDataExample.techStack.secondary,
    },
    experience: {
      title: common.screenTitleExperience,
      subtitle: (isGerman
        ? (appDataExample.experienceSubtitleDe ?? "")
        : (appDataExample.experienceSubtitleEn ?? "")
      ).toUpperCase(),
      items: appDataExample.experience.map((entry) => ({
        company: entry.company,
        role: isGerman ? entry.roleDe : entry.roleEn,
        description: isGerman ? entry.descriptionDe : entry.descriptionEn,
      })),
      firstCompany: appDataExample.experience[0].company,
      firstRole: isGerman
        ? appDataExample.experience[0].roleDe
        : appDataExample.experience[0].roleEn,
      firstDescription: isGerman
        ? appDataExample.experience[0].descriptionDe
        : appDataExample.experience[0].descriptionEn,
      firstDetail:
        (isGerman
          ? appDataExample.experience[0].detailsDe?.[0]
          : appDataExample.experience[0].detailsEn?.[0]) ?? "",
      firstTech: appDataExample.experience[0].techstack?.[0] ?? "",
      showDetails: common.actionShowDetails,
      hideDetails: common.actionHideDetails,
      footerAction: common.actionShowMore,
    },
    projects: {
      title: common.screenTitleProjects,
      subtitle: (isGerman
        ? (appDataExample.projectsSubtitleDe ?? "")
        : (appDataExample.projectsSubtitleEn ?? "")
      ).toUpperCase(),
      context: isGerman
        ? (appDataExample.projectsContextDe ?? "")
        : (appDataExample.projectsContextEn ?? ""),
      highlights: appDataExample.projectsHighlights.map((entry) =>
        isGerman ? entry.textDe : entry.textEn,
      ),
      items: appDataExample.projects.map((entry) => ({
        title: isGerman ? entry.titleDe : entry.titleEn,
        subtitle: isGerman
          ? (entry.subtitleDe ?? "")
          : (entry.subtitleEn ?? ""),
        context: isGerman ? (entry.contextDe ?? "") : (entry.contextEn ?? ""),
        description: isGerman
          ? (entry.descriptionDe ?? "")
          : (entry.descriptionEn ?? ""),
        webUrl: entry.webUrl ?? "",
        playStoreUrl: entry.playStoreUrl ?? "",
        techstack: entry.techstack ?? [],
      })),
      footerAction: common.actionShowMore,
    },
    contact: {
      title: common.screenTitleContact,
      subtitle: common.contactSubtitle.toUpperCase(),
      name: appDataExample.profile.name,
      street: appDataExample.contact.addressStreet,
      city: `${appDataExample.contact.addressZipCode} ${appDataExample.contact.addressCity}`,
      country: appDataExample.contact.addressCountry,
      email: appDataExample.contact.email,
      actions: [
        common.actionGithub,
        common.actionLinkedin,
        common.actionXing,
        common.actionPhoneCall,
        common.actionEmail,
      ],
    },
    menu: {
      title: common.screenTitleMenuWithoutDots,
      theme: common.settingsTheme,
      legal: common.wordLegal,
      disclaimer: common.screenTitleDisclaimer,
      privacy: common.screenTitlePrivacy,
      terms: common.screenTitleTerms,
      licenses: common.screenTitleLicenses,
      themeSystemLabel: `${common.settingsTheme}: ${common.catalogThemeSystem}`,
      themeLightLabel: `${common.settingsTheme}: ${common.catalogThemeLight}`,
      themeDarkLabel: `${common.settingsTheme}: ${common.catalogThemeDark}`,
    },
    projectDetails: {
      context: isGerman
        ? (appDataExample.projectDetailsContextDe ?? "")
        : (appDataExample.projectDetailsContextEn ?? ""),
      firstProject: {
        title: isGerman
          ? appDataExample.projects[0].titleDe
          : appDataExample.projects[0].titleEn,
        subtitle: isGerman
          ? (appDataExample.projects[0].subtitleDe ?? "")
          : (appDataExample.projects[0].subtitleEn ?? ""),
        context: isGerman
          ? (appDataExample.projects[0].contextDe ?? "")
          : (appDataExample.projects[0].contextEn ?? ""),
        description: isGerman
          ? (appDataExample.projects[0].descriptionDe ?? "")
          : (appDataExample.projects[0].descriptionEn ?? ""),
        webUrl: appDataExample.projects[0].webUrl ?? "",
        playStoreUrl: appDataExample.projects[0].playStoreUrl ?? "",
        techstack: appDataExample.projects[0].techstack ?? [],
      },
      technologiesTitle: common.titleProjectTechstack,
      privateRepoTitle: common.titlePrivateRepo,
      privateRepoHint: common.infoPrivateRepoHint,
      privateRepoBody: common.infoPrivateRepoBody,
      continueToPage: common.actionContinueToPage,
      emailAction: common.actionEmail,
      githubAction: common.actionGithub,
      webAppAction: common.actionWebApp,
      playStoreAction: common.actionPlayStore,
      closeAction: common.actionClose,
    },
  } as const;
}

export const exampleAppDataEn = buildExampleAppData("en");
export const exampleAppDataDe = buildExampleAppData("de");

export const exampleAppData = exampleAppDataEn;
