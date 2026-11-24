import "server-only";
import type { IdentityProvider } from "@/lib/auth/identity";
import { DevelopmentIdentityProvider } from "@/lib/auth/development-identity";

const provider: IdentityProvider = new DevelopmentIdentityProvider();

export async function requireDevelopmentIdentity() {
  const identity = await provider.getIdentity();
  if (!identity) {
    throw new Error("No authenticated development identity.");
  }
  return identity;
}
