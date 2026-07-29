"use server";

import { revalidatePath } from "next/cache";

import {
  addPersonalMissionTask,
  regenerateTodayMission,
  reorderMissionTask,
  setMissionTaskCompleted,
  setMissionTaskSkipped,
} from "@/lib/mission";
import {
  personalTaskSchema,
  regenerateMissionSchema,
  taskCompletionSchema,
  taskReorderSchema,
  taskSkipSchema,
} from "@/lib/validations/mission";

export async function toggleMissionTaskAction(input: unknown) {
  const data = taskCompletionSchema.parse(input);
  await setMissionTaskCompleted(data.taskId, data.completed);
  revalidatePath("/");
}

export async function skipMissionTaskAction(input: unknown) {
  const data = taskSkipSchema.parse(input);
  await setMissionTaskSkipped(data.taskId, data.skipped);
  revalidatePath("/");
}

export async function reorderMissionTaskAction(input: unknown) {
  const data = taskReorderSchema.parse(input);
  await reorderMissionTask(data.taskId, data.direction);
  revalidatePath("/");
}

export async function addPersonalMissionTaskAction(input: unknown) {
  const data = personalTaskSchema.parse(input);
  await addPersonalMissionTask(data);
  revalidatePath("/");
}

export async function regenerateTodayMissionAction(input: unknown) {
  const data = regenerateMissionSchema.parse(input);
  await regenerateTodayMission(data.availableMinutes);
  revalidatePath("/");
}
