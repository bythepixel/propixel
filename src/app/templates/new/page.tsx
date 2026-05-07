import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { canManageTemplates } from "@/lib/permissions";
import { createTemplateAction } from "@/actions/templates";
import { prisma } from "@/lib/prisma";

export default async function NewTemplatePage() {
  const session = await getSession();
  if (!session?.user?.id || !canManageTemplates(session.user.role)) {
    redirect("/templates");
  }
  const visualTemplates = await prisma.visualTemplate.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-[1440px] flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold">New template</h1>
      <form action={createTemplateAction} className="mt-8 flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="e.g. Website build"
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description / governance notes
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
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
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Create template
        </button>
      </form>
    </div>
  );
}
