import "dotenv/config";
import readline from "node:readline/promises";
import routeTask from "./taskDistributor";
import { ENGINEERS } from "./constants";
import { getUnassignedProjectIssues, getWorkspaceUsers, assignIssue } from "./linear";
import { CliOptions, PRIORITY_NAMES } from "./types";

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { yes: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    switch (arg) {
      case "--ids":
        opts.ids = argv[++i]
          ?.split(",")
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean);
        break;
      case "--limit":
        opts.limit = Number(argv[++i]);
        if (!opts.limit || opts.limit < 1) throw new Error(`Invalid --limit value: ${argv[i]}`);
        break;
      case "--batch":
        opts.batch = Number(argv[++i]);
        if (!opts.batch || opts.batch < 1) throw new Error(`Invalid --batch value: ${argv[i]}`);
        break;
      case "--yes":
      case "-y":
        opts.yes = true;
        break;
      default:
        throw new Error(`Unknown option: ${arg}\nUsage: npx tsx src/sync.ts [--ids DAM-1,DAM-2] [--limit N] [--batch N] [--yes]`);
    }
  }

  return opts;
}

async function confirm(question: string, autoYes: boolean): Promise<boolean> {
  if (autoYes) return true;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question(question)).trim().toLowerCase();

  rl.close();

  return answer === "" || answer === "y" || answer === "yes";
}

async function processIssue(
  issue: { id: string; identifier: string; title: string; description: string | null; priority: number; labels: { nodes: { name: string }[] } },
  userByName: Map<string, string>,
) {
  console.log(`\n[${issue.identifier}] ${issue.title}`);

  const answer = await routeTask({
    name: issue.title,
    description: [issue.description ?? "", `Priority: ${PRIORITY_NAMES[issue.priority] ?? "Normal"}`].filter(Boolean).join("\n"),
    labels: issue.labels.nodes.map((l) => l.name),
  });

  const engineerKey = answer.choice as keyof typeof ENGINEERS;
  const engineer = ENGINEERS[engineerKey];

  if (!engineer) {
    console.log(`  Laya chose "${String(engineerKey)}", but no engineer profile found. Skipping.`);
    return;
  }

  const topProb = answer.probabilities?.[engineerKey];
  const confidence = topProb != null ? ` (confidence: ${(topProb * 100).toFixed(1)}%)` : "";

  const userId = userByName.get(engineer.name.toLowerCase());

  if (!userId) {
    console.log(`  Recommended ${engineer.name}${confidence}, but no Linear user found. Skipping.`);
    return;
  }

  const ok = await assignIssue(issue.id, userId);
  console.log(`  → Assigned to ${engineer.name}${confidence} ${ok ? "✓" : "✗ (Linear update failed)"}`);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  let issues = await getUnassignedProjectIssues(process.env.PROJECT_ID!);

  // Targeted selection: only the given ticket identifiers
  if (opts.ids) {
    issues = issues.filter((issue) => opts.ids!.includes(issue.identifier.toUpperCase()));
    const found = new Set(issues.map((i) => i.identifier.toUpperCase()));
    const missing = opts.ids.filter((id) => !found.has(id));
    if (missing.length > 0) {
      console.log(`Note: not found / already assigned: ${missing.join(", ")}`);
    }
  }

  // Cap the number of tickets to process
  if (opts.limit) {
    issues = issues.slice(0, opts.limit);
  }

  if (issues.length === 0) {
    console.log("No unassigned open issues matched. Nothing to do.");
    return;
  }

  console.log(`${issues.length} unassigned issue(s) to process${opts.batch ? ` in batches of ${opts.batch}` : ""}.`);

  // engineer profile name → Linear user id (case-insensitive)
  const users = await getWorkspaceUsers();
  const userByName = new Map(users.map((u) => [u.name.toLowerCase(), u.id]));

  const batchSize = opts.batch ?? issues.length;

  for (let start = 0; start < issues.length; start += batchSize) {
    const batch = issues.slice(start, start + batchSize);
    const batchNo = Math.floor(start / batchSize) + 1;
    if (opts.batch) {
      console.log(`\n=== Batch ${batchNo}: tickets ${start + 1}–${start + batch.length} of ${issues.length} ===`);
    }

    for (const issue of batch) {
      await processIssue(issue, userByName);
    }

    const hasMore = start + batchSize < issues.length;
    if (hasMore && !(await confirm(`\nContinue with the next batch of ${batchSize}? [Y/n] `, opts.yes))) {
      console.log("Stopped by user.");
      break;
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
