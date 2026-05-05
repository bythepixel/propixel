"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { canManageContentLibrary } from "@/lib/permissions";
import { detectBodyFieldCount } from "@/lib/block-visual-template-tokens";

export async function createBlockVisualTemplateAction(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id || !canManageContentLibrary(session.user.role)) {
    throw new Error("Forbidden");
  }
  const name = String(formData.get("name") ?? "").trim();
  const html = String(formData.get("html") ?? "");
  const css = String(formData.get("css") ?? "");
  const js = String(formData.get("js") ?? "");
  const bodyFieldCount = detectBodyFieldCount(html);
  if (!name || !html) redirect("/block-visual-templates/new?error=missing");

  const created = await prisma.blockVisualTemplate.create({
    data: { name, html, css, js, bodyFieldCount },
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "CREATE",
    entityType: "BlockVisualTemplate",
    entityId: created.id,
    details: { name },
  });
  revalidatePath("/block-visual-templates");
  redirect(`/block-visual-templates/${created.id}`);
}

export async function updateBlockVisualTemplateAction(templateId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id || !canManageContentLibrary(session.user.role)) {
    throw new Error("Forbidden");
  }
  const name = String(formData.get("name") ?? "").trim();
  const html = String(formData.get("html") ?? "");
  const css = String(formData.get("css") ?? "");
  const js = String(formData.get("js") ?? "");
  const bodyFieldCount = detectBodyFieldCount(html);
  if (!name || !html) redirect(`/block-visual-templates/${templateId}?error=missing`);

  await prisma.blockVisualTemplate.update({
    where: { id: templateId },
    data: { name, html, css, js, bodyFieldCount },
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "BlockVisualTemplate",
    entityId: templateId,
    details: { name },
  });
  revalidatePath("/block-visual-templates");
  revalidatePath(`/block-visual-templates/${templateId}`);
}
