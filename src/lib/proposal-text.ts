import type { ContentBlock, Role } from "@prisma/client";
import { canViewSensitiveBlock } from "./permissions";

export function resolveSectionBody(
  block: Pick<ContentBlock, "body" | "sensitive">,
  overrideBody: string | null | undefined,
  role: Role,
): string {
  if (overrideBody !== null && overrideBody !== undefined && overrideBody !== "") {
    return overrideBody;
  }
  if (block.sensitive && !canViewSensitiveBlock(role)) {
    return "[This block is marked sensitive. Only Approver, Publisher, and Admin roles can read the library source. Proposal exports still include overrides you add here.]";
  }
  return block.body;
}
