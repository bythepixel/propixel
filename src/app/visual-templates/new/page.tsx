import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { canManageTemplates } from "@/lib/permissions";
import { createVisualTemplateAction } from "@/actions/visual-templates";
import { VisualTemplateEditor } from "@/components/visual-template-editor";

const DEFAULT_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>{{proposal_title}}</title>
    <style>{{visual_css}}</style>
  </head>
  <body>
    <main class="proposal-shell">
      {{proposal_content}}
    </main>
    <script>window.PROPOSAL_DATA = {{proposal_json}};</script>
    <script>{{visual_js}}</script>
  </body>
</html>`;

export default async function NewVisualTemplatePage() {
  const session = await getSession();
  if (!session?.user?.id || !canManageTemplates(session.user.role)) {
    redirect("/templates");
  }

  return (
    <div className="mx-auto max-w-6xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold">New Global Visual</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        This wraps the full proposal render: Visual Template → Template → Content Blocks.
      </p>
      <form action={createVisualTemplateAction} className="mt-6 space-y-4">
        <div className="max-w-xl">
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <VisualTemplateEditor initialHtml={DEFAULT_HTML} initialCss="" initialJs="" />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Create Global Visual
        </button>
      </form>
    </div>
  );
}
