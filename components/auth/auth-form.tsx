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
  const [verificationEmail, setVerificationEmail] = useState("");

  async function requestVerificationEmail(
    email: string,
    successMessage: string,
    failureMessage: string,
  ) {
    try {
      const callbackURL = `${window.location.origin}/sign-in?verified=1`;
      const result = await authClient.sendVerificationEmail({ email, callbackURL });
      if (result.error) {
        setError(
          result.error.status === 503
            ? "Email delivery is temporarily unavailable. Your account is saved; please try again shortly."
            : failureMessage,
        );
        return;
      }
      setError("");
      setNotice(successMessage);
    } catch {
      setError(failureMessage);
    }
  }

  async function resendVerificationEmail() {
    if (!verificationEmail) return;
    setPending(true);
    setError("");
    setNotice("");
    try {
      await requestVerificationEmail(
        verificationEmail,
        "A new verification link was requested. Check your inbox.",
        "We couldn't send another verification link. Please try again later.",
      );
    } finally {
      setPending(false);
    }
  }

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
      const result = mode === "signup"
        ? await authClient.signUp.email({
            email,
            password,
            name,
            callbackURL: `${window.location.origin}/sign-in?verified=1`,
          })
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || "Authentication failed.");
        return;
      }
      if (mode === "signin") {
        const next = new URLSearchParams(window.location.search).get("next");
        let safeNext = "/dashboard";
        if (next) {
          try {
            const decoded = decodeURIComponent(next);
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
        setVerificationEmail(email);
        await requestVerificationEmail(
          email,
          "Check your inbox for a verification link. If it doesn't arrive, request another below.",
          "Your account is saved, but we couldn't send a verification link. Please try again below.",
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
      {verificationEmail ? (
        <button
          className="auth-resend"
          type="button"
          onClick={resendVerificationEmail}
          disabled={pending}
        >
          Resend verification email
        </button>
      ) : null}
    </form>
  );
}
