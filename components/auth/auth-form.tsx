"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

type AuthFormProps = {
  mode: "signin" | "signup";
  emailVerified?: boolean;
};

export function AuthForm({ mode, emailVerified = false }: AuthFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    emailVerified && mode === "signin" ? "Email verified. You can now sign in." : "",
  );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    try {
      const form = new FormData(event.currentTarget);
      const email = String(form.get("email") ?? "").trim();
      const password = String(form.get("password") ?? "");
      const name = String(form.get("name") ?? "").trim();
      const pendingInvitation = window.sessionStorage.getItem("flash-orbit-pending-invitation");
      const verificationCallback = new URL("/sign-in", window.location.origin);
      verificationCallback.searchParams.set("verified", "1");
      if (pendingInvitation) {
        verificationCallback.searchParams.set(
          "next",
          `/invitations/accept?token=${encodeURIComponent(pendingInvitation)}`,
        );
      }
      const result = mode === "signup"
        ? await authClient.signUp.email({
            email,
            password,
            name,
            callbackURL: verificationCallback.toString(),
          })
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || "Authentication failed.");
        return;
      }
      if (mode === "signin") {
        const next = new URLSearchParams(window.location.search).get("next");
        let safeNext = "/dashboard";
        if (pendingInvitation) {
          safeNext = "/invitations/accept";
        } else if (next) {
          try {
            const decoded = decodeURIComponent(next);
            const invitationRoute = new URL(decoded, window.location.origin);
            const invitationToken = invitationRoute.searchParams.get("token");
            if (
              invitationRoute.origin === window.location.origin &&
              invitationRoute.pathname === "/invitations/accept" &&
              invitationToken &&
              /^[A-Za-z0-9_-]{20,100}$/.test(invitationToken)
            ) {
              safeNext = `${invitationRoute.pathname}?token=${encodeURIComponent(invitationToken)}`;
            } else
            if (
              decoded.startsWith("/") &&
              !decoded.startsWith("//") &&
              !decoded.includes("\\") &&
              !/[?#]/.test(decoded)
            ) {
              safeNext = decoded;
            }
          } catch {
            safeNext = "/dashboard";
          }
        }
        router.replace(safeNext);
      } else {
        setNotice(
          "Check your inbox for a verification link. You can sign in once your email is verified.",
        );
      }
    } catch {
      setError("The authentication service is unavailable. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {mode === "signup" ? (
        <label>
          <span>Full name</span>
          <input name="name" autoComplete="name" required minLength={2} />
        </label>
      ) : null}
      <label>
        <span>Email address</span>
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        <span>Password</span>
        <input name="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={8} />
      </label>
      {notice ? <p className="auth-success" role="status">{notice}</p> : null}
      {error ? <p className="auth-error" role="alert">{error}</p> : null}
      <button className="auth-submit" type="submit" disabled={pending}>
        {pending ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
