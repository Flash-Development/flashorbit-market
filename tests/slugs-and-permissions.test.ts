import assert from "node:assert/strict";
import test from "node:test";
import {
  assertAvailableWorkspaceSlug,
  generateWorkspaceSlug,
  normalizeWorkspaceSlug,
} from "../lib/workspaces/slugs";
import { roleCan } from "../lib/authz/permissions";

test("workspace slugs normalize and reserved names are rejected", () => {
  assert.equal(normalizeWorkspaceSlug("Flash Orbit Store")?.success, true);
  assert.deepEqual(
    assertAvailableWorkspaceSlug("admin"),
    { success: false, error: "This workspace slug is reserved." },
  );
  assert.deepEqual(
    assertAvailableWorkspaceSlug("flash-orbit"),
    { success: false, error: "This workspace slug is reserved." },
  );
  assert.equal(generateWorkspaceSlug("Lagos Goods"), "lagos-goods");
});

test("permission matrix denies owner-only actions from staff", () => {
  assert.equal(roleCan("OWNER", "workspace:delete"), true);
  assert.equal(roleCan("ADMIN", "workspace:delete"), false);
  assert.equal(roleCan("MANAGER", "membership:update"), false);
  assert.equal(roleCan("STAFF", "workspace:update"), false);
  assert.equal(roleCan("STAFF", "catalog:manage"), false);
  assert.equal(roleCan("STAFF", "inventory:manage"), false);
});
