import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canEditBlockDefinition, canManageContentLibrary } from "@/lib/permissions";
import { renderBlockVisualTemplateDocument } from "@/lib/block-visual-template-render";
import { parseBodyFields } from "@/lib/content-block-bodies";

export default async function BlockWrapperPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ proposalVisualTemplateId?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const session = await getSession();
  if (!session?.user?.id || !canManageContentLibrary(session.user.role)) {
    redirect("/library");
  }

  const block = await prisma.contentBlock.findUnique({
    where: { id },
    include: {
      visualTemplate: {
        select: { id: true, name: true, html: true, css: true, js: true },
      },
    },
  });
  if (!block) notFound();

  if (!canEditBlockDefinition(session.user.role, block.sensitive)) {
    return (
      <div className="mx-auto max-w-xl flex-1 px-4 py-12">
        <h1 className="text-xl font-semibold">Restricted block</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          You do not have permission to preview this sensitive block wrapper.
        </p>
      </div>
    );
  }

  if (!block.visualTemplate) {
    return (
      <div className="mx-auto max-w-xl flex-1 px-4 py-12">
        <h1 className="text-xl font-semibold">No block wrapper assigned</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Assign a Block Visual Template on this content block first.
        </p>
        <p className="mt-4">
          <Link href={`/library/${id}/edit`} className="text-blue-600 hover:underline dark:text-blue-400">
            Edit content block
          </Link>
        </p>
      </div>
    );
  }

  const proposalVisualTemplateId = (sp.proposalVisualTemplateId ?? "").trim();
  const proposalVisualTemplate = proposalVisualTemplateId
    ? await prisma.visualTemplate.findUnique({
        where: { id: proposalVisualTemplateId },
        select: { id: true, name: true, css: true, js: true },
      })
    : null;

  const previewDoc = renderBlockVisualTemplateDocument({
    html: block.visualTemplate.html,
    css: block.visualTemplate.css,
    js: block.visualTemplate.js,
    block: {
      title: block.title,
      body: block.body,
      bodyFields: parseBodyFields({ body: block.body, bodyFieldsJson: block.bodyFieldsJson }),
    },
    proposalVisualTemplate,
  });

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50 px-4 py-6 dark:bg-zinc-950">
      <div className="mx-auto mb-3 w-full max-w-6xl text-xs text-zinc-500">
        Previewing wrapper: <span className="font-medium">{block.visualTemplate.name}</span>
        {proposalVisualTemplate ? (
          <span>
            {" "}
            with proposal styles/scripts: <span className="font-medium">{proposalVisualTemplate.name}</span>
          </span>
        ) : null}
      </div>
      <div className="mx-auto h-[82vh] w-full max-w-6xl">
        <iframe
          title={`Block wrapper preview: ${block.title}`}
          srcDoc={previewDoc}
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          className="h-full w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800"
        />
      </div>
    </div>
  );
}
