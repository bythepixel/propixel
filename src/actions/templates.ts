"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { canManageTemplates } from "@/lib/permissions";

export async function createTemplateAction(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id || !canManageTemplates(session.user.role)) {
    throw new Error("Forbidden");
  }
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const visualTemplateId = String(formData.get("visualTemplateId") ?? "").trim() || null;
  if (!name) redirect("/templates/new?error=missing");

  const tpl = await prisma.template.create({
    data: { name, description, visualTemplateId },
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "CREATE",
    entityType: "Template",
    entityId: tpl.id,
    details: { name },
  });
  revalidatePath("/templates");
  redirect(`/templates/${tpl.id}`);
}

export async function updateTemplateMetaAction(templateId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id || !canManageTemplates(session.user.role)) {
    throw new Error("Forbidden");
  }
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const visualTemplateId = String(formData.get("visualTemplateId") ?? "").trim() || null;
  if (!name) redirect(`/templates/${templateId}?error=missing`);

  await prisma.template.update({
    where: { id: templateId },
    data: { name, description, visualTemplateId },
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "Template",
    entityId: templateId,
    details: { name },
  });
  revalidatePath("/templates");
  revalidatePath(`/templates/${templateId}`);
}

export async function addTemplateSectionAction(templateId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id || !canManageTemplates(session.user.role)) {
    throw new Error("Forbidden");
  }
  const sectionTitle = String(formData.get("sectionTitle") ?? "").trim();
  const defaultBlockId = String(formData.get("defaultBlockId") ?? "").trim() || null;
  if (!sectionTitle) redirect(`/templates/${templateId}?error=section`);

  const max = await prisma.templateSection.aggregate({
    where: { templateId },
    _max: { order: true },
  });
  const order = (max._max.order ?? -1) + 1;

  await prisma.templateSection.create({
    data: {
      templateId,
      order,
      sectionTitle,
      defaultBlockId: defaultBlockId || null,
    },
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "ADD_SECTION",
    entityType: "Template",
    entityId: templateId,
    details: { sectionTitle, order },
  });
  revalidatePath(`/templates/${templateId}`);
}

export async function deleteTemplateSectionAction(sectionId: string, templateId: string, ...args: unknown[]) {
  void args;
  const session = await getSession();
  if (!session?.user?.id || !canManageTemplates(session.user.role)) {
    throw new Error("Forbidden");
  }
  await prisma.templateSection.delete({ where: { id: sectionId } });
  await writeAuditLog({
    userId: session.user.id,
    action: "DELETE_SECTION",
    entityType: "Template",
    entityId: templateId,
    details: { sectionId },
  });
  revalidatePath(`/templates/${templateId}`);
}
