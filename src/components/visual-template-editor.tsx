"use client";

import { useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLang } from "@codemirror/lang-html";
import { css as cssLang } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import type { ProposalPdfPayload } from "@/components/proposal-pdf";
import { buildVisualTemplateDocument } from "@/lib/visual-template-render";

type Tab = "html" | "css" | "js";

export function VisualTemplateEditor(props: {
  initialHtml: string;
  initialCss: string;
  initialJs: string;
  previewData?: ProposalPdfPayload;
}) {
  const [tab, setTab] = useState<Tab>("html");
  const [html, setHtml] = useState(props.initialHtml);
  const [css, setCss] = useState(props.initialCss);
  const [js, setJs] = useState(props.initialJs);

  const value = tab === "html" ? html : tab === "css" ? css : js;
  const onChange =
    tab === "html" ? setHtml : tab === "css" ? setCss : setJs;
  const extensions =
    tab === "html" ? [htmlLang()] : tab === "css" ? [cssLang()] : [javascript({ jsx: true })];
  const previewData =
    props.previewData ??
    ({
      title: "Acme Website Redesign Proposal",
      sections: [
        {
          sectionTitle: "Discovery",
          body: "We begin with a workshop to align goals, users, and success metrics.",
        },
        {
          sectionTitle: "Delivery",
          body: "Weeks 1-2 discovery and UX, weeks 3-6 build, week 7 QA and launch.",
        },
      ],
      lineItems: [
        { label: "UX & discovery", quantity: 1, unitPrice: 3500 },
        { label: "Design + build", quantity: 1, unitPrice: 12000 },
      ],
      discountPercent: 10,
      embeds: [{ label: "Case studies", url: "https://example.com/case-studies", kind: "link" }],
    } satisfies ProposalPdfPayload);

  const previewDocument = useMemo(
    () =>
      buildVisualTemplateDocument({
        html,
        css,
        js,
        proposalData: previewData,
      }),
    [html, css, js, previewData],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
      <input type="hidden" name="html" value={html} />
      <input type="hidden" name="css" value={css} />
      <input type="hidden" name="js" value={js} />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("html")}
          className={`rounded px-3 py-1.5 text-sm ${tab === "html" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-zinc-300 dark:border-zinc-600"}`}
        >
          HTML
        </button>
        <button
          type="button"
          onClick={() => setTab("css")}
          className={`rounded px-3 py-1.5 text-sm ${tab === "css" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-zinc-300 dark:border-zinc-600"}`}
        >
          CSS
        </button>
        <button
          type="button"
          onClick={() => setTab("js")}
          className={`rounded px-3 py-1.5 text-sm ${tab === "js" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-zinc-300 dark:border-zinc-600"}`}
        >
          JS
        </button>
      </div>
      <CodeMirror
        value={value}
        height="460px"
        theme="dark"
        extensions={extensions}
        onChange={onChange}
        basicSetup={{ lineNumbers: true, foldGutter: true, autocompletion: true }}
      />
      <p className="text-xs text-zinc-500">
        Available placeholders: <code>{"{{proposal_title}}"}</code>, <code>{"{{proposal_content}}"}</code>,{" "}
        <code>{"{{proposal_json}}"}</code>, <code>{"{{visual_css}}"}</code>, <code>{"{{visual_js}}"}</code>.
      </p>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Live preview</h3>
        <iframe
          title="Visual template live preview"
          srcDoc={previewDocument}
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          className="h-[600px] w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800"
        />
      </div>
    </div>
  );
}
