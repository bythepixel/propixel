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
  const sectionsHtml = data.sections
    .map((section) => {
      const plainBody = section.body;
      const wrappedBody = section.blockVisualTemplate
        ? renderBlockVisualTemplateDocument({
            html: section.blockVisualTemplate.html,
            css: section.blockVisualTemplate.css,
            js: section.blockVisualTemplate.js,
            block: {
              title: section.sectionTitle,
              body: section.body,
              bodyFields: section.bodyFields ?? [section.body],
            },
          })
        : plainBody;
      return `
      <section>
        <h2>${escapeHtml(section.sectionTitle)}</h2>
        ${wrappedBody}
      </section>`;
    })
    .join("\n");

  const hasPricing = data.lineItems.length > 0;
  const subtotal = data.lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0);
  const discount = subtotal * (Math.min(100, Math.max(0, data.discountPercent)) / 100);
  const total = Math.max(0, subtotal - discount);
  const pricingRows = data.lineItems
    .map(
      (li) => `
      <tr>
        <td>${escapeHtml(li.label)}</td>
        <td>${li.quantity}</td>
        <td>${li.unitPrice.toFixed(2)}</td>
        <td>${(li.quantity * li.unitPrice).toFixed(2)}</td>
      </tr>`,
    )
    .join("\n");

  const pricingHtml = hasPricing
    ? `
    <section>
      <h2>Pricing</h2>
      <table>
        <thead>
          <tr><th>Item</th><th>Qty</th><th>Unit</th><th>Line</th></tr>
        </thead>
        <tbody>${pricingRows}</tbody>
      </table>
      <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
      <p><strong>Discount (${data.discountPercent}%):</strong> -${discount.toFixed(2)}</p>
      <p><strong>Total:</strong> ${total.toFixed(2)}</p>
    </section>`
    : "";

  const linksHtml =
    data.embeds.length > 0
      ? `
    <section>
      <h2>Links & media</h2>
      <ul>
        ${data.embeds
          .map(
            (embed) =>
              `<li><a href="${escapeHtml(embed.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(embed.label ?? embed.url)}</a></li>`,
          )
          .join("\n")}
      </ul>
    </section>`
      : "";

  return `<article><h1>${escapeHtml(data.title)}</h1>${sectionsHtml}${pricingHtml}${linksHtml}</article>`;
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
