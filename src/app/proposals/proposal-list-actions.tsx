"use client";

import Link from "next/link";
import type { ProposalPdfPayload } from "@/components/proposal-pdf";
import { ProposalPdfDownload } from "@/components/proposal-pdf";

export function ProposalListActions({
  proposalId,
  pdfData,
}: {
  proposalId: string;
  pdfData: ProposalPdfPayload;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Link
        href={`/proposals/${proposalId}/preview`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Preview proposal"
        title="Preview proposal"
        className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-900"
      >
        <span aria-hidden="true">👁</span>
      </Link>
      <Link
        href={`/proposals/${proposalId}/preview?print=1`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Print proposal"
        title="Print proposal"
        className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-900"
      >
        <span aria-hidden="true">🖨</span>
      </Link>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-300 text-blue-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-blue-300 dark:hover:bg-zinc-900">
        <ProposalPdfDownload
          data={pdfData}
          ariaLabel="Download proposal PDF"
          label={<span aria-hidden="true">⬇</span>}
        />
      </span>
    </div>
  );
}
