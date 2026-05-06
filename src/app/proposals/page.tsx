import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canCreateProposal } from "@/lib/permissions";
import { buildProposalPdfPayload } from "@/lib/build-pdf-payload";
import { ProposalListActions } from "./proposal-list-actions";

export default async function ProposalsPage() {
  const session = await getSession();
  const canCreate = session?.user && canCreateProposal(session.user.role);

  const proposals = await prisma.proposal.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
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
      variables: { select: { name: true, value: true } },
    },
  });
  const globalVariables = await prisma.globalVariable.findMany({
    select: { name: true, value: true },
  });

  return (
    <div className="mx-auto max-w-4xl flex-1 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Proposals</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Assemble blocks, set proposal-only overrides, pricing, and attachments. Preview before PDF export.
          </p>
        </div>
        {canCreate ? (
          <Link
            href="/proposals/new"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            New proposal
          </Link>
        ) : null}
      </div>
      <ul className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-800">
        {proposals.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <h2 className="font-medium text-zinc-900 dark:text-zinc-50">{p.title}</h2>
              <p className="text-xs text-zinc-500">
                {p.author.name ?? p.author.email}
                {p.published ? (
                  <span className="ml-2 rounded bg-green-100 px-1.5 text-green-900 dark:bg-green-900/40 dark:text-green-100">
                    Published
                  </span>
                ) : null}
              </p>
            </div>
            <ProposalListActions
              proposalId={p.id}
              pdfData={buildProposalPdfPayload(
                p.title,
                p.sections,
                p.lineItems.map((l) => ({
                  label: l.label,
                  quantity: l.quantity,
                  unitPrice: l.unitPrice,
                })),
                p.discountPercent,
                p.embeds,
                { globals: globalVariables, proposal: p.variables },
              )}
            />
          </li>
        ))}
      </ul>
      {proposals.length === 0 ? <p className="py-8 text-zinc-500">No proposals yet.</p> : null}
    </div>
  );
}
