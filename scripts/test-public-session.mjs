import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const { outputFiles: [bundle] } = await build({
  entryPoints: [fileURLToPath(new URL("../src/lib/api.ts", import.meta.url))],
  bundle: true,
  define: { "import.meta.env": "{}" },
  format: "esm",
  write: false,
});
const { apiRequest, apiRequestBlob } =
  await import("data:text/javascript;base64," + Buffer.from(bundle.contents).toString("base64"));

const tokens = new Map();
globalThis.localStorage = {
  getItem: (key) => tokens.get(key) ?? null,
  setItem: (key, value) => tokens.set(key, value),
  removeItem: (key) => tokens.delete(key),
};
globalThis.window = { setTimeout, clearTimeout, location: {} };

function startAt(pathname) {
  window.location = { pathname, search: "?fixture=1", hash: "#example", href: pathname };
  tokens.set("accessToken", "expired-access");
  tokens.set("refreshToken", "expired-refresh");
}

globalThis.fetch = async () => new Response(null, { status: 401 });
for (const pathname of ["/reset-password", "/blog", "/blog/example-post", "/ats-checker/", "/pricing"]) {
  startAt(pathname);
  await assert.rejects(apiRequest("/profile/me"), /Session expired/);
  assert.equal(window.location.href, pathname);
  assert.equal(tokens.size, 0);
}

startAt("/blog/example-post");
await assert.rejects(apiRequestBlob("/resumes/export/pdf", {}), /Session expired/);
assert.equal(window.location.href, "/blog/example-post");

startAt("/blogger");
await assert.rejects(apiRequest("/profile/me"), /Session expired/);
assert.equal(window.location.href, "/login?next=%2Fblogger%3Ffixture%3D1%23example");

startAt("/reset-password");
globalThis.fetch = async (url, options) => {
  assert.equal(url, "/api/auth/reset-password");
  assert.equal(new Headers(options.headers).has("authorization"), false);
  return Response.json({ detail: "Reset was declined." }, { status: 401 });
};
await assert.rejects(apiRequest("/auth/reset-password", { method: "POST" }), /Reset was declined/);
assert.equal(tokens.get("accessToken"), "expired-access");

startAt("/dashboard");
globalThis.fetch = async (url, options) => {
  if (url.endsWith("/auth/refresh")) {
    tokens.set("accessToken", "new-session");
    tokens.set("refreshToken", "new-refresh");
    return new Response(null, { status: 401 });
  }
  return new Headers(options.headers).get("authorization") === "Bearer new-session"
    ? Response.json({ id: "fixture" })
    : new Response(null, { status: 401 });
};
assert.deepEqual(await apiRequest("/profile/me"), { id: "fixture" });
assert.equal(tokens.get("refreshToken"), "new-refresh");
assert.equal(window.location.href, "/dashboard");
console.log("Public routes stay open after stale sessions and password reset bypasses session refresh.");
