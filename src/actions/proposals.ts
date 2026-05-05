"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import {
  canCreateProposal,
  canEditProposal,
  canPublishOrExport,
} from "@/lib/permissions";

export async function createProposalAction(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id || !canCreateProposal(session.user.role)) {
    throw new Error("Forbidden");
  }
  const title = String(formData.get("title") ?? "").trim();
  const templateIdRaw = String(formData.get("templateId") ?? "").trim();
  const templateId = templateIdRaw || null;
  if (!title) redirect("/proposals/new?error=title");

  let sectionCreates: { order: number; contentBlockId: string }[] = [];
  if (templateId) {
    const sections = await prisma.templateSection.findMany({
      where: { templateId },
      orderBy: { order: "asc" },
    });
    sectionCreates = sections
      .filter((s) => s.defaultBlockId)
      .map((s, i) => ({
        order: i,
        contentBlockId: s.defaultBlockId as string,
      }));
  }

  const proposal = await prisma.proposal.create({
    data: {
      title,
      authorId: session.user.id,
      templateId,
      sections: { create: sectionCreates },
    },
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "CREATE",
    entityType: "Proposal",
    entityId: proposal.id,
    details: { title, templateId },
  });
  revalidatePath("/proposals");
  redirect(`/proposals/${proposal.id}`);
}

export async function updateProposalTitleAction(proposalId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id || !canEditProposal(session.user.role)) {
    throw new Error("Forbidden");
  }
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  await prisma.proposal.update({
    where: { id: proposalId },
    data: { title },
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE_TITLE",
    entityType: "Proposal",
    entityId: proposalId,
    details: { title },
  });
  revalidatePath(`/proposals/${proposalId}`);
}

export async function updateSectionOverrideAction(sectionId: string, proposalId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id || !canEditProposal(session.user.role)) {
    throw new Error("Forbidden");
  }
  const raw = String(formData.get("overrideBody") ?? "");
  const overrideBody = raw.trim() === "" ? null : raw;
  await prisma.proposalSection.update({
    where: { id: sectionId },
    data: { overrideBody },
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE_SECTION_OVERRIDE",
    entityType: "ProposalSection",
    entityId: sectionId,
    details: { proposalId, hasOverride: overrideBody !== null },
  });
  revalidatePath(`/proposals/${proposalId}`);
}

export async function addProposalSectionAction(proposalId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id || !canEditProposal(session.user.role)) {
    throw new Error("Forbidden");
  }
  const contentBlockId = String(formData.get("contentBlockId") ?? "");
  if (!contentBlockId) redirect(`/proposals/${proposalId}?error=block`);

  const max = await prisma.proposalSection.aggregate({
    where: { proposalId },
    _max: { order: true },
  });
  const order = (max._max.order ?? -1) + 1;

  await prisma.proposalSection.create({
    data: { proposalId, contentBlockId, order },
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "ADD_SECTION",
    entityType: "Proposal",
    entityId: proposalId,
    details: { contentBlockId, order },
  });
  revalidatePath(`/proposals/${proposalId}`);
}

export async function removeProposalSectionAction(sectionId: string, proposalId: string, ...args: unknown[]) {
  void args;
  const session = await getSession();
  if (!session?.user?.id || !canEditProposal(session.user.role)) {
    throw new Error("Forbidden");
  }
  await prisma.proposalSection.delete({ where: { id: sectionId } });
  await writeAuditLog({
    userId: session.user.id,
    action: "REMOVE_SECTION",
    entityType: "Proposal",
    entityId: proposalId,
    details: { sectionId },
  });
  revalidatePath(`/proposals/${proposalId}`);
}

export async function moveProposalSectionFromForm(formData: FormData) {
  const sectionId = String(formData.get("sectionId") ?? "");
  const proposalId = String(formData.get("proposalId") ?? "");
  const direction = String(formData.get("direction")) === "down" ? "down" : "up";
  if (!sectionId || !proposalId) return;
  await moveProposalSectionAction(sectionId, proposalId, direction);
}

export async function moveProposalSectionAction(
  sectionId: string,
  proposalId: string,
  direction: "up" | "down",
) {
  const session = await getSession();
  if (!session?.user?.id || !canEditProposal(session.user.role)) {
    throw new Error("Forbidden");
  }
  const sections = await prisma.proposalSection.findMany({
    where: { proposalId },
    orderBy: { order: "asc" },
  });
  const idx = sections.findIndex((s) => s.id === sectionId);
  if (idx < 0) return;
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= sections.length) return;
  const a = sections[idx];
  const b = sections[swapWith];
  await prisma.$transaction([
    prisma.proposalSection.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.proposalSection.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);
  await writeAuditLog({
    userId: session.user.id,
    action: "REORDER_SECTION",
    entityType: "Proposal",
    entityId: proposalId,
    details: { sectionId, direction },
  });
  revalidatePath(`/proposals/${proposalId}`);
}

export async function savePricingAction(proposalId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id || !canEditProposal(session.user.role)) {
    throw new Error("Forbidden");
  }
  const discountPercent = Number(formData.get("discountPercent") ?? 0);
  const rows: { label: string; quantity: number; unitPrice: number }[] = [];
  for (let i = 0; i < 20; i++) {
    const label = String(formData.get(`line_${i}_label`) ?? "").trim();
    if (!label) continue;
    const quantity = Number(formData.get(`line_${i}_qty`) ?? 1) || 1;
    const unitPrice = Number(formData.get(`line_${i}_price`) ?? 0) || 0;
    rows.push({ label, quantity, unitPrice });
  }

  const ops = [
    prisma.pricingLineItem.deleteMany({ where: { proposalId } }),
    prisma.proposal.update({
      where: { id: proposalId },
      data: { discountPercent: Math.min(100, Math.max(0, discountPercent)) },
    }),
  ];
  if (rows.length) {
    ops.push(
      prisma.pricingLineItem.createMany({
        data: rows.map((r, order) => ({
          proposalId,
          order,
          label: r.label,
          quantity: r.quantity,
          unitPrice: r.unitPrice,
        })),
      }),
    );
  }
  await prisma.$transaction(ops);

  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE_PRICING",
    entityType: "Proposal",
    entityId: proposalId,
    details: { lineCount: rows.length, discountPercent },
  });
  revalidatePath(`/proposals/${proposalId}`);
}

export async function addProposalEmbedAction(proposalId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id || !canEditProposal(session.user.role)) {
    throw new Error("Forbidden");
  }
  const url = String(formData.get("url") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim() || null;
  const kind = String(formData.get("kind") ?? "link") === "media" ? "media" : "link";
  if (!url) redirect(`/proposals/${proposalId}?error=url`);
  await prisma.proposalEmbed.create({
    data: { proposalId, url, label, kind },
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "ADD_EMBED",
    entityType: "Proposal",
    entityId: proposalId,
    details: { kind },
  });
  revalidatePath(`/proposals/${proposalId}`);
}

export async function removeProposalEmbedAction(embedId: string, proposalId: string, ...args: unknown[]) {
  void args;
  const session = await getSession();
  if (!session?.user?.id || !canEditProposal(session.user.role)) {
    throw new Error("Forbidden");
  }
  await prisma.proposalEmbed.delete({ where: { id: embedId } });
  await writeAuditLog({
    userId: session.user.id,
    action: "REMOVE_EMBED",
    entityType: "Proposal",
    entityId: proposalId,
    details: { embedId },
  });
  revalidatePath(`/proposals/${proposalId}`);
}

export async function publishProposalAction(proposalId: string, ...args: unknown[]) {
  void args;
  const session = await getSession();
  if (!session?.user?.id || !canPublishOrExport(session.user.role)) {
    throw new Error("Forbidden");
  }
  const token = nanoid(24);
  await prisma.proposal.update({
    where: { id: proposalId },
    data: { published: true, shareToken: token },
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "PUBLISH",
    entityType: "Proposal",
    entityId: proposalId,
    details: { shareToken: token },
  });
  revalidatePath(`/proposals/${proposalId}`);
  revalidatePath(`/p/${token}`);
}

export async function unpublishProposalAction(proposalId: string, ...args: unknown[]) {
  void args;
  const session = await getSession();
  if (!session?.user?.id || !canPublishOrExport(session.user.role)) {
    throw new Error("Forbidden");
  }
  await prisma.proposal.update({
    where: { id: proposalId },
    data: { published: false, shareToken: null },
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "UNPUBLISH",
    entityType: "Proposal",
    entityId: proposalId,
    details: {},
  });
  revalidatePath(`/proposals/${proposalId}`);
}
