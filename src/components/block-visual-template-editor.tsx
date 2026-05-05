"use client";

import { useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLang } from "@codemirror/lang-html";
import { css as cssLang } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { renderBlockVisualTemplateDocument } from "@/lib/block-visual-template-render";
import { detectBodyFieldCount } from "@/lib/block-visual-template-tokens";

type Tab = "html" | "css" | "js";

export function BlockVisualTemplateEditor(props: {
  initialHtml: string;
  initialCss: string;
  initialJs: string;
  sampleBlock?: { title: string; body: string };
  storedBodyFieldCount?: number;
  proposalVisualTemplates?: { id: string; name: string; css: string; js: string }[];
}) {
  const [tab, setTab] = useState<Tab>("html");
  const [html, setHtml] = useState(props.initialHtml);
  const [css, setCss] = useState(props.initialCss);
  const [js, setJs] = useState(props.initialJs);
  const [proposalTemplateId, setProposalTemplateId] = useState("");
  const value = tab === "html" ? html : tab === "css" ? css : js;
  const onChange = tab === "html" ? setHtml : tab === "css" ? setCss : setJs;
  const extensions =
    tab === "html" ? [htmlLang()] : tab === "css" ? [cssLang()] : [javascript({ jsx: true })];
  const previewDoc = useMemo(
    () =>
      renderBlockVisualTemplateDocument({
        html,
        css,
        js,
        proposalVisualTemplate:
          props.proposalVisualTemplates?.find((template) => template.id === proposalTemplateId) ??
          null,
        block:
          props.sampleBlock ?? {
            title: "Example content block",
            body: "This reusable block can now be wrapped with custom HTML, CSS, and JavaScript.",
          },
      }),
    [html, css, js, props.sampleBlock, props.proposalVisualTemplates, proposalTemplateId],
  );
  const detectedBodyFieldCount = useMemo(() => detectBodyFieldCount(html), [html]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <input type="hidden" name="html" value={html} />
        <input type="hidden" name="css" value={css} />
        <input type="hidden" name="js" value={js} />
        <div className="flex flex-wrap gap-2">
          {(["html", "css", "js"] as const).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setTab(name)}
              className={`rounded px-3 py-1.5 text-sm ${tab === name ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-zinc-300 dark:border-zinc-600"}`}
            >
              {name.toUpperCase()}
            </button>
          ))}
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
          Placeholders: <code>{"{{block_title}}"}</code>, <code>{"{{block_json}}"}</code>,{" "}
          <code>{"{{block_css}}"}</code>, <code>{"{{block_js}}"}</code>,{" "}
          <code>{"{body_1}"}</code>, <code>{"{body_2}"}</code>, etc. In block JS, use{" "}
          <code>BLOCK_DATA</code> and <code>BLOCK_ROOT</code> (scoped per block).
        </p>
        <p className="text-xs text-zinc-500">
          Referenced body fields: <span className="font-medium">{detectedBodyFieldCount}</span>
          {props.storedBodyFieldCount !== undefined ? (
            <span> (stored: {props.storedBodyFieldCount})</span>
          ) : null}
        </p>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium">Live block preview</h3>
        <div className="mb-3">
          <label htmlFor="proposalTemplateId" className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Include proposal visual template CSS/JS
          </label>
          <select
            id="proposalTemplateId"
            value={proposalTemplateId}
            onChange={(e) => setProposalTemplateId(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          >
            <option value="">None</option>
            {(props.proposalVisualTemplates ?? []).map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
        <iframe
          title="Block visual template preview"
          srcDoc={previewDoc}
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          className="h-[600px] w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800"
        />
      </div>
    </div>
  );
}
