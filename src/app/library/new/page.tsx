import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canManageContentLibrary } from "@/lib/permissions";
import { createContentBlockAction } from "@/actions/content-blocks";
import { NewBlockForm } from "./new-block-form";

export default async function NewBlockPage() {
  const session = await getSession();
  if (!session?.user?.id || !canManageContentLibrary(session.user.role)) {
    redirect("/library");
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  const blockVisualTemplates = await prisma.blockVisualTemplate.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, bodyFieldCount: true },
  });

  return (
    <div className="mx-auto max-w-2xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold">New content block</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Add usage guidance so producers pick the right block. Mark pricing or legal copy as sensitive to restrict
        visibility by role.
      </p>
      <NewBlockForm
        createAction={createContentBlockAction}
        categories={categories}
        tags={tags}
        blockVisualTemplates={blockVisualTemplates}
      />
    </div>
  );
}
