"use server";

import { unlink } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { canManageContentLibrary } from "@/lib/permissions";

export async function deleteMediaAction(mediaId: string, ...args: unknown[]) {
  void args;
  const session = await getSession();
  if (!session?.user?.id || !canManageContentLibrary(session.user.role)) {
    throw new Error("Forbidden");
  }

  const media = await prisma.mediaAsset.findUnique({ where: { id: mediaId } });
  if (!media) return;

  await prisma.mediaAsset.delete({ where: { id: mediaId } });

  try {
    const relative = media.storedPath.replace(/^\/+/, "");
    await unlink(path.join(process.cwd(), "public", relative));
  } catch {
    // File may be already removed; DB state is source of truth.
  }

  await writeAuditLog({
    userId: session.user.id,
    action: "DELETE_MEDIA",
    entityType: "MediaAsset",
    entityId: mediaId,
    details: { storedPath: media.storedPath, fileName: media.fileName },
  });

  revalidatePath("/media");
}
