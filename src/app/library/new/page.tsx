import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canManageContentLibrary } from "@/lib/permissions";
import { createContentBlockAction } from "@/actions/content-blocks";

export default async function NewBlockPage() {
  const session = await getSession();
  if (!session?.user?.id || !canManageContentLibrary(session.user.role)) {
    redirect("/library");
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  const blockVisualTemplates = await prisma.blockVisualTemplate.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-2xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold">New content block</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Add usage guidance so producers pick the right block. Mark pricing or legal copy as sensitive to restrict
        visibility by role.
      </p>
      <form action={createContentBlockAction} className="mt-8 flex flex-col gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
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
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          >
            <option value="">No wrapper</option>
            {blockVisualTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
        <fieldset>
          <legend className="text-sm font-medium">Tags</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {tags.map((t) => (
              <label key={t.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="tagIds" value={t.id} />
                {t.name}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="sensitive" />
          Sensitive (pricing / legal — visible to Approver, Publisher, Admin)
        </label>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Create block
        </button>
      </form>
    </div>
  );
}
