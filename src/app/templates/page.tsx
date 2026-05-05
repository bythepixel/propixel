import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canManageTemplates } from "@/lib/permissions";

export default async function TemplatesPage() {
  const session = await getSession();
  const canManage = session?.user && canManageTemplates(session.user.role);

  const templates = await prisma.template.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { sections: true } },
      visualTemplate: { select: { name: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl flex-1 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Templates</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Templates define default sections and starter blocks for new proposals.
          </p>
        </div>
        {canManage ? (
          <Link
            href="/templates/new"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            New template
          </Link>
        ) : null}
        {canManage ? (
          <Link
            href="/visual-templates"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600"
          >
            Visual templates
          </Link>
        ) : null}
      </div>
      <ul className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-800">
        {templates.map((t) => (
          <li key={t.id} className="flex items-center justify-between py-4">
            <div>
              <Link href={`/templates/${t.id}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                {t.name}
              </Link>
              <p className="text-xs text-zinc-500">{t._count.sections} default sections</p>
              <p className="text-xs text-zinc-500">
                Visual template: {t.visualTemplate?.name ?? "Not set"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
