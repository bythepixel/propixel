"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MediaUpload() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("Uploading...");

    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/media", { method: "POST", body: formData });

    if (!response.ok) {
      setStatus("Upload failed.");
      return;
    }

    setStatus("Uploaded.");
    event.target.value = "";
    router.refresh();
  }

  return (
    <div>
      <label htmlFor="media-upload" className="block text-sm font-medium">
        Upload image or document
      </label>
      <input id="media-upload" type="file" className="mt-1 block w-full text-sm" onChange={onChange} />
      {status ? <p className="mt-1 text-xs text-zinc-500">{status}</p> : null}
    </div>
  );
}
