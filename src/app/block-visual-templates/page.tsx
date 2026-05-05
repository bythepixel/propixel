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
    <div className="mx-auto max-w-5xl flex-1 px-4 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Block visual templates</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            HTML/CSS/JS wrappers around individual content blocks.
          </p>
        </div>
        <Link href="/block-visual-templates/new" className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
          New block visual template
        </Link>
      </div>
      <ul className="mt-6 divide-y divide-zinc-200 dark:divide-zinc-800">
        {templates.map((template) => (
          <li key={template.id} className="py-4">
            <Link href={`/block-visual-templates/${template.id}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              {template.name}
            </Link>
            <p className="text-xs text-zinc-500">{template._count.blocks} content blocks assigned</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
