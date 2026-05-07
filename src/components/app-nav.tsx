"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export function AppNav({
  email,
  role,
}: {
  email?: string | null;
  role?: string;
}) {
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function closeAllDropdowns() {
      const details = navRef.current?.querySelectorAll("details");
      details?.forEach((node) => {
        node.open = false;
      });
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!navRef.current?.contains(target)) {
        closeAllDropdowns();
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeAllDropdowns();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="font-semibold text-zinc-900 dark:text-zinc-50">
            Proposal CMS
          </Link>
          <nav ref={navRef} aria-label="Primary" className="flex flex-wrap items-center gap-2 text-sm">
            <details className="group relative">
              <summary className="cursor-pointer list-none rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900">
                Proposals
              </summary>
              <div className="absolute left-0 top-full z-20 mt-1 min-w-44 rounded-md border border-zinc-200 bg-white p-1 shadow-md dark:border-zinc-700 dark:bg-zinc-900">
                <Link className="block rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800" href="/proposals">
                  Proposals
                </Link>
                <Link className="block rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800" href="/templates">
                  Templates
                </Link>
              </div>
            </details>

            <details className="group relative">
              <summary className="cursor-pointer list-none rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900">
                Content
              </summary>
              <div className="absolute left-0 top-full z-20 mt-1 min-w-44 rounded-md border border-zinc-200 bg-white p-1 shadow-md dark:border-zinc-700 dark:bg-zinc-900">
                <Link className="block rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800" href="/library">
                  Blocks
                </Link>
                <Link className="block rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800" href="/media">
                  Media
                </Link>
                <Link className="block rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800" href="/global-variables">
                  Global Variables
                </Link>
              </div>
            </details>

            <details className="group relative">
              <summary className="cursor-pointer list-none rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900">
                Visuals
              </summary>
              <div className="absolute left-0 top-full z-20 mt-1 min-w-52 rounded-md border border-zinc-200 bg-white p-1 shadow-md dark:border-zinc-700 dark:bg-zinc-900">
                <Link className="block rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800" href="/block-visual-templates">
                  Block Visuals
                </Link>
                <Link className="block rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800" href="/visual-templates">
                  Global Visuals
                </Link>
              </div>
            </details>
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
