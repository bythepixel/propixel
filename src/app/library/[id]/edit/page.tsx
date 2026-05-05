import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canDeleteBlocks, canEditBlockDefinition, canManageContentLibrary } from "@/lib/permissions";
import { deleteContentBlockAction, updateContentBlockAction } from "@/actions/content-blocks";

export default async function EditBlockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user?.id || !canManageContentLibrary(session.user.role)) {
    redirect("/library");
  }

  const block = await prisma.contentBlock.findUnique({
    where: { id },
    include: { tags: true, visualTemplate: true },
  });
  if (!block) notFound();

  if (!canEditBlockDefinition(session.user.role, block.sensitive)) {
    return (
      <div className="mx-auto max-w-lg flex-1 px-4 py-12">
        <h1 className="text-xl font-semibold">Restricted block</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          This block is marked sensitive. Ask an Approver, Publisher, or Admin to edit it.
        </p>
        <Link href="/library" className="mt-6 inline-block text-blue-600 hover:underline dark:text-blue-400">
          Back to library
        </Link>
      </div>
    );
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  const blockVisualTemplates = await prisma.blockVisualTemplate.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  const selected = new Set(block.tags.map((t) => t.tagId));

  return (
    <div className="mx-auto max-w-2xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold">Edit block</h1>
      <form action={updateContentBlockAction.bind(null, id)} className="mt-8 flex flex-col gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={block.title}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label htmlFor="body" className="block text-sm font-medium">
            Body
          </label>
          <textarea
            id="body"
            name="body"
            rows={8}
            defaultValue={block.body}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label htmlFor="usageGuidance" className="block text-sm font-medium">
            Usage guidance
          </label>
          <textarea
            id="usageGuidance"
            name="usageGuidance"
            rows={3}
            defaultValue={block.usageGuidance ?? ""}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={block.categoryId}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="visualTemplateId" className="block text-sm font-medium">
            Block visual template
          </label>
          <select
            id="visualTemplateId"
            name="visualTemplateId"
            defaultValue={block.visualTemplateId ?? ""}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          >
            <option value="">No wrapper</option>
            {blockVisualTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          {block.visualTemplate ? (
            <p className="mt-1 text-xs text-zinc-500">
              Current wrapper: {block.visualTemplate.name}
            </p>
          ) : null}
        </div>
        <fieldset>
          <legend className="text-sm font-medium">Tags</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {tags.map((t) => (
              <label key={t.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="tagIds" value={t.id} defaultChecked={selected.has(t.id)} />
                {t.name}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="sensitive" defaultChecked={block.sensitive} />
          Sensitive (pricing / legal)
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Save
          </button>
          <Link href="/library" className="rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600">
            Cancel
          </Link>
        </div>
      </form>
      {canDeleteBlocks(session.user.role) ? (
        <form className="mt-12 border-t border-red-200 pt-8 dark:border-red-900/50" action={deleteContentBlockAction.bind(null, id)}>
          <button type="submit" className="text-sm text-red-600 hover:underline dark:text-red-400">
            Delete block (admin)
          </button>
        </form>
      ) : null}
    </div>
  );
}
