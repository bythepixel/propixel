import type { ProposalPdfPayload } from "@/components/proposal-pdf";
import { renderBlockVisualTemplateDocument } from "@/lib/block-visual-template-render";

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderProposalContentHtml(data: ProposalPdfPayload): string {
  return data.sections
    .map((section) => {
      if (section.blockVisualTemplate) {
        return renderBlockVisualTemplateDocument({
          html: section.blockVisualTemplate.html,
          css: section.blockVisualTemplate.css,
          js: section.blockVisualTemplate.js,
          block: {
            title: section.sectionTitle,
            body: section.body,
            bodyFields: section.bodyFields ?? [section.body],
          },
        });
      }
      return section.body;
    })
    .join("\n");
}

export function buildVisualTemplateDocument(params: {
  html: string;
  css: string;
  js: string;
  proposalData: ProposalPdfPayload;
}): string {
  const proposalContent = renderProposalContentHtml(params.proposalData);
  const json = JSON.stringify(params.proposalData).replaceAll("</script>", "<\\/script>");

  return params.html
    .replaceAll("{{proposal_title}}", escapeHtml(params.proposalData.title))
    .replaceAll("{{proposal_content}}", proposalContent)
    .replaceAll("{{proposal_json}}", json)
    .replaceAll("{{visual_css}}", params.css)
    .replaceAll("{{visual_js}}", params.js);
}
