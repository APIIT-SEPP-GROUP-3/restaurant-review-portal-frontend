import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your DineRate account.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Join the DineRate community and start sharing your restaurant experiences."
      alternatePrompt="Already have an account?"
      alternateLabel="Log in"
      alternateHref="/login"
    >
      <RegisterForm />
    </AuthShell>
  );
}