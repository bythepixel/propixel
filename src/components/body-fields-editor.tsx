"use client";

import { useState } from "react";
import { HtmlEditorField } from "@/components/html-editor-field";

export function BodyFieldsEditor({ initialFields }: { initialFields?: string[] }) {
  const [fields, setFields] = useState<string[]>(
    initialFields && initialFields.length > 0 ? initialFields : [""],
  );

  return (
    <div className="space-y-3">
      {fields.map((field, idx) => (
        <div key={idx} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Body field {idx + 1}</label>
            {fields.length > 1 ? (
              <button
                type="button"
                className="text-xs text-red-600 hover:underline dark:text-red-400"
                onClick={() => setFields((prev) => prev.filter((_, i) => i !== idx))}
              >
                Remove
              </button>
            ) : null}
          </div>
          <HtmlEditorField name="bodyFields" initialValue={field} />
        </div>
      ))}
      <button
        type="button"
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
        onClick={() => setFields((prev) => [...prev, ""])}
      >
        Add body field
      </button>
    </div>
  );
}
