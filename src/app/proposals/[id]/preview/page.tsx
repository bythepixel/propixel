import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { buildProposalPdfPayload } from "@/lib/build-pdf-payload";
import { buildVisualTemplateDocument } from "@/lib/visual-template-render";
import { VisualTemplatePreview } from "@/components/visual-template-preview";
import { PreviewPrintTrigger } from "./print-trigger";

export default async function ProposalPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const proposal = await prisma.proposal.findUnique({
    where: { id },
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
      variables: { select: { name: true, value: true } },
    },
  });
  if (!proposal) notFound();
  const globalVariables = await prisma.globalVariable.findMany({
    select: { name: true, value: true },
  });

  const pdfData = buildProposalPdfPayload(
    proposal.title,
    proposal.sections,
    proposal.lineItems.map((l) => ({ label: l.label, quantity: l.quantity, unitPrice: l.unitPrice })),
    proposal.discountPercent,
    proposal.embeds,
    { globals: globalVariables, proposal: proposal.variables },
  );

  const visualTemplate = proposal.template?.visualTemplate;
  const wrappedDocument = visualTemplate
    ? buildVisualTemplateDocument({
        html: visualTemplate.html,
        css: visualTemplate.css,
        js: visualTemplate.js,
        proposalData: pdfData,
      })
    : null;
  const shouldAutoPrint = sp.print === "1";

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white dark:bg-zinc-950">
      <PreviewPrintTrigger enabled={shouldAutoPrint} />

      {wrappedDocument ? (
        <div className="h-screen w-full">
          <VisualTemplatePreview
            title={`Preview: ${proposal.title}`}
            documentHtml={wrappedDocument}
          />
        </div>
      ) : null}

      {!wrappedDocument ? (
        <article className="proposal-print mx-auto w-full max-w-[1440px] p-8 text-zinc-900 dark:text-zinc-50 print:max-w-none print:p-0">
        <h1 className="text-2xl font-bold">{proposal.title}</h1>
        {pdfData.sections.map((s, i) => (
          <section key={i} className="mt-8">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">{s.sectionTitle}</h2>
            <div className="prose prose-sm mt-2 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: s.body }} />
          </section>
        ))}
        {pdfData.lineItems.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-lg font-semibold">Pricing</h2>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-300 text-left dark:border-zinc-600">
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
            <p className="mt-2 text-sm">
              Discount: {proposal.discountPercent}% — see PDF for totals.
            </p>
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
      ) : null}
    </div>
  );
}
