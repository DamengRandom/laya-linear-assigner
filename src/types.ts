// Linear priority number → text (engineer profiles have rules like "Urgent tasks will be top candidates")
export const PRIORITY_NAMES: Record<number, string> = {
  0: "No priority",
  1: "Urgent",
  2: "High",
  3: "Normal",
  4: "Low",
};

export type CliOptions = {
  ids?: string[];
  limit?: number;
  batch?: number;
  yes: boolean;
};

export type LinearIssue = {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  priority: number;
  labels: { nodes: { name: string }[] };
};

export type LinearUser = {
  id: string;
  name: string;
  email: string;
};
