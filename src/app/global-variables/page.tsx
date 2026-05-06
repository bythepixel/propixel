import { redirect } from "next/navigation";
import { deleteGlobalVariableAction, upsertGlobalVariableAction } from "@/actions/global-variables";
import { prisma } from "@/lib/prisma";
import { canManageContentLibrary } from "@/lib/permissions";
import { getSession } from "@/lib/session";
import { VARIABLE_TOKEN_HELP } from "@/lib/variable-tokens";

export default async function GlobalVariablesPage() {
  const session = await getSession();
  if (!session?.user?.id || !canManageContentLibrary(session.user.role)) {
    redirect("/library");
  }

  const variables = await prisma.globalVariable.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold">Global Variables</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Global values available to all proposals. {VARIABLE_TOKEN_HELP}
      </p>

      <div className="mt-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-medium">Add variable</h2>
        <form action={upsertGlobalVariableAction} className="mt-3 flex flex-wrap items-end gap-2">
          <div>
            <label htmlFor="new-var-name" className="block text-xs text-zinc-500">
              Name
            </label>
            <input
              id="new-var-name"
              name="name"
              placeholder="company_name"
              required
              className="mt-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            />
          </div>
          <div className="min-w-[260px] flex-1">
            <label htmlFor="new-var-value" className="block text-xs text-zinc-500">
              Value
            </label>
            <input
              id="new-var-value"
              name="value"
              placeholder="Acme Studio"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            />
          </div>
          <button type="submit" className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
            Save
          </button>
        </form>
      </div>

      <ul className="mt-6 divide-y divide-zinc-200 dark:divide-zinc-800">
        {variables.map((variable) => (
          <li key={variable.id} className="py-4">
            <form action={upsertGlobalVariableAction} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="variableId" value={variable.id} />
              <div>
                <label htmlFor={`name-${variable.id}`} className="block text-xs text-zinc-500">
                  Name
                </label>
                <input
                  id={`name-${variable.id}`}
                  name="name"
                  required
                  defaultValue={variable.name}
                  className="mt-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <div className="min-w-[260px] flex-1">
                <label htmlFor={`value-${variable.id}`} className="block text-xs text-zinc-500">
                  Value
                </label>
                <input
                  id={`value-${variable.id}`}
                  name="value"
                  defaultValue={variable.value}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <button type="submit" className="rounded border border-zinc-300 px-3 py-2 text-xs dark:border-zinc-600">
                Save
              </button>
            </form>
            <form action={deleteGlobalVariableAction.bind(null, variable.id)} className="mt-2">
              <button type="submit" className="text-xs text-red-600 hover:underline dark:text-red-400">
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>
      {variables.length === 0 ? <p className="py-6 text-zinc-500">No global variables yet.</p> : null}
    </div>
  );
}
