import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { resolveSectionBody } from "@/lib/proposal-text";
import { computePricingTotals } from "@/lib/pricing";
import {
  canEditProposal,
  canPublishOrExport,
} from "@/lib/permissions";
import {
  addProposalEmbedAction,
  addProposalSectionAction,
  moveProposalSectionFromForm,
  publishProposalAction,
  removeProposalEmbedAction,
  removeProposalSectionAction,
  savePricingAction,
  unpublishProposalAction,
  updateProposalTitleAction,
  updateSectionOverrideAction,
} from "@/actions/proposals";
import { ProposalUpload } from "./proposal-upload";

export default async function ProposalEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) notFound();

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: { contentBlock: true },
      },
      lineItems: { orderBy: { order: "asc" } },
      embeds: true,
      attachments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!proposal) notFound();

  const role = session.user.role;
  const canEdit = canEditProposal(role);
  const canPublish = canPublishOrExport(role);

  const blocks = await prisma.contentBlock.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, sensitive: true },
  });

  const { subtotal, discount, total } = computePricingTotals(
    proposal.lineItems.map((l) => ({ quantity: l.quantity, unitPrice: l.unitPrice })),
    proposal.discountPercent,
  );

  const origin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const shareUrl = proposal.shareToken ? `${origin}/p/${proposal.shareToken}` : null;

  return (
    <div className="mx-auto max-w-4xl flex-1 px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div className="min-w-0 flex-1">
          {canEdit ? (
            <form action={updateProposalTitleAction.bind(null, id)} className="flex flex-wrap items-end gap-2">
              <div className="min-w-0 flex-1">
                <label htmlFor="title" className="sr-only">
                  Proposal title
                </label>
                <input
                  id="title"
                  name="title"
                  defaultValue={proposal.title}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xl font-semibold dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <button type="submit" className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600">
                Save title
              </button>
            </form>
          ) : (
            <h1 className="text-2xl font-semibold">{proposal.title}</h1>
          )}
          <p className="mt-2 text-sm text-zinc-500">
            <Link href="/proposals" className="text-blue-600 hover:underline dark:text-blue-400">
              All proposals
            </Link>
            <span aria-hidden="true" className="mx-2">
              ·
            </span>
            <Link href={`/proposals/${id}/preview`} className="text-blue-600 hover:underline dark:text-blue-400">
              Preview & PDF
            </Link>
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 text-sm">
          {canPublish && proposal.published && shareUrl ? (
            <>
              <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-900 dark:bg-green-900/40 dark:text-green-100">
                Published
              </span>
              <p className="max-w-md text-xs text-zinc-500">
                Share link
                <span className="mt-1 block break-all rounded border border-zinc-300 bg-zinc-50 px-2 py-1 font-mono text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100">
                  {shareUrl}
                </span>
              </p>
              <form action={unpublishProposalAction.bind(null, id)}>
                <button type="submit" className="text-red-600 hover:underline dark:text-red-400">
                  Unpublish
                </button>
              </form>
            </>
          ) : canPublish ? (
            <form action={publishProposalAction.bind(null, id)}>
              <button type="submit" className="rounded-md bg-green-700 px-3 py-2 text-white hover:bg-green-800">
                Publish & create share link
              </button>
            </form>
          ) : (
            <p className="max-w-xs text-right text-xs text-zinc-500">Publisher or Admin can publish and copy the share link.</p>
          )}
        </div>
      </div>

      <section aria-labelledby="sections-heading" className="mt-10">
        <h2 id="sections-heading" className="text-lg font-medium">
          Sections
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Overrides replace the library block text for this proposal only. Use Move to change order.
        </p>
        <ol className="mt-6 space-y-8">
          {proposal.sections.map((s, idx) => {
            const resolved = resolveSectionBody(s.contentBlock, s.overrideBody, role);
            return (
              <li key={s.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-50">{s.contentBlock.title}</h3>
                  {canEdit ? (
                    <div className="flex flex-wrap gap-2">
                      <form action={moveProposalSectionFromForm}>
                        <input type="hidden" name="sectionId" value={s.id} />
                        <input type="hidden" name="proposalId" value={id} />
                        <input type="hidden" name="direction" value="up" />
                        <button type="submit" className="rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-600" disabled={idx === 0}>
                          Up
                        </button>
                      </form>
                      <form action={moveProposalSectionFromForm}>
                        <input type="hidden" name="sectionId" value={s.id} />
                        <input type="hidden" name="proposalId" value={id} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          type="submit"
                          className="rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-600"
                          disabled={idx === proposal.sections.length - 1}
                        >
                          Down
                        </button>
                      </form>
                      <form action={removeProposalSectionAction.bind(null, s.id, id)}>
                        <button type="submit" className="text-xs text-red-600 hover:underline dark:text-red-400">
                          Remove
                        </button>
                      </form>
                    </div>
                  ) : null}
                </div>
                <div
                  className="prose prose-sm mt-2 max-w-none text-zinc-700 dark:prose-invert dark:text-zinc-300"
                  dangerouslySetInnerHTML={{ __html: resolved }}
                />
                {canEdit ? (
                  <form action={updateSectionOverrideAction.bind(null, s.id, id)} className="mt-4 flex flex-col gap-2">
                    <label htmlFor={`ov-${s.id}`} className="text-sm font-medium">
                      Proposal-only override
                    </label>
                    <textarea
                      id={`ov-${s.id}`}
                      name="overrideBody"
                      rows={5}
                      defaultValue={s.overrideBody ?? ""}
                      placeholder="Leave empty to use library text (respects sensitive visibility)."
                      className="rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900"
                    />
                    <button type="submit" className="w-fit rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
                      Save override
                    </button>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>

      {canEdit ? (
        <section className="mt-10 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-lg font-medium">Add section from library</h2>
          <form action={addProposalSectionAction.bind(null, id)} className="mt-4 flex flex-wrap items-end gap-2">
            <div>
              <label htmlFor="contentBlockId" className="block text-sm">
                Block
              </label>
              <select
                id="contentBlockId"
                name="contentBlockId"
                required
                className="mt-1 min-w-[240px] rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
              >
                <option value="">Select…</option>
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                    {b.sensitive ? " (sensitive)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
              Add
            </button>
          </form>
        </section>
      ) : null}

      <section aria-labelledby="pricing-heading" className="mt-10">
        <h2 id="pricing-heading" className="text-lg font-medium">
          Pricing
        </h2>
        {canEdit ? (
          <form action={savePricingAction.bind(null, id)} className="mt-4 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left dark:border-zinc-800">
                    <th className="py-2 pr-2 font-medium">Label</th>
                    <th className="py-2 pr-2 font-medium">Qty</th>
                    <th className="py-2 pr-2 font-medium">Unit price</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 12 }).map((_, i) => {
                    const li = proposal.lineItems[i];
                    return (
                      <tr key={i} className="border-b border-zinc-100 dark:border-zinc-900">
                        <td className="py-1 pr-2">
                          <label htmlFor={`line_${i}_label`} className="sr-only">
                            Line {i + 1} label
                          </label>
                          <input
                            id={`line_${i}_label`}
                            name={`line_${i}_label`}
                            defaultValue={li?.label ?? ""}
                            className="w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
                          />
                        </td>
                        <td className="py-1 pr-2">
                          <label htmlFor={`line_${i}_qty`} className="sr-only">
                            Line {i + 1} quantity
                          </label>
                          <input
                            id={`line_${i}_qty`}
                            name={`line_${i}_qty`}
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={li?.quantity ?? 1}
                            className="w-24 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
                          />
                        </td>
                        <td className="py-1 pr-2">
                          <label htmlFor={`line_${i}_price`} className="sr-only">
                            Line {i + 1} unit price
                          </label>
                          <input
                            id={`line_${i}_price`}
                            name={`line_${i}_price`}
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={li?.unitPrice ?? 0}
                            className="w-28 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div>
              <label htmlFor="discountPercent" className="block text-sm font-medium">
                Discount %
              </label>
              <input
                id="discountPercent"
                name="discountPercent"
                type="number"
                step="0.1"
                min="0"
                max="100"
                defaultValue={proposal.discountPercent}
                className="mt-1 w-32 rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
              />
            </div>
            <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
              Save pricing
            </button>
          </form>
        ) : null}
        <dl className="mt-4 grid max-w-sm gap-1 text-sm">
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

      <section className="mt-10">
        <h2 className="text-lg font-medium">Links & embeds</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {proposal.embeds.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-2">
              <a href={e.url} className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400" target="_blank" rel="noopener noreferrer">
                {e.label ?? e.url}
              </a>
              {canEdit ? (
                <form action={removeProposalEmbedAction.bind(null, e.id, id)}>
                  <button type="submit" className="text-xs text-red-600 hover:underline">
                    Remove
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
        {canEdit ? (
          <form action={addProposalEmbedAction.bind(null, id)} className="mt-4 flex max-w-lg flex-col gap-2">
            <input name="label" placeholder="Label (optional)" className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900" />
            <input name="url" type="url" required placeholder="https://…" className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900" />
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" name="kind" value="link" defaultChecked />
                Link
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="kind" value="media" />
                Media / embed URL
              </label>
            </div>
            <button type="submit" className="w-fit rounded-md bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
              Add
            </button>
          </form>
        ) : null}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Attachments</h2>
        {canEdit ? <ProposalUpload proposalId={id} /> : null}
        <ul className="mt-4 list-disc space-y-1 pl-6 text-sm">
          {proposal.attachments.map((a) => (
            <li key={a.id}>
              <a href={a.storedPath} className="text-blue-600 hover:underline dark:text-blue-400" download>
                {a.fileName}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
