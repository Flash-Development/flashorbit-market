import "server-only";
import { Resend } from "resend";
import { createLogger } from "@/lib/logging/logger";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

export async function sendWorkspaceInvitation(input: {
  email: string;
  workspaceName: string;
  role: string;
  url: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Invitation email is not configured.");
  const logger = createLogger({
    component: "workspace-invitation",
    recipientDomain: input.email.split("@").at(-1)?.toLowerCase() ?? "unknown",
  });
  const workspaceName = escapeHtml(input.workspaceName);
  const role = escapeHtml(input.role);
  const url = escapeHtml(input.url);
  const result = await new Resend(apiKey).emails.send({
    from,
    to: input.email,
    subject: `Invitation to join ${input.workspaceName.replace(/[\r\n]/g, " ")} on Flash Orbit`,
    html: `<p>You have been invited to join <strong>${workspaceName}</strong> as ${role}.</p><p><a href="${url}">Accept invitation</a></p><p>This link expires in 7 days.</p>`,
    text: `You have been invited to join ${input.workspaceName} as ${input.role}. Accept: ${input.url} (expires in 7 days)`,
  }, { signal: AbortSignal.timeout(10_000) });
  if (result.error) {
    logger.error("Workspace invitation email failed", {
      statusCode: result.error.statusCode,
      code: result.error.name,
    });
    throw new Error("Invitation email could not be sent.");
  }
  logger.info("Workspace invitation email accepted", { emailId: result.data.id });
}
