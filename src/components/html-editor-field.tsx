"use client";

import { useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLang } from "@codemirror/lang-html";
import type { EditorView } from "@codemirror/view";

type TagButton = {
  label: string;
  title: string;
  wrap?: [string, string];
  insert?: string;
};

const TAG_BUTTONS: TagButton[] = [
  { label: "H1", title: "Wrap with h1", wrap: ["<h1>", "</h1>"] },
  { label: "H2", title: "Wrap with h2", wrap: ["<h2>", "</h2>"] },
  { label: "H3", title: "Wrap with h3", wrap: ["<h3>", "</h3>"] },
  { label: "H4", title: "Wrap with h4", wrap: ["<h4>", "</h4>"] },
  { label: "H5", title: "Wrap with h5", wrap: ["<h5>", "</h5>"] },
  { label: "H6", title: "Wrap with h6", wrap: ["<h6>", "</h6>"] },
  { label: "P", title: "Wrap with paragraph", wrap: ["<p>", "</p>"] },
  { label: "UL", title: "Insert unordered list", insert: "<ul>\n  <li>Item</li>\n</ul>" },
  { label: "OL", title: "Insert ordered list", insert: "<ol>\n  <li>Item</li>\n</ol>" },
  { label: "B", title: "Wrap with strong", wrap: ["<strong>", "</strong>"] },
  { label: "I", title: "Wrap with emphasis", wrap: ["<em>", "</em>"] },
  { label: "U", title: "Wrap with underline", wrap: ["<u>", "</u>"] },
  { label: "A", title: "Insert link", insert: '<a href="https://">Link text</a>' },
  { label: "IMG", title: "Insert image", insert: '<img src="https://example.com/image.jpg" alt="" />' },
  { label: "BR", title: "Insert line break", insert: "<br />" },
  { label: "HR", title: "Insert horizontal rule", insert: "<hr />" },
];

export function HtmlEditorField({
  name,
  initialValue,
  height = "280px",
}: {
  name: string;
  initialValue?: string;
  height?: string;
}) {
  const [value, setValue] = useState(initialValue ?? "");
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const disabled = useMemo(() => editorView === null, [editorView]);

  function applyTag(button: TagButton) {
    if (!editorView) return;
    const selection = editorView.state.selection.main;
    const selectedText = editorView.state.doc.sliceString(selection.from, selection.to);

    if (button.wrap) {
      const [open, close] = button.wrap;
      const wrapped = `${open}${selectedText || "Text"}${close}`;
      editorView.dispatch({
        changes: { from: selection.from, to: selection.to, insert: wrapped },
        selection: {
          anchor: selection.from + open.length,
          head: selection.from + open.length + (selectedText || "Text").length,
        },
      });
      editorView.focus();
      return;
    }

    if (button.insert) {
      editorView.dispatch({
        changes: { from: selection.from, to: selection.to, insert: button.insert },
        selection: { anchor: selection.from + button.insert.length },
      });
      editorView.focus();
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap gap-1">
        {TAG_BUTTONS.map((button) => (
          <button
            key={button.label}
            type="button"
            title={button.title}
            aria-label={button.title}
            disabled={disabled}
            onClick={() => applyTag(button)}
            className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {button.label}
          </button>
        ))}
      </div>
      <CodeMirror
        value={value}
        height={height}
        theme="dark"
        extensions={[htmlLang()]}
        onChange={setValue}
        onCreateEditor={setEditorView}
        basicSetup={{ lineNumbers: true, foldGutter: true, autocompletion: true }}
      />
      <p className="text-xs text-zinc-500">
        HTML is stored as-is and rendered in proposal previews.
      </p>
    </div>
  );
}
