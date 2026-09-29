import { Laya } from "@receptron/laya";
import type { TaskType } from "./constants";
import { deserializeEngineer } from "./utils/common";

// Load the model once and reuse it across all tasks (reloading per task is very slow)
let layaPromise: Promise<Laya> | null = null;

function getLaya(): Promise<Laya> {
  if (!layaPromise) {
    layaPromise = Laya.load();
  }

  return layaPromise;
}

export default async function routeTask({ name, description, labels = [] }: TaskType) {
  const laya = await getLaya();

  const result = await laya.systemOne(
    { name, description, labels },
    {
      assignee: { type: "choice", instructions: "Please select the most suitable engineer to assign this task to.", criteria: deserializeEngineer() },
    },
  );

  return result.answers.assignee;
}
