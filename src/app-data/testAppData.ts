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
  projectsContextDe:
    "Private End-to-End-Projekte von Konzeption und Architektur bis Deployment und Betrieb.",
  projectsContextEn:
    "Private end-to-end projects from concept and architecture to deployment and operation.",
  projectDetailsContextDe:
    "Dieses Projekt ist Teil eines privaten End-to-End-Portfolios und zeigt Verantwortung über Konzeption, Architektur, Implementierung, Deployment und Betrieb hinweg.",
  projectDetailsContextEn:
    "This project is part of a private end-to-end portfolio and reflects responsibility across conception, architecture, implementation, deployment, and operation.",
  projectsHighlights: [
    {
      icon: "phone",
      textDe: "Mobile First",
      textEn: "Mobile First",
    },
    {
      icon: "map-outline",
      textDe: "Geoinformationen",
      textEn: "Geo Data",
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
      contextDe:
        "Plattform für Bestellungen, Nutzerkonten und Bestellverwaltung.",
      contextEn: "Platform for ordering, user accounts, and order management.",
      descriptionDe:
        "Mobile und Web-App zum Bestellen von Pizza mit gemeinsamer Codebasis.",
      descriptionEn:
        "Mobile and web app for ordering pizza with a shared codebase.",
      repoUrl: "https://github.com/JohnDoe/pizza-app",
      repoVisibility: "private",
      webUrl: "https://pizza-app.example.com",
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
      contextDe:
        "Backend für Authentifizierung, Datenhaltung und Bestellabläufe.",
      contextEn:
        "Backend for authentication, persistence, and order workflows.",
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
      contextDe:
        "Konzeptstudie für Verkauf, Bewertung und Verwaltung digitaler Produkte.",
      contextEn:
        "Concept study for selling, reviewing, and managing digital products.",
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
      duration: "5Y 0M",
      roleDe: "Softwareentwickler",
      roleEn: "Software Developer",
      company: "Cool Company Ltd.",
      descriptionDe: "Entwicklung und Weiterentwicklung digitaler Produkte.",
      descriptionEn: "Built and improved digital products.",
      detailsDe: ["Verantwortung für Frontend, Backend und Deployment."],
      detailsEn: ["Responsible for frontend, backend, and deployment."],
      techstack: ["TypeScript", "React", "Docker"],
    },
    {
      periodDe: "2015 - 2020",
      periodEn: "2015 - 2020",
      duration: "5Y 0M",
      roleDe: "Softwareentwickler",
      roleEn: "Software Developer",
      company: "Rocket Science Ltd.",
      descriptionDe: "Entwicklung von Anwendungen und Backend-Systemen.",
      descriptionEn: "Developed applications and backend systems.",
      detailsDe: [
        "Umsetzung neuer Features und Betreuung bestehender Systeme.",
      ],
      detailsEn: ["Implemented new features and maintained existing systems."],
      techstack: ["C#", ".NET", "SQL"],
    },
    {
      periodDe: "2010 - 2015",
      periodEn: "2010 - 2015",
      duration: "5Y 0M",
      roleDe: "Softwareentwickler",
      roleEn: "Software Developer",
      company: "Code Fabric Ltd.",
      descriptionDe: "Umsetzung von Features und Pflege bestehender Systeme.",
      descriptionEn: "Implemented features and maintained existing systems.",
      detailsDe: ["Arbeit an internen Tools und webbasierten Fachanwendungen."],
      detailsEn: [
        "Worked on internal tools and web-based business applications.",
      ],
      techstack: ["PHP", "JavaScript", "MySQL"],
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
