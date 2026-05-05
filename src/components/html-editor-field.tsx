"use client";

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLang } from "@codemirror/lang-html";

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

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={value} />
      <CodeMirror
        value={value}
        height={height}
        theme="dark"
        extensions={[htmlLang()]}
        onChange={setValue}
        basicSetup={{ lineNumbers: true, foldGutter: true, autocompletion: true }}
      />
      <p className="text-xs text-zinc-500">
        HTML is stored as-is and rendered in proposal previews.
      </p>
    </div>
  );
}
