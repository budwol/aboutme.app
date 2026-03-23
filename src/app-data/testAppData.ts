import { AppData, normalizeAppData } from "@/app-data";

const exampleAppDataInput = {
  siteUrl: "https://my.portfolio.org",
  profile: {
    name: "John Doe",
    titleDe: "Softwareentwickler",
    titleEn: "Software Engineer",
    avatar: "default_avatar.webp",
    descriptionDe: [
      "Hallo, ich bin John Doe.",
      "Ich schreibe gerne sauberen Code.",
      "Ich baue Produkte, die wirklich genutzt werden.",
    ],
    descriptionEn: [
      "Hi, I'm John Doe.",
      "I enjoy writing clean code.",
      "I build products people actually use.",
    ],
  },
  techStack: {
    primary: ["PHP", "Basic"],
    secondary: ["Perl", "Java"],
  },
  projectsHighlights: [
    {
      icon: "phone",
      textDe: "Mobile First",
      textEn: "Mobile First",
    },
    {
      icon: "map-outline",
      textDe: "Geodaten",
      textEn: "Geospatial Data",
    },
  ],
  projectsSubtitleDe: "Einige private Nebenprojekte",
  projectsSubtitleEn: "Some private side projects",
  projects: [
    {
      titleDe: "Pizza-App",
      titleEn: "Pizza App",
      subtitleDe: "Bestell-App",
      subtitleEn: "Ordering App",
      descriptionDe:
        "Mobile und Web-App zum Bestellen von Pizza mit gemeinsamer Codebasis.",
      descriptionEn:
        "Mobile and web app for ordering pizza with a shared codebase.",
      repoUrl: "https://github.com/JohnDoe/pizza-app",
      repoVisibility: "private",
      techstack: ["Flutter", "Dart", "Firebase"],
      imageL: "default_project.webp",
      imageM: "default_project.webp",
      imageS: "default_project.webp",
    },
    {
      titleDe: "API",
      titleEn: "API",
      subtitleDe: "Containerisierte Backend-API",
      subtitleEn: "Containerized Backend API",
      descriptionDe:
        "REST-API für Authentifizierung, Produktdaten und Bestellprozesse.",
      descriptionEn:
        "REST API for authentication, product data, and order workflows.",
      repoUrl: "https://github.com/JohnDoe/backend-api",
      repoVisibility: "private",
      techstack: ["C#", "ASP.NET Core", ".NET 9", "Docker"],
      imageL: "default_project.webp",
      imageM: "default_project.webp",
      imageS: "default_project.webp",
    },
    {
      titleDe: "E-Commerce-Plattform",
      titleEn: "E-Commerce Platform",
      subtitleDe: "Shop für Code-Snippets",
      subtitleEn: "Store for Code Snippets",
      descriptionDe:
        "Konzept für eine Plattform zum Kaufen, Verkaufen und Bewerten von Code-Snippets.",
      descriptionEn:
        "Concept for a platform to buy, sell, and review code snippets.",
      repoUrl: "https://github.com/JohnDoe/code-snippet-store",
      repoVisibility: "private",
      techstack: ["Python", "React", "PostgreSQL"],
      imageL: "default_project.webp",
      imageM: "default_project.webp",
      imageS: "default_project.webp",
    },
  ],
  experienceSubtitleDe: "Beruflicher Werdegang",
  experienceSubtitleEn: "My career path",
  experience: [
    {
      periodDe: "seit 2020",
      periodEn: "since 2020",
      roleDe: "Softwareentwickler",
      roleEn: "Software Developer",
      company: "Cool Company Ltd.",
      descriptionDe: "Entwicklung und Weiterentwicklung digitaler Produkte.",
      descriptionEn: "Built and improved digital products.",
    },
    {
      periodDe: "2015 - 2020",
      periodEn: "2015 - 2020",
      roleDe: "Softwareentwickler",
      roleEn: "Software Developer",
      company: "Rocket Science Ltd.",
      descriptionDe: "Entwicklung von Anwendungen und Backend-Systemen.",
      descriptionEn: "Developed applications and backend systems.",
    },
    {
      periodDe: "2010 - 2015",
      periodEn: "2010 - 2015",
      roleDe: "Softwareentwickler",
      roleEn: "Software Developer",
      company: "Code Fabric Ltd.",
      descriptionDe: "Umsetzung von Features und Pflege bestehender Systeme.",
      descriptionEn: "Implemented features and maintained existing systems.",
    },
  ],
  contact: {
    phone: "+491631737743",
    email: "tough.camel.mcew@hidingmail.com",
    addressCountry: "Deutschland",
    addressStreet: "Straße 1",
    addressZipCode: "01234",
    addressCity: "Berlin",
    github: "https://github.com/JohnDoe",
    xing: "https://xing.com/JohnDoe",
    linkedin: "https://linkedin.com/JohnDoe",
  },
} as const;

export const testAppData: AppData = normalizeAppData(exampleAppDataInput, "en");
