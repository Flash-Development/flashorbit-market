"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function OnboardingForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          slug: String(form.get("slug") ?? ""),
        }),
      });
      let result: { error?: string };
      try {
        result = await response.json();
      } catch {
        result = { error: "The server returned an invalid response." };
      }
      if (!response.ok) {
        setError(result.error || "Workspace creation failed.");
        return;
      }
      router.replace("/dashboard");
    } catch {
      setError("The workspace service is unavailable. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>
        <span>Business name</span>
        <input name="name" required minLength={2} maxLength={100} placeholder="Lagos Goods" />
      </label>
      <label>
        <span>Preferred workspace URL</span>
        <div className="slug-input">
          <span>flash.app/</span>
          <input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="lagos-goods" />
        </div>
      </label>
      {error ? <p className="auth-error" role="alert">{error}</p> : null}
      <button className="auth-submit" type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create workspace"}
      </button>
    </form>
  );
}
