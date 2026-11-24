import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import { getTrustedOrigins } from "@/lib/auth/trusted-origins";
import { sendVerificationEmail } from "@/lib/email/resend";

let secret = process.env.BETTER_AUTH_SECRET;
const isProductionBuild =
  process.env.NEXT_PHASE === "phase-production-build";
let baseURL = process.env.BETTER_AUTH_URL;
if (!baseURL && isProductionBuild) {
  baseURL = "http://127.0.0.1:3000";
}
if (!baseURL) {
  throw new Error("BETTER_AUTH_URL must be configured.");
}
if ((!secret || secret.length < 32) && isProductionBuild) {
  secret = "flash-build-placeholder-secret-32chars";
}
if (!secret || secret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters.");
}

export const auth = betterAuth({
  baseURL,
  secret,
  trustedOrigins: getTrustedOrigins,
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
  },
  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: false,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        url,
      });
    },
  },
  plugins: [nextCookies()],
});
