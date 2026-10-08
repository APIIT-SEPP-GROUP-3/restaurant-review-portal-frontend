import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your DineRate account.",
};

type SearchParamValue = string | string[] | undefined;

interface LoginPageProps {
  searchParams: Promise<Record<string, SearchParamValue>>;
}

function safeReturnPath(value: SearchParamValue): string {
  const path = Array.isArray(value) ? value[0] : value;

  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }

  return path;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const returnPath = safeReturnPath(query.next);

  return (
    <AuthShell
      title="Welcome back"
      description="Log in to continue discovering restaurants and sharing your dining experiences."
      alternatePrompt="Do not have an account?"
      alternateLabel="Create an account"
      alternateHref="/register"
    >
      <LoginForm returnPath={returnPath} />
    </AuthShell>
  );
}
