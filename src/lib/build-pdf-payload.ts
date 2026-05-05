import type { ProposalPdfPayload } from "@/components/proposal-pdf";

type SectionIn = {
  order: number;
  overrideBody: string | null;
  contentBlock: {
    title: string;
    body: string;
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
    sections: sorted.map((s) => ({
      sectionTitle: s.contentBlock.title,
      body:
        s.overrideBody !== null && s.overrideBody !== undefined && s.overrideBody !== ""
          ? s.overrideBody
          : s.contentBlock.body,
      blockVisualTemplate: s.contentBlock.visualTemplate ?? null,
    })),
    lineItems,
    discountPercent,
    embeds,
  };
}
