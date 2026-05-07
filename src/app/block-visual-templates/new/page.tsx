import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { canManageContentLibrary } from "@/lib/permissions";
import { createBlockVisualTemplateAction } from "@/actions/block-visual-templates";
import { BlockVisualTemplateEditor } from "@/components/block-visual-template-editor";
import { prisma } from "@/lib/prisma";

const DEFAULT_BLOCK_HTML = `<style>{{block_css}}</style>
<div class="content-block-shell">
  <h3>{{block_title}}</h3>
  {body_1}
</div>
<script>{{block_js}}</script>`;

export default async function NewBlockVisualTemplatePage() {
  const session = await getSession();
  if (!session?.user?.id || !canManageContentLibrary(session.user.role)) {
    redirect("/library");
  }
  const proposalVisualTemplates = await prisma.visualTemplate.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, css: true, js: true },
  });
  return (
    <div className="mx-auto max-w-[1440px] flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold">New Block Visual</h1>
      <form action={createBlockVisualTemplateAction} className="mt-6 space-y-4">
        <div className="max-w-xl">
          <label htmlFor="name" className="block text-sm font-medium">Name</label>
          <input id="name" name="name" required className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900" />
        </div>
        <BlockVisualTemplateEditor
          initialHtml={DEFAULT_BLOCK_HTML}
          initialCss=""
          initialJs=""
          proposalVisualTemplates={proposalVisualTemplates}
        />
        <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
          Create Block Visual
        </button>
      </form>
    </div>
  );
}
