import type { Role } from "@prisma/client";

const order: Record<Role, number> = {
  VIEWER: 0,
  EDITOR: 1,
  APPROVER: 2,
  PUBLISHER: 3,
  ADMIN: 4,
};

export function roleAtLeast(role: Role, min: Role): boolean {
  return order[role] >= order[min];
}

export function canViewSensitiveBlock(role: Role): boolean {
  return roleAtLeast(role, "APPROVER");
}

export function canManageContentLibrary(role: Role): boolean {
  return roleAtLeast(role, "EDITOR");
}

export function canManageTemplates(role: Role): boolean {
  return roleAtLeast(role, "EDITOR");
}

export function canCreateProposal(role: Role): boolean {
  return roleAtLeast(role, "EDITOR");
}

export function canEditProposal(role: Role): boolean {
  return roleAtLeast(role, "EDITOR");
}

export function canPublishOrExport(role: Role): boolean {
  return roleAtLeast(role, "PUBLISHER");
}

export function canDeleteBlocks(role: Role): boolean {
  return roleAtLeast(role, "ADMIN");
}

/** Editors may curate non-sensitive blocks; sensitive body requires Approver+. */
export function canEditBlockDefinition(role: Role, sensitive: boolean): boolean {
  if (!canManageContentLibrary(role)) return false;
  if (!sensitive) return true;
  return canViewSensitiveBlock(role);
}
