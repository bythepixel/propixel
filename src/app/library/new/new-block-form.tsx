"use client";

import { useState } from "react";
import { BodyFieldsEditor } from "@/components/body-fields-editor";

type Option = { id: string; name: string };
type VisualOption = { id: string; name: string; bodyFieldCount: number };

export function NewBlockForm({
  createAction,
  categories,
  tags,
  blockVisualTemplates,
}: {
  createAction: (formData: FormData) => void | Promise<void>;
  categories: Option[];
  tags: Option[];
  blockVisualTemplates: VisualOption[];
}) {
  const [selectedVisualId, setSelectedVisualId] = useState("");
  const visualSelected = selectedVisualId !== "";

  return (
    <form action={createAction} className="mt-8 flex flex-col gap-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
        />
      </div>

      <div>
        <label htmlFor="visualTemplateId" className="block text-sm font-medium">
          Block Visual
        </label>
        <select
          id="visualTemplateId"
          name="visualTemplateId"
          required
          value={selectedVisualId}
          onChange={(event) => setSelectedVisualId(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
        >
          <option value="">Select a Block Visual</option>
          {blockVisualTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name} ({template.bodyFieldCount} bodies)
            </option>
          ))}
        </select>
      </div>

      {visualSelected ? (
        <>
          <div>
            <p className="block text-sm font-medium">Body fields (HTML)</p>
            <div className="mt-1">
              <BodyFieldsEditor />
            </div>
          </div>
          <div>
            <label htmlFor="usageGuidance" className="block text-sm font-medium">
              Usage guidance
            </label>
            <textarea
              id="usageGuidance"
              name="usageGuidance"
              rows={3}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <fieldset>
            <legend className="text-sm font-medium">Tags</legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {tags.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="tagIds" value={t.id} />
                  {t.name}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="sensitive" />
            Sensitive (pricing / legal — visible to Approver, Publisher, Admin)
          </label>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Create block
          </button>
        </>
      ) : null}
    </form>
  );
}
