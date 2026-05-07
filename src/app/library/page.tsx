import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canEditBlockDefinition, canManageContentLibrary } from "@/lib/permissions";
import { LibrarySearchPanel } from "./library-search-panel";

type Search = { q?: string; category?: string; tag?: string };

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const session = await getSession();
  const role = session!.user.role;

  const q = (sp.q ?? "").trim();
  const categoryId = (sp.category ?? "").trim();
  const tagId = (sp.tag ?? "").trim();

  const blocks = await prisma.contentBlock.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q } },
                { body: { contains: q } },
                { usageGuidance: { contains: q } },
              ],
            }
          : {},
        categoryId ? { categoryId } : {},
        tagId ? { tags: { some: { tagId } } } : {},
      ],
    },
    orderBy: { title: "asc" },
    include: {
      category: true,
      tags: { include: { tag: true } },
      visualTemplate: { select: { id: true, name: true } },
    },
  });

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

  const canManage = canManageContentLibrary(role);

  return (
    <div className="mx-auto max-w-[1440px] flex-1 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Blocks</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Search and filter reusable blocks. Sensitive blocks respect your role.
          </p>
        </div>
        {canManage ? (
          <Link
            href="/library/new"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            New block
          </Link>
        ) : null}
        {canManage ? (
          <Link
            href="/block-visual-templates"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600"
          >
            Block Visuals
          </Link>
        ) : null}
      </div>

      <LibrarySearchPanel q={q} categoryId={categoryId} tagId={tagId} categories={categories} tags={tags} />

      <ul className="mt-6 divide-y divide-zinc-200 dark:divide-zinc-800">
        {blocks.map((b) => {
          const canEdit = canEditBlockDefinition(role, b.sensitive);
          return (
            <li key={b.id} className="py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium text-zinc-900 dark:text-zinc-50">{b.title}</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    {b.category.name}
                    {b.sensitive ? (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                        Sensitive
                      </span>
                    ) : null}
                    {b.tags.map((x) => (
                      <span key={x.tagId} className="ml-2 text-zinc-400">
                        #{x.tag.name}
                      </span>
                    ))}
                  </p>
                  {b.usageGuidance ? (
                    <p className="mt-2 text-sm text-blue-800 dark:text-blue-300">
                      <span className="font-medium">Guidance:</span> {b.usageGuidance}
                    </p>
                  ) : null}
                  {b.visualTemplate ? (
                    <p className="mt-2 text-xs text-zinc-500">
                      Block wrapper: {b.visualTemplate.name}
                    </p>
                  ) : null}
                </div>
                {canManage && canEdit ? (
                  <div className="flex shrink-0 items-center gap-3">
                    {b.visualTemplate ? (
                      <Link
                        href={`/library/${b.id}/wrapper-preview`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Preview block wrapper"
                        title="Preview block wrapper"
                        className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-900"
                      >
                        <span aria-hidden="true">👁</span>
                      </Link>
                    ) : null}
                    <Link
                      href={`/library/${b.id}/edit`}
                      aria-label="Edit block"
                      title="Edit block"
                      className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      <span aria-hidden="true">✏️</span>
                    </Link>
                  </div>
                ) : canManage && !canEdit ? (
                  <span className="shrink-0 text-xs text-zinc-500">Approver+ to edit</span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {blocks.length === 0 ? <p className="py-8 text-zinc-500">No blocks match your filters.</p> : null}
    </div>
  );
}
