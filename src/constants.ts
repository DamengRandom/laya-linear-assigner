export type EngineerProfile = {
  name: string;
  position: string;
  skills: string[];
  domains: string[];
  strengths: string[];
  boundaries: string[];
  priority?: string;
};

export type EngineerName = EngineerProfile["name"];

export const LINEAR_API_URL = "https://api.linear.app/graphql";

export const ENGINEERS = {
  mundo: {
    name: "Mundo",
    position: "Software Engineer",
    skills: ["JavaScript", "TypeScript", "React", "VueJS", "tRPC"],
    domains: ["Payment Service", "Subscription Service", "Order Service", "Compliant Service"],
    strengths: ["Frontend Development", "Component Design", "CSS styling determinations"],
    boundaries: ["Engineer is not good at multi-tasking"],
    priority: "Frontend tasks will be top candidates to consider",
  },
  wu: {
    name: "Wu",
    position: "Senior Backend Engineer",
    skills: ["TypeORM", "TypeScript", "PostgresSQL", "SQL", "Node.js", "Temporal", "Docker"],
    domains: ["Animal Service", "Subscription Service", "Pricing Service", "Courier Service", "Orchestration Service"],
    strengths: ["Backend Development", "Component Design", "CSS styling determinations"],
    boundaries: ["Engineer is not good at multi-tasking"],
    priority: "Backend tasks will be top candidates to consider",
  },
  dameng: {
    name: "Dameng",
    position: "Staff Frontend Engineer",
    skills: ["JavaScript", "TypeScript", "React", "VueJS", "Angular", "tRPC", "CSS", "Vite", "NuxtJS", "Storybook"],
    domains: ["Subscription Service", "Order Service"],
    strengths: ["Frontend System Design", "Component Design", "Work Coordination", "UI Library Design", "E2E testings", "Performance Optimization"],
    boundaries: ["Engineer is not good at domain knowledge heavily relied tasks"],
    priority: "Urgent (with deadline) tasks will be top candidates to consider",
  },
  damonaws: {
    name: "Damonaws",
    position: "Senior Backend Engineer",
    skills: ["TypeORM", "TypeScript", "PostgresSQL", "SQL", "Node.js", "MySQL", "Redis"],
    domains: ["Payment Service", "Auth Service", "CDC Service", "Migration Service", "Orchestration Service"],
    strengths: ["Backend Development", "Legacy System Migrations", "User Accounts Management"],
    boundaries: ["Engineer is not good at frontend tasks"],
    priority: "Legacy system migration related tasks will be top candidates to consider",
  },
};

export type TaskType = {
  name: string;
  description: string;
  labels?: string[];
};
