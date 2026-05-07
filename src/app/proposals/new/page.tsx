import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canCreateProposal } from "@/lib/permissions";
import { createProposalAction } from "@/actions/proposals";

export default async function NewProposalPage() {
  const session = await getSession();
  if (!session?.user?.id || !canCreateProposal(session.user.role)) {
    redirect("/proposals");
  }

  const templates = await prisma.template.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-[1440px] flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold">New proposal</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Start from a template to copy its default sections, or leave blank and add blocks manually.
      </p>
      <form action={createProposalAction} className="mt-8 flex flex-col gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Proposal title
          </label>
          <input
            id="title"
            name="title"
            required
            placeholder="Acme — Website redesign"
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label htmlFor="templateId" className="block text-sm font-medium">
            Template
          </label>
          <select
            id="templateId"
            name="templateId"
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          >
            <option value="">Blank proposal</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Create
        </button>
      </form>
      <p className="mt-8">
        <Link href="/proposals" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          Cancel
        </Link>
      </p>
    </div>
  );
}
