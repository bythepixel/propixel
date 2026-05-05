"use client";

export function VisualTemplatePreview({
  documentHtml,
  title,
}: {
  documentHtml: string;
  title: string;
}) {
  return (
    <iframe
      title={title}
      srcDoc={documentHtml}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      className="h-[72vh] w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800"
    />
  );
}
