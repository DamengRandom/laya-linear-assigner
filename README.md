# Laya Linear Assignment

Auto-assign Linear tickets to the best-suited engineer, decided by a local LLM ([Laya](https://www.npmjs.com/package/@receptron/laya)) — no cloud AI, everything runs on your machine.

## How it works

```
Linear (unassigned issues in project)
        │
        ▼
Laya local model  ◄── engineer profiles (skills / domains / strengths / priority rules)
        │
        ▼
best candidate → auto-assigned back to Linear
```

## Prerequisites

- Node.js 18+
- A Linear Personal API key:
  Linear → Settings → Security & access → Personal API keys → Create key

## Setup

```bash
npm install
cp .env.example .env
```

Then edit `.env` and fill in your values:

```bash
LINEAR_API_KEY=lin_api_xxx          # your Linear personal API key
PROJECT_ID=ce092ac3-eebf-...        # ID of the Linear project to process
```

> Note: the first run downloads ~1.7GB of model weights. Later runs use the local cache.

## Usage

```bash
npx tsx src/sync.ts
```

By default this processes **all unassigned, open issues** in the project (the Linear API filters server-side, so there is no full scan).

### CLI options

| Option         | Example             | Description                                                      |
| -------------- | ------------------- | ---------------------------------------------------------------- |
| `--ids`        | `--ids DAM-7,DAM-8` | Only process these tickets (great for picking specific ones)     |
| `--limit`      | `--limit 5`         | Only process the first N unassigned tickets                      |
| `--batch`      | `--batch 10`        | Process in batches of N, asking for confirmation between batches |
| `--yes` / `-y` | `--batch 10 -y`     | Auto-confirm between batches (full auto)                         |

Examples:

```bash
# Assign a couple of specific tickets
npx tsx src/sync.ts --ids DAM-7,DAM-8

# Process everything in batches of 10, confirm before each next batch
npx tsx src/sync.ts --batch 10

# Fully automatic, batches of 10 (10, 20, 30 ... until done)
npx tsx src/sync.ts --batch 10 --yes
```

For each issue, the script will:

1. Send the issue title, description, labels and priority to the Laya model
2. Pick the best engineer from the profiles in `src/constants.ts`
3. Assign the issue to that person in Linear

Example output:

```
[DAM-6] Discover how to make a UI for this laya ticket assignment decision maker
  → assigned to Dameng (confidence: 34.6%) ✓
```

## Configure engineers

Edit [`src/constants.ts`](src/constants.ts). Each profile describes one engineer:

```ts
export const ENGINEERS = {
  mundo: {
    name: "Mundo",
    position: "Software Engineer",
    skills: ["JavaScript", "TypeScript", "React"],
    domains: ["Payment Service"],
    strengths: ["Frontend Development"],
    boundaries: ["Engineer is not good at multi-tasking"],
    priority: "Frontend tasks will be top candidates to consider",
  },
  // ...
};
```

**Important:** the `name` of each profile must match a member name in your Linear workspace (case-insensitive). If a name doesn't match any Linear member, the script prints a recommendation but skips the assignment.

To target a different project, change `PROJECT_ID` in your `.env`.

## Project structure

| File                     | Purpose                                               |
| ------------------------ | ----------------------------------------------------- |
| `src/sync.ts`            | Main entry: fetch issues → decide → assign            |
| `src/linear.ts`          | Linear GraphQL client (issues, members, assignment)   |
| `src/taskDistributor.ts` | Asks Laya which engineer fits a task                  |
| `src/constants.ts`       | Engineer profiles                                     |
| `src/localTest.ts`       | Quick local test of `routeTask`                       |
| `decision.ts`            | Laya demo (department / urgency / churn-risk example) |

## Notes

- Safe to re-run: only unassigned and non-completed/canceled issues are processed
- `.env` is gitignored — keep real keys out of version control
