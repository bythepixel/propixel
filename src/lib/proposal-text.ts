import type { ContentBlock, Role } from "@prisma/client";
import { canViewSensitiveBlock } from "./permissions";
import { parseBodyFields } from "./content-block-bodies";

type ProposalSectionOverrides = {
  overrideBody?: string | null;
  overrideFieldsJson?: string | null;
};

export function parseSectionOverrideFields(section: ProposalSectionOverrides): string[] {
  const legacy = section.overrideBody ?? "";
  const fallback = legacy ? [legacy] : [];
  const raw = section.overrideFieldsJson;
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return parsed.map((value) => String(value ?? ""));
  } catch {
    return fallback;
  }
}

export function resolveSectionBodyFields(
  block: Pick<ContentBlock, "body" | "bodyFieldsJson" | "sensitive">,
  section: ProposalSectionOverrides,
  role: Role,
): string[] {
  const baseFields = parseBodyFields(block);
  const overrideFields = parseSectionOverrideFields(section);
  if (block.sensitive && !canViewSensitiveBlock(role)) {
    if (overrideFields.length > 0 && overrideFields.some((value) => value !== "")) {
      return baseFields.map((field, index) => {
        const override = overrideFields[index];
        return override !== undefined && override !== "" ? override : field;
      });
    }
    return [
      "[This block is marked sensitive. Only Approver, Publisher, and Admin roles can read the library source. Proposal exports still include overrides you add here.]",
    ];
  }
  return baseFields.map((field, index) => {
    const override = overrideFields[index];
    return override !== undefined && override !== "" ? override : field;
  });
}

export function resolveSectionBody(
  block: Pick<ContentBlock, "body" | "bodyFieldsJson" | "sensitive">,
  section: ProposalSectionOverrides,
  role: Role,
): string {
  return resolveSectionBodyFields(block, section, role)[0] ?? block.body;
}
