import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { canEditProposal } from "@/lib/permissions";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !canEditProposal(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id: proposalId } = await ctx.params;
  const proposal = await prisma.proposal.findUnique({ where: { id: proposalId } });
  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 120);
  const key = `${nanoid(8)}_${safeName}`;
  const dir = path.join(process.cwd(), "public", "uploads", proposalId);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const storedPath = path.join(dir, key);
  await writeFile(storedPath, buffer);

  const publicPath = `/uploads/${proposalId}/${key}`;
  const att = await prisma.attachment.create({
    data: {
      proposalId,
      fileName: file.name,
      storedPath: publicPath,
      mimeType: file.type || null,
    },
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "UPLOAD_ATTACHMENT",
    entityType: "Proposal",
    entityId: proposalId,
    details: { attachmentId: att.id, fileName: file.name },
  });

  return NextResponse.json({ ok: true, attachment: att });
}
