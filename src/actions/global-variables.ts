"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { canManageContentLibrary } from "@/lib/permissions";

export async function upsertGlobalVariableAction(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id || !canManageContentLibrary(session.user.role)) {
    throw new Error("Forbidden");
  }
  const name = String(formData.get("name") ?? "").trim();
  const value = String(formData.get("value") ?? "");
  const variableId = String(formData.get("variableId") ?? "").trim();
  if (!name) return;

  if (variableId) {
    await prisma.globalVariable.update({
      where: { id: variableId },
      data: { name, value },
    });
  } else {
    await prisma.globalVariable.upsert({
      where: { name },
      update: { value },
      create: { name, value },
    });
  }

  await writeAuditLog({
    userId: session.user.id,
    action: "UPSERT_GLOBAL_VARIABLE",
    entityType: "GlobalVariable",
    entityId: variableId || name,
    details: { name },
  });
  revalidatePath("/global-variables");
  revalidatePath("/proposals");
}

export async function deleteGlobalVariableAction(variableId: string, ...args: unknown[]) {
  void args;
  const session = await getSession();
  if (!session?.user?.id || !canManageContentLibrary(session.user.role)) {
    throw new Error("Forbidden");
  }
  await prisma.globalVariable.delete({ where: { id: variableId } });
  await writeAuditLog({
    userId: session.user.id,
    action: "DELETE_GLOBAL_VARIABLE",
    entityType: "GlobalVariable",
    entityId: variableId,
    details: {},
  });
  revalidatePath("/global-variables");
  revalidatePath("/proposals");
}
