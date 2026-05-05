import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/proposals");
  }
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Use your agency account. Demo users are created by the database seed.
      </p>
      <LoginForm />
    </div>
  );
}
