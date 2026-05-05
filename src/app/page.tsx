import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="mx-auto max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Proposal CMS (Phase 1)</h1>
      <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
        Create proposals from templates and reusable blocks, manage pricing, export PDFs, and share a
        read-only link with clients.
      </p>
      {session ? (
        <ul className="mt-8 flex flex-col gap-3 text-base">
          <li>
            <Link className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400" href="/proposals">
              Open proposals
            </Link>
          </li>
          <li>
            <Link className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400" href="/library">
              Content library
            </Link>
          </li>
          <li>
            <Link className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400" href="/templates">
              Templates
            </Link>
          </li>
        </ul>
      ) : (
        <p className="mt-8 text-zinc-600 dark:text-zinc-400">
          <Link href="/login" className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400">
            Sign in
          </Link>
          . After <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">npm run db:seed</code>, use any{" "}
          <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">*@demo.local</code> address with password{" "}
          <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">password123</code>.
        </p>
      )}
    </div>
  );
}
