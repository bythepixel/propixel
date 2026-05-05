import type { ProposalPdfPayload } from "@/components/proposal-pdf";
import { parseBodyFields } from "@/lib/content-block-bodies";

type SectionIn = {
  order: number;
  overrideBody: string | null;
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
      const first =
        s.overrideBody !== null && s.overrideBody !== undefined && s.overrideBody !== ""
          ? s.overrideBody
          : baseFields[0] ?? s.contentBlock.body;
      return {
        bodyFields: [first, ...baseFields.slice(1)],
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
