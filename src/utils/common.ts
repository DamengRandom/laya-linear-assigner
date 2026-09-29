import { type EngineerProfile, type EngineerName, ENGINEERS } from "../constants";

export function serializeEngineer(profile: EngineerProfile): string {
  const parts = [
    `${profile.name} (${profile.position}).`,
    `Key Skills: ${profile.skills.join("、")}.`,
    `Domain areas: ${profile.domains.join("、")}.`,
    `Core Strengths: ${profile.strengths.join(";")}.`,
    `Boundaries: ${profile.boundaries.join(";")}.`,
  ];

  if (profile.priority) parts.push(`Priority Rule: ${profile.priority}`);

  return parts.join(" ");
}

export function deserializeEngineer(): Record<EngineerName, string> {
  return Object.fromEntries(Object.entries(ENGINEERS).map(([id, profile]) => [id, serializeEngineer(profile)]));
}
