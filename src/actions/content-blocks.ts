"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { canDeleteBlocks, canManageContentLibrary } from "@/lib/permissions";
import { normalizeBodyFields } from "@/lib/content-block-bodies";

export async function createContentBlockAction(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id || !canManageContentLibrary(session.user.role)) {
    throw new Error("Forbidden");
  }
  const title = String(formData.get("title") ?? "").trim();
  const bodyFields = normalizeBodyFields(formData.getAll("bodyFields").map(String));
  const body = bodyFields[0] ?? "";
  const usageGuidance = String(formData.get("usageGuidance") ?? "").trim() || null;
  const categoryId = String(formData.get("categoryId") ?? "");
  const visualTemplateId = String(formData.get("visualTemplateId") ?? "").trim() || null;
  const sensitive = formData.get("sensitive") === "on";
  const tagIds = formData.getAll("tagIds").map(String).filter(Boolean);
  if (!title || !categoryId || !visualTemplateId) redirect("/library/new?error=missing");

  const block = await prisma.contentBlock.create({
    data: {
      title,
      body,
      bodyFieldsJson: JSON.stringify(bodyFields),
      usageGuidance,
      sensitive,
      visualTemplateId,
      categoryId,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "CREATE",
    entityType: "ContentBlock",
    entityId: block.id,
    details: { title },
  });
  revalidatePath("/library");
  redirect(`/library/${block.id}/edit`);
}

export async function updateContentBlockAction(blockId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id || !canManageContentLibrary(session.user.role)) {
    throw new Error("Forbidden");
  }
  const title = String(formData.get("title") ?? "").trim();
  const bodyFields = normalizeBodyFields(formData.getAll("bodyFields").map(String));
  const body = bodyFields[0] ?? "";
  const usageGuidance = String(formData.get("usageGuidance") ?? "").trim() || null;
  const categoryId = String(formData.get("categoryId") ?? "");
  const visualTemplateId = String(formData.get("visualTemplateId") ?? "").trim() || null;
  const sensitive = formData.get("sensitive") === "on";
  const tagIds = formData.getAll("tagIds").map(String).filter(Boolean);
  if (!title || !categoryId) redirect(`/library/${blockId}/edit?error=missing`);

  await prisma.contentBlockTag.deleteMany({ where: { blockId } });
  await prisma.contentBlock.update({
    where: { id: blockId },
    data: {
      title,
      body,
      bodyFieldsJson: JSON.stringify(bodyFields),
      usageGuidance,
      sensitive,
      visualTemplateId,
      categoryId,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "ContentBlock",
    entityId: blockId,
    details: { title },
  });
  revalidatePath("/library");
  revalidatePath(`/library/${blockId}/edit`);
  redirect(`/library/${blockId}/edit?saved=1`);
}

export async function deleteContentBlockAction(blockId: string, ...args: unknown[]) {
  void args;
  const session = await getSession();
  if (!session?.user?.id || !canDeleteBlocks(session.user.role)) {
    throw new Error("Forbidden");
  }
  const [templateRefCount, proposalRefCount] = await Promise.all([
    prisma.templateSection.count({ where: { defaultBlockId: blockId } }),
    prisma.proposalSection.count({ where: { contentBlockId: blockId } }),
  ]);

  await prisma.$transaction([
    // Remove template references so FK constraints pass.
    prisma.templateSection.updateMany({
      where: { defaultBlockId: blockId },
      data: { defaultBlockId: null },
    }),
    // Remove proposal sections that reference this block.
    prisma.proposalSection.deleteMany({
      where: { contentBlockId: blockId },
    }),
    prisma.contentBlock.delete({ where: { id: blockId } }),
  ]);
  await writeAuditLog({
    userId: session.user.id,
    action: "DELETE",
    entityType: "ContentBlock",
    entityId: blockId,
    details: { templateRefCount, proposalRefCount },
  });
  revalidatePath("/library");
  revalidatePath("/templates");
  revalidatePath("/proposals");
  redirect("/library");
}
