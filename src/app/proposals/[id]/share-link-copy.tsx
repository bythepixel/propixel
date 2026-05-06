"use client";

import { useState } from "react";

export function ShareLinkCopy({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="mt-1 block break-all rounded border border-zinc-300 bg-zinc-50 px-2 py-1 text-left font-mono text-zinc-900 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      title="Click to copy"
      aria-label="Copy share link"
    >
      {url}
      {copied ? <span className="ml-2 text-xs text-green-600 dark:text-green-400">Copied</span> : null}
    </button>
  );
}
