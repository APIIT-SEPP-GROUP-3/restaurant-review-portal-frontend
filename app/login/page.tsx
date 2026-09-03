import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your DineRate account.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Log in to continue discovering restaurants and sharing your dining experiences."
      alternatePrompt="Do not have an account?"
      alternateLabel="Create an account"
      alternateHref="/register"
    >
      <LoginForm />
    </AuthShell>
  );
}