import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canManageTemplates } from "@/lib/permissions";

export default async function VisualTemplatesPage() {
  const session = await getSession();
  if (!session?.user?.id || !canManageTemplates(session.user.role)) {
    redirect("/templates");
  }

  const visualTemplates = await prisma.visualTemplate.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { templates: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl flex-1 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Global Visuals</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Top-level wrappers for proposal preview and public pages.
          </p>
        </div>
        <Link
          href="/visual-templates/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          New Global Visual
        </Link>
      </div>
      <ul className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-800">
        {visualTemplates.map((vt) => (
          <li key={vt.id} className="flex items-center justify-between py-4">
            <div>
              <h2 className="font-medium text-zinc-900 dark:text-zinc-50">{vt.name}</h2>
              <p className="text-xs text-zinc-500">{vt._count.templates} templates assigned</p>
            </div>
            <Link
              href={`/visual-templates/${vt.id}`}
              aria-label="Edit Global Visual"
              title="Edit Global Visual"
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <span aria-hidden="true">✏️</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
