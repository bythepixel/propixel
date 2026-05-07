import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canManageContentLibrary } from "@/lib/permissions";
import { deleteMediaAction } from "@/actions/media";
import { MediaUpload } from "./media-upload";
import { CopyMediaUrlButton } from "./copy-media-url-button";

export default async function MediaPage() {
  const session = await getSession();
  if (!session?.user?.id || !canManageContentLibrary(session.user.role)) {
    redirect("/library");
  }

  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-[1440px] flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold">Media</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Upload assets and use their URLs in HTML/CSS/JS templates, including CSS background images.
      </p>

      <div className="mt-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <MediaUpload />
      </div>

      <ul className="mt-6 divide-y divide-zinc-200 dark:divide-zinc-800">
        {assets.map((asset) => (
          <li key={asset.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="min-w-0">
              <p className="font-medium text-zinc-900 dark:text-zinc-50">{asset.fileName}</p>
              <a
                href={asset.storedPath}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block break-all font-mono text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                {asset.storedPath}
              </a>
              <p className="mt-1 text-xs text-zinc-500">
                {asset.mimeType ?? "Unknown type"} · {Math.max(1, Math.round(asset.sizeBytes / 1024))} KB
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CopyMediaUrlButton url={asset.storedPath} />
              <form action={deleteMediaAction.bind(null, asset.id)}>
                <button
                  type="submit"
                  aria-label="Delete media"
                  title="Delete media"
                  className="inline-flex h-8 w-8 items-center justify-center rounded border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <span aria-hidden="true">🗑</span>
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      {assets.length === 0 ? <p className="py-8 text-zinc-500">No media uploaded yet.</p> : null}
    </div>
  );
}
