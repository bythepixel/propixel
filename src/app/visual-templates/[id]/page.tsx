import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { canManageTemplates } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { updateVisualTemplateAction } from "@/actions/visual-templates";
import { VisualTemplateEditor } from "@/components/visual-template-editor";
import { buildProposalPdfPayload } from "@/lib/build-pdf-payload";

export default async function VisualTemplateDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const isSaved = sp.saved === "1";
  const session = await getSession();
  if (!session?.user?.id || !canManageTemplates(session.user.role)) {
    redirect("/templates");
  }

  const visualTemplate = await prisma.visualTemplate.findUnique({
    where: { id },
    include: {
      templates: { select: { id: true, name: true }, orderBy: { name: "asc" } },
    },
  });
  if (!visualTemplate) notFound();
  const sampleProposal = await prisma.proposal.findFirst({
    where: { template: { visualTemplateId: id } },
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
    },
    orderBy: { updatedAt: "desc" },
  });
  const previewData = sampleProposal
    ? buildProposalPdfPayload(
        sampleProposal.title,
        sampleProposal.sections,
        sampleProposal.lineItems.map((lineItem) => ({
          label: lineItem.label,
          quantity: lineItem.quantity,
          unitPrice: lineItem.unitPrice,
        })),
        sampleProposal.discountPercent,
        sampleProposal.embeds,
      )
    : undefined;

  return (
    <div className="mx-auto max-w-6xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold">Edit Global Visual</h1>
      {isSaved ? (
        <p className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-900/30 dark:text-green-100">
          Saved successfully.
        </p>
      ) : null}
      <form action={updateVisualTemplateAction.bind(null, id)} className="mt-6 space-y-4">
        <div className="max-w-xl">
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={visualTemplate.name}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <VisualTemplateEditor
          initialHtml={visualTemplate.html}
          initialCss={visualTemplate.css}
          initialJs={visualTemplate.js}
          previewData={previewData}
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Save Global Visual
        </button>
      </form>
      <section className="mt-10 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-lg font-medium">Assigned templates</h2>
        <ul className="mt-3 list-disc pl-6 text-sm">
          {visualTemplate.templates.length === 0 ? (
            <li>No templates assigned yet.</li>
          ) : (
            visualTemplate.templates.map((template) => (
              <li key={template.id}>
                <Link href={`/templates/${template.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                  {template.name}
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
