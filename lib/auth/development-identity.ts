import type { IdentityProvider } from "@/lib/auth/identity";

export class DevelopmentIdentityProvider implements IdentityProvider {
  async getIdentity() {
    if (process.env.NODE_ENV === "production") return null;
    if (process.env.FLASH_DEV_IDENTITY !== "1") return null;
    const userId = process.env.FLASH_DEV_USER_ID;
    const email = process.env.FLASH_DEV_USER_EMAIL;
    if (!userId || !email) return null;
    return {
      userId,
      email,
      provider: "development" as const,
      providerSubject: userId,
    };
  }
}
