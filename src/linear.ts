import "dotenv/config";
import { LINEAR_API_URL } from "./constants";
import type { LinearIssue, LinearUser } from "./types";

async function linearRequest<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    throw new Error("Missing LINEAR_API_KEY env var. Run with: LINEAR_API_KEY=lin_api_xxx npx tsx src/sync.ts");
  }

  const res = await fetch(LINEAR_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };

  if (json.errors?.length) {
    throw new Error(`Linear API error: ${json.errors.map((e) => e.message).join("; ")}`);
  }

  return json.data as T;
}

/** Fetch unassigned, non-closed issues in a project */
export async function getUnassignedProjectIssues(projectId: string): Promise<LinearIssue[]> {
  const data = await linearRequest<{
    project: { issues: { nodes: LinearIssue[] } } | null;
  }>(
    `query ($projectId: String!) {
      project(id: $projectId) {
        issues(
          first: 50
          filter: {
            assignee: { null: true }
            state: { type: { nin: ["completed", "canceled"] } }
          }
        ) {
          nodes {
            id
            identifier
            title
            description
            priority
            labels { nodes { name } }
          }
        }
      }
    }`,
    { projectId },
  );

  if (!data.project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  return data.project.issues.nodes;
}

/** Fetch all workspace members */
export async function getWorkspaceUsers(): Promise<LinearUser[]> {
  const data = await linearRequest<{ users: { nodes: LinearUser[] } }>(
    `{
      users(first: 50) {
        nodes { id name email }
      }
    }`,
  );
  return data.users.nodes;
}

/** Assign an issue to a user */
export async function assignIssue(issueId: string, assigneeId: string): Promise<boolean> {
  const data = await linearRequest<{ issueUpdate: { success: boolean } }>(
    `mutation ($issueId: String!, $assigneeId: String!) {
      issueUpdate(id: $issueId, input: { assigneeId: $assigneeId }) {
        success
      }
    }`,
    { issueId, assigneeId },
  );

  return data.issueUpdate.success;
}
