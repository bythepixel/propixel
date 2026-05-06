"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { canManageTemplates } from "@/lib/permissions";

export async function createVisualTemplateAction(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id || !canManageTemplates(session.user.role)) {
    throw new Error("Forbidden");
  }
  const name = String(formData.get("name") ?? "").trim();
  const html = String(formData.get("html") ?? "");
  const css = String(formData.get("css") ?? "");
  const js = String(formData.get("js") ?? "");
  if (!name || !html) redirect("/visual-templates/new?error=missing");

  const visualTemplate = await prisma.visualTemplate.create({
    data: { name, html, css, js },
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "CREATE",
    entityType: "VisualTemplate",
    entityId: visualTemplate.id,
    details: { name },
  });
  revalidatePath("/visual-templates");
  redirect(`/visual-templates/${visualTemplate.id}`);
}

export async function updateVisualTemplateAction(visualTemplateId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id || !canManageTemplates(session.user.role)) {
    throw new Error("Forbidden");
  }
  const name = String(formData.get("name") ?? "").trim();
  const html = String(formData.get("html") ?? "");
  const css = String(formData.get("css") ?? "");
  const js = String(formData.get("js") ?? "");
  if (!name || !html) redirect(`/visual-templates/${visualTemplateId}?error=missing`);

  await prisma.visualTemplate.update({
    where: { id: visualTemplateId },
    data: { name, html, css, js },
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "VisualTemplate",
    entityId: visualTemplateId,
    details: { name },
  });
  revalidatePath("/visual-templates");
  revalidatePath(`/visual-templates/${visualTemplateId}`);
  redirect(`/visual-templates/${visualTemplateId}?saved=1`);
}
