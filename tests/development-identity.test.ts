import assert from "node:assert/strict";
import test from "node:test";
import { DevelopmentIdentityProvider } from "../lib/auth/development-identity";

test("development identity is unavailable in production", async () => {
  const previous = {
    nodeEnv: process.env.NODE_ENV,
    enabled: process.env.FLASH_DEV_IDENTITY,
    userId: process.env.FLASH_DEV_USER_ID,
    email: process.env.FLASH_DEV_USER_EMAIL,
  };
  Object.assign(process.env, {
    NODE_ENV: "production",
    FLASH_DEV_IDENTITY: "1",
    FLASH_DEV_USER_ID: "qa-development-user",
    FLASH_DEV_USER_EMAIL: "qa-development@flash.test",
  });
  try {
    assert.equal(
      await new DevelopmentIdentityProvider().getIdentity(),
      null,
    );
  } finally {
    if (previous.nodeEnv === undefined) {
      Reflect.deleteProperty(process.env, "NODE_ENV");
    } else {
      Object.assign(process.env, { NODE_ENV: previous.nodeEnv });
    }
    if (previous.enabled === undefined) delete process.env.FLASH_DEV_IDENTITY;
    else process.env.FLASH_DEV_IDENTITY = previous.enabled;
    if (previous.userId === undefined) delete process.env.FLASH_DEV_USER_ID;
    else process.env.FLASH_DEV_USER_ID = previous.userId;
    if (previous.email === undefined) delete process.env.FLASH_DEV_USER_EMAIL;
    else process.env.FLASH_DEV_USER_EMAIL = previous.email;
  }
});
