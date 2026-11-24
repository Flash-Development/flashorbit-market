import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/better-auth";
import { synchronizeApplicationUser } from "@/lib/auth/sync-user";

export async function requireAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.email || !session.user.emailVerified) return null;
  const localUser = await synchronizeApplicationUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name || "",
    emailVerified: Boolean(session.user.emailVerified),
  });
  if (localUser.status !== "ACTIVE") return null;
  return { authUser: session.user, localUser };
}
