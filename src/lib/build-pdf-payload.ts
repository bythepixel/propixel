import type { ProposalPdfPayload } from "@/components/proposal-pdf";
import { parseBodyFields } from "@/lib/content-block-bodies";
import { parseSectionOverrideFields } from "@/lib/proposal-text";

type SectionIn = {
  order: number;
  overrideBody: string | null;
  overrideFieldsJson: string;
  contentBlock: {
    title: string;
    body: string;
    bodyFieldsJson: string;
    sensitive: boolean;
    visualTemplate?: { html: string; css: string; js: string } | null;
  };
};

/** PDF and public share use full source + overrides (client-facing). */
export function buildProposalPdfPayload(
  title: string,
  sections: SectionIn[],
  lineItems: { label: string; quantity: number; unitPrice: number }[],
  discountPercent: number,
  embeds: { label: string | null; url: string; kind: string }[],
): ProposalPdfPayload {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  return {
    title,
    sections: sorted.map((s) => {
      const baseFields = parseBodyFields({
        body: s.contentBlock.body,
        bodyFieldsJson: s.contentBlock.bodyFieldsJson,
      });
      const overrideFields = parseSectionOverrideFields(s);
      const mergedFields = baseFields.map((field, index) => {
        const override = overrideFields[index];
        return override !== undefined && override !== "" ? override : field;
      });
      const first = mergedFields[0] ?? s.contentBlock.body;
      return {
        bodyFields: mergedFields,
        sectionTitle: s.contentBlock.title,
        body: first,
        blockVisualTemplate: s.contentBlock.visualTemplate ?? null,
      };
    }),
    lineItems,
    discountPercent,
    embeds,
  };
}
