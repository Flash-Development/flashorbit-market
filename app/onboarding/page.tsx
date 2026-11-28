import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import {
  getActiveWorkspaceContext,
  getAuthenticatedWorkspaceContext,
  recoverStaleWorkspaceSelection,
} from "@/lib/workspaces/onboarding";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { createLogger } from "@/lib/logging/logger";

export default async function OnboardingPage() {
  const logger = createLogger({ component: "onboarding-page" });
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) {
    logger.warn("Onboarding access denied");
    redirect("/sign-in");
  }
  const workspaces = await getAuthenticatedWorkspaceContext(
    authenticated.localUser.id,
  );
  if (workspaces.length > 0) {
    const activeWorkspace = await getActiveWorkspaceContext(authenticated.localUser.id);
    if (!activeWorkspace) {
      await recoverStaleWorkspaceSelection(authenticated.localUser.id, workspaces);
    }
    logger.info("Onboarding skipped because a workspace already exists");
    redirect("/dashboard");
  }
  logger.info("Onboarding rendered");
  return (
    <main className="onboarding-page">
      <section className="onboarding-card">
        <span className="auth-eyebrow">Workspace setup</span>
        <h1>Create your first business</h1>
        <p>Your workspace will start with Nigeria, NGN and Africa/Lagos defaults.</p>
        <OnboardingForm />
      </section>
    </main>
  );
}
