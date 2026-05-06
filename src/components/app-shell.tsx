"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppNav } from "@/components/app-nav";

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { email?: string | null; role?: string } | null;
}) {
  const pathname = usePathname();
  const isProposalPreview = /^\/proposals\/[^/]+\/preview$/.test(pathname);
  const isPublicSharePage = /^\/p\/[^/]+$/.test(pathname);

  return (
    <>
      {!isProposalPreview &&
        !isPublicSharePage &&
        (user ? (
          <AppNav email={user.email} role={user.role} />
        ) : (
          <header className="border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
              <Link href="/" className="font-semibold text-zinc-900 dark:text-zinc-50">
                Proposal CMS
              </Link>
              <Link
                href="/login"
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Sign in
              </Link>
            </div>
          </header>
        ))}
      <main id="main-content" className="flex flex-1 flex-col" tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
