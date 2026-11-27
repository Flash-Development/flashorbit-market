"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const storageKey = "flash-orbit-pending-invitation";

export function InvitationAcceptance({ token: initialToken }: { token: string }) {
  const [status, setStatus] = useState("Checking your invitation…");
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = initialToken || window.sessionStorage.getItem(storageKey) || "";
    let active = true;
    if (!token) {
      void Promise.resolve().then(() => {
        if (active) setStatus("This invitation link is missing its token.");
      });
      return () => { active = false; };
    }
    window.sessionStorage.setItem(storageKey, token);
    window.history.replaceState(null, "", "/invitations/accept");
    void fetch("/api/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(async (response) => {
      const result = await response.json();
      if (!active) return;
      if (response.status === 401) {
        setNeedsSignIn(true);
        setStatus("Sign in or create an account with the invited email address to continue.");
        return;
      }
      if (!response.ok) throw new Error(result.error || "Invitation could not be accepted.");
      window.sessionStorage.removeItem(storageKey);
      setStatus("Invitation accepted. Opening your workspace…");
      router.replace("/dashboard");
    }).catch((error: unknown) => {
      if (active) setStatus(error instanceof Error ? error.message : "Invitation could not be accepted.");
    });
    return () => { active = false; };
  }, [initialToken, router]);

  return (
    <main className="onboarding-page">
      <section className="onboarding-card" aria-labelledby="invitation-heading">
        <span className="auth-eyebrow">Workspace invitation</span>
        <h1 id="invitation-heading">Join your team</h1>
        <p role="status">{status}</p>
        {needsSignIn ? (
          <div className="invitation-auth-links">
            <Link className="auth-submit" href="/sign-in">Sign in</Link>
            <Link href="/sign-up">Create an account</Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
