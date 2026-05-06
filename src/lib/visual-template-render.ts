import type { ProposalPdfPayload } from "@/components/proposal-pdf";
import { renderBlockVisualTemplateDocument } from "@/lib/block-visual-template-render";
import { applyCommonTokens, applyVariableTokens } from "@/lib/variable-tokens";

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderProposalContentHtml(data: ProposalPdfPayload): string {
  const variables = data.variables ?? {};
  return data.sections
    .map((section) => {
      if (section.blockVisualTemplate) {
        return renderBlockVisualTemplateDocument({
          html: section.blockVisualTemplate.html,
          css: section.blockVisualTemplate.css,
          js: section.blockVisualTemplate.js,
          variables,
          proposalTitle: data.title,
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
  const variables = params.proposalData.variables ?? {};
  const proposalContent = renderProposalContentHtml(params.proposalData);
  const json = JSON.stringify(params.proposalData).replaceAll("</script>", "<\\/script>");
  const html = applyCommonTokens(applyVariableTokens(params.html, variables, { missingMode: "html-warning" }), {
    proposalTitle: params.proposalData.title,
  });
  const css = applyCommonTokens(applyVariableTokens(params.css, variables, { missingMode: "keep-token" }), {
    proposalTitle: params.proposalData.title,
  });
  const js = applyCommonTokens(applyVariableTokens(params.js, variables, { missingMode: "keep-token" }), {
    proposalTitle: params.proposalData.title,
  });

  return html
    .replaceAll("{{proposal_title}}", escapeHtml(params.proposalData.title))
    .replaceAll("{{proposal_content}}", proposalContent)
    .replaceAll("{{proposal_json}}", json)
    .replaceAll("{{visual_css}}", css)
    .replaceAll("{{visual_js}}", js);
}
