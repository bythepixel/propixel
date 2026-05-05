"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function AppNav({
  email,
  role,
}: {
  email?: string | null;
  role?: string;
}) {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="font-semibold text-zinc-900 dark:text-zinc-50">
            Proposal CMS
          </Link>
          <nav aria-label="Primary" className="flex flex-wrap gap-3 text-sm">
            <Link className="text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300" href="/library">
              Content library
            </Link>
            <Link className="text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300" href="/block-visual-templates">
              Block visual templates
            </Link>
            <Link className="text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300" href="/templates">
              Templates
            </Link>
            <Link className="text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300" href="/visual-templates">
              Visual templates
            </Link>
            <Link className="text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300" href="/proposals">
              Proposals
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="hidden sm:inline">
            {email}
            {role ? (
              <span className="ml-2 rounded bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                {role}
              </span>
            ) : null}
          </span>
          <button
            type="button"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-900"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
