import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canManageTemplates } from "@/lib/permissions";
import {
  addTemplateSectionAction,
  deleteTemplateSectionAction,
  updateTemplateMetaAction,
} from "@/actions/templates";

export default async function TemplateDetailPage({
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
  const canManage = session?.user && canManageTemplates(session.user.role);

  const template = await prisma.template.findUnique({
    where: { id },
    include: {
      sections: { orderBy: { order: "asc" }, include: { defaultBlock: true } },
      visualTemplate: { select: { id: true, name: true } },
    },
  });
  if (!template) notFound();

  const blocks = await prisma.contentBlock.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });
  const visualTemplates = await prisma.visualTemplate.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-3xl flex-1 px-4 py-8">
      {isSaved ? (
        <p className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-900/30 dark:text-green-100">
          Saved successfully.
        </p>
      ) : null}
      {canManage ? (
        <form action={updateTemplateMetaAction.bind(null, id)} className="flex flex-col gap-4 border-b border-zinc-200 pb-8 dark:border-zinc-800">
          <h1 className="text-2xl font-semibold">Edit template</h1>
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={template.name}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={template.description ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label htmlFor="visualTemplateId" className="block text-sm font-medium">
              Global Visual
            </label>
            <select
              id="visualTemplateId"
              name="visualTemplateId"
              defaultValue={template.visualTemplateId ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
            >
              <option value="">No wrapper selected</option>
              {visualTemplates.map((vt) => (
                <option key={vt.id} value={vt.id}>
                  {vt.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
            Save metadata
          </button>
        </form>
      ) : (
        <>
          <h1 className="text-2xl font-semibold">{template.name}</h1>
          {template.description ? <p className="mt-2 text-sm text-zinc-600">{template.description}</p> : null}
          <p className="mt-2 text-sm text-zinc-600">Global Visual: {template.visualTemplate?.name ?? "Not set"}</p>
        </>
      )}

      <h2 className="mt-10 text-lg font-medium">Default sections</h2>
      <ol className="mt-4 list-decimal space-y-4 pl-6">
        {template.sections.map((s) => (
          <li key={s.id} className="pl-2">
            <div className="font-medium">{s.sectionTitle}</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Default block: {s.defaultBlock?.title ?? "— none —"}
            </div>
            {canManage ? (
              <form action={deleteTemplateSectionAction.bind(null, s.id, id)} className="mt-2">
                <button type="submit" className="text-xs text-red-600 hover:underline dark:text-red-400">
                  Remove section
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ol>

      {canManage ? (
        <form action={addTemplateSectionAction.bind(null, id)} className="mt-8 flex max-w-lg flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h3 className="font-medium">Add section</h3>
          <div>
            <label htmlFor="sectionTitle" className="block text-sm">
              Section title
            </label>
            <input
              id="sectionTitle"
              name="sectionTitle"
              required
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label htmlFor="defaultBlockId" className="block text-sm">
              Default block (optional)
            </label>
            <select
              id="defaultBlockId"
              name="defaultBlockId"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
            >
              <option value="">— none —</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-fit rounded-md bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
            Add
          </button>
        </form>
      ) : null}

      <p className="mt-10">
        <Link href="/templates" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          ← All templates
        </Link>
      </p>
    </div>
  );
}
