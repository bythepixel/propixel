import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildProposalPdfPayload } from "@/lib/build-pdf-payload";
import { ProposalPdfDownload } from "@/components/proposal-pdf";
import { buildVisualTemplateDocument } from "@/lib/visual-template-render";
import { VisualTemplatePreview } from "@/components/visual-template-preview";

export default async function PublicProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
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
  if (!proposal) notFound();

  const pdfData = buildProposalPdfPayload(
    proposal.title,
    proposal.sections,
    proposal.lineItems.map((l) => ({ label: l.label, quantity: l.quantity, unitPrice: l.unitPrice })),
    proposal.discountPercent,
    proposal.embeds,
  );

  const subtotal = pdfData.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);
  const discount = subtotal * (Math.min(100, Math.max(0, proposal.discountPercent)) / 100);
  const total = Math.max(0, subtotal - discount);

  const visualTemplate = proposal.template?.visualTemplate;
  const wrappedDocument = visualTemplate
    ? buildVisualTemplateDocument({
        html: visualTemplate.html,
        css: visualTemplate.css,
        js: visualTemplate.js,
        proposalData: pdfData,
      })
    : null;

  return (
    <div className="mx-auto max-w-3xl flex-1 px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Shared proposal (read-only)</p>
        <span className="text-sm text-blue-700 dark:text-blue-300">
          <ProposalPdfDownload data={pdfData} />
        </span>
      </div>
      {wrappedDocument ? (
        <VisualTemplatePreview
          title={`Public proposal: ${proposal.title}`}
          documentHtml={wrappedDocument}
        />
      ) : (
        <article className="rounded-lg border border-zinc-200 bg-white p-8 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
        <h1 className="text-2xl font-bold">{proposal.title}</h1>
        {pdfData.sections.map((s, i) => (
          <section key={i} className="mt-8">
            <h2 className="text-lg font-semibold">{s.sectionTitle}</h2>
            <div className="prose prose-sm mt-2 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: s.body }} />
          </section>
        ))}
        {pdfData.lineItems.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-lg font-semibold">Pricing</h2>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Item</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2">Unit</th>
                  <th className="py-2">Line</th>
                </tr>
              </thead>
              <tbody>
                {pdfData.lineItems.map((li, i) => (
                  <tr key={i} className="border-b border-zinc-200 dark:border-zinc-800">
                    <td className="py-2">{li.label}</td>
                    <td className="py-2">{li.quantity}</td>
                    <td className="py-2">{li.unitPrice.toFixed(2)}</td>
                    <td className="py-2">{(li.quantity * li.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="mt-4 max-w-xs space-y-1 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Discount ({proposal.discountPercent}%)</dt>
                <dd>-{discount.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Total</dt>
                <dd>{total.toFixed(2)}</dd>
              </div>
            </dl>
          </section>
        ) : null}
        {pdfData.embeds.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-lg font-semibold">Links & media</h2>
            <ul className="mt-2 list-disc pl-6 text-sm">
              {pdfData.embeds.map((e, i) => (
                <li key={i}>
                  <a href={e.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                    {e.label ?? e.url}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        </article>
      )}
    </div>
  );
}
