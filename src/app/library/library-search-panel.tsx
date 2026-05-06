"use client";

import { useState } from "react";

type Option = { id: string; name: string };

export function LibrarySearchPanel({
  q,
  categoryId,
  tagId,
  categories,
  tags,
}: {
  q: string;
  categoryId: string;
  tagId: string;
  categories: Option[];
  tags: Option[];
}) {
  const [open, setOpen] = useState(Boolean(q || categoryId || tagId));

  return (
    <div className="mt-6 border-b border-zinc-200 pb-6 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-900"
      >
        Search
      </button>

      {open ? (
        <form className="mt-3 flex flex-wrap gap-3" role="search">
          <div>
            <label htmlFor="q" className="sr-only">
              Keyword
            </label>
            <input
              id="q"
              name="q"
              type="search"
              placeholder="Keyword"
              defaultValue={q}
              className="w-48 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label htmlFor="category" className="sr-only">
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={categoryId}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tag" className="sr-only">
              Tag
            </label>
            <select
              id="tag"
              name="tag"
              defaultValue={tagId}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            >
              <option value="">All tags</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-900"
          >
            Apply
          </button>
        </form>
      ) : null}
    </div>
  );
}
