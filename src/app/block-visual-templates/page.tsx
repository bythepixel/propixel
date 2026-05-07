import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canManageContentLibrary } from "@/lib/permissions";

export default async function BlockVisualTemplatesPage() {
  const session = await getSession();
  if (!session?.user?.id || !canManageContentLibrary(session.user.role)) {
    redirect("/library");
  }
  const templates = await prisma.blockVisualTemplate.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { blocks: true } } },
  });

  return (
    <div className="mx-auto max-w-[1440px] flex-1 px-4 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Block Visuals</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            HTML/CSS/JS wrappers around individual content blocks.
          </p>
        </div>
        <Link href="/block-visual-templates/new" className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
          New Block Visual
        </Link>
      </div>
      <ul className="mt-6 divide-y divide-zinc-200 dark:divide-zinc-800">
        {templates.map((template) => (
          <li key={template.id} className="flex items-center justify-between py-4">
            <div>
              <h2 className="font-medium text-zinc-900 dark:text-zinc-50">{template.name}</h2>
              <p className="text-xs text-zinc-500">{template._count.blocks} content blocks assigned</p>
            </div>
            <Link
              href={`/block-visual-templates/${template.id}`}
              aria-label="Edit Block Visual"
              title="Edit Block Visual"
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
