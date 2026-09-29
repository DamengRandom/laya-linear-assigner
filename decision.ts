import { Laya } from "@receptron/laya";

let layaPromise: Promise<Laya> | null = null;

export function getLaya(): Promise<Laya> {
  if (!layaPromise) {
    layaPromise = Laya.load();
  }

  return layaPromise;
}

async function main() {
  // Load the model (first run downloads ~1.7GB weights, then uses cache)
  // const laya = await Laya.load({
  //   subfolder: "multilingual",
  // });

  const laya = await getLaya();

  // 1. State: can be text, an email, a ticket, or a JSON object
  const state = {
    subject: "Duplicate charge",
    body: "We were billed twice for March. Please refund the duplicate today or we will cancel.",
  };

  // 2. Define typed questions
  const questions = {
    department: {
      type: "choice" as const,
      instructions: "Which team should handle this request?",
      criteria: {
        billing: "invoices, payments, refunds",
        technical: "bugs, outages, system errors",
        sales: "pricing, new contracts",
      },
    },
    urgency: {
      type: "score" as const,
      instructions: "How urgent is this request?",
      criteria: ["not urgent", "soon", "critical deadline or blocking issue"],
    },
    churn_risk: {
      type: "noul" as const,
      instructions: "Does the user threaten to cancel or leave?",
    },
  };

  // 3. Run the decision
  const result = await laya.systemOne(state, questions);

  // 4. Read the results (types are inferred automatically by TypeScript)
  console.log("部门:", result.answers.department.choice);
  console.log("部门概率:", result.answers.department.probabilities);
  console.log("紧急程度:", result.answers.urgency.score);
  console.log("流失风险:", result.answers.churn_risk.noul);

  // 5. Release resources
  await laya.close();
}

if (process.argv[1]?.endsWith("decision.ts")) {
  main().catch(console.error);
}

// How to run: npx ts-node decision.ts
