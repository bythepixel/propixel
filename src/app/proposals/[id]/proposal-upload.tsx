"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProposalUpload({ proposalId }: { proposalId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("Uploading…");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/proposals/${proposalId}/attachments`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      setStatus("Upload failed.");
      return;
    }
    setStatus("Uploaded.");
    e.target.value = "";
    router.refresh();
  }

  return (
    <div>
      <label htmlFor={`file-${proposalId}`} className="block text-sm font-medium">
        Attach file
      </label>
      <input
        id={`file-${proposalId}`}
        type="file"
        className="mt-1 block w-full text-sm"
        onChange={onChange}
      />
      {status ? <p className="mt-1 text-xs text-zinc-500">{status}</p> : null}
    </div>
  );
}
