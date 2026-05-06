import { prisma } from "@/lib/prisma";
import { buildProposalPdfPayload } from "@/lib/build-pdf-payload";
import {
  buildVisualTemplateDocument,
  renderProposalContentHtml,
} from "@/lib/visual-template-render";

function fallbackDocument(title: string, proposalHtml: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
    <style>
      body { margin: 0; font-family: Inter, system-ui, sans-serif; color: #111827; background: #ffffff; }
      article { max-width: 960px; margin: 24px auto; padding: 0 16px 40px; }
      h1,h2,h3 { margin-top: 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { text-align: left; border-bottom: 1px solid #e5e7eb; padding: 8px; }
      a { color: #2563eb; }
    </style>
  </head>
  <body>
    ${proposalHtml}
  </body>
</html>`;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const proposal = await prisma.proposal.findFirst({
    where: { shareToken: token, published: true },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          contentBlock: {
            include: { visualTemplate: { select: { html: true, css: true, js: true } } },
          },
        },
      },
      lineItems: { orderBy: { order: "asc" } },
      embeds: true,
      template: { include: { visualTemplate: true } },
    },
  });

  if (!proposal) {
    return new Response("Not found", { status: 404 });
  }

  const payload = buildProposalPdfPayload(
    proposal.title,
    proposal.sections,
    proposal.lineItems.map((lineItem) => ({
      label: lineItem.label,
      quantity: lineItem.quantity,
      unitPrice: lineItem.unitPrice,
    })),
    proposal.discountPercent,
    proposal.embeds,
  );

  const doc = proposal.template?.visualTemplate
    ? buildVisualTemplateDocument({
        html: proposal.template.visualTemplate.html,
        css: proposal.template.visualTemplate.css,
        js: proposal.template.visualTemplate.js,
        proposalData: payload,
      })
    : fallbackDocument(proposal.title, renderProposalContentHtml(payload));

  return new Response(doc, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
