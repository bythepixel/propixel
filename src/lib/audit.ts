import { prisma } from "./prisma";

export async function writeAuditLog(params: {
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: JSON.stringify(params.details),
    },
  });
}
