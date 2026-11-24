import assert from "node:assert/strict";
import test from "node:test";

function isSafeRedirect(next: string | null) {
  if (!next) return "/dashboard";
  try {
    const decoded = decodeURIComponent(next);
    if (
      decoded.startsWith("/") &&
      !decoded.startsWith("//") &&
      !decoded.includes("\\") &&
      !/[?#]/.test(decoded)
    ) return decoded;
  } catch {}
  return "/dashboard";
}

test("redirect accepts only safe same-app paths", () => {
  assert.equal(isSafeRedirect("/dashboard/products"), "/dashboard/products");
  assert.equal(isSafeRedirect("//evil.example"), "/dashboard");
  assert.equal(isSafeRedirect("/\\evil.example"), "/dashboard");
  assert.equal(isSafeRedirect("/%2Fevil.example"), "/dashboard");
  assert.equal(isSafeRedirect("/dashboard?tab=orders"), "/dashboard");
  assert.equal(isSafeRedirect("%E0%A4%A"), "/dashboard");
});
