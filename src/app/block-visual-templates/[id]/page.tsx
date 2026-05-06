import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { canManageContentLibrary } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { updateBlockVisualTemplateAction } from "@/actions/block-visual-templates";
import { BlockVisualTemplateEditor } from "@/components/block-visual-template-editor";

export default async function BlockVisualTemplateDetailPage({
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
  if (!session?.user?.id || !canManageContentLibrary(session.user.role)) {
    redirect("/library");
  }
  const template = await prisma.blockVisualTemplate.findUnique({
    where: { id },
    include: { blocks: { select: { id: true, title: true }, orderBy: { title: "asc" } } },
  });
  if (!template) notFound();
  const proposalVisualTemplates = await prisma.visualTemplate.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, css: true, js: true },
  });

  return (
    <div className="mx-auto max-w-6xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold">Edit Block Visual</h1>
      {isSaved ? (
        <p className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-900/30 dark:text-green-100">
          Saved successfully.
        </p>
      ) : null}
      <form action={updateBlockVisualTemplateAction.bind(null, id)} className="mt-6 space-y-4">
        <div className="max-w-xl">
          <label htmlFor="name" className="block text-sm font-medium">Name</label>
          <input id="name" name="name" required defaultValue={template.name} className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900" />
        </div>
        <BlockVisualTemplateEditor
          initialHtml={template.html}
          initialCss={template.css}
          initialJs={template.js}
          storedBodyFieldCount={template.bodyFieldCount}
          proposalVisualTemplates={proposalVisualTemplates}
        />
        <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
          Save Block Visual
        </button>
      </form>
      <section className="mt-8 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-lg font-medium">Assigned content blocks</h2>
        <ul className="mt-2 list-disc pl-6 text-sm">
          {template.blocks.length === 0 ? <li>No blocks assigned.</li> : template.blocks.map((block) => (
            <li key={block.id}>
              <Link href={`/library/${block.id}/edit`} className="text-blue-600 hover:underline dark:text-blue-400">{block.title}</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
