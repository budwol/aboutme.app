import { AppData } from "@/app-data/types";

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
  projectsHighlights: [],
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
      repoVisibility: "public",
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
