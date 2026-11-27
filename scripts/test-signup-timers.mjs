import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const { outputFiles: [bundle] } = await build({
  entryPoints: [fileURLToPath(new URL("../src/lib/signup-timers.ts", import.meta.url))],
  bundle: true,
  format: "esm",
  write: false,
});
const { deadlineAt, remainingSeconds, signupDeadlines } =
  await import("data:text/javascript;base64," + Buffer.from(bundle.contents).toString("base64"));

const issued = {
  server_now: "2026-11-27T00:00:00Z",
  expires_at: "2026-11-27T00:10:00Z",
  resend_available_at: "2026-11-27T00:01:00Z",
};
const receivedAt = 15_000;
const { expiresAt, resendAt } = signupDeadlines(issued, receivedAt);
assert.equal(remainingSeconds(expiresAt, receivedAt), 600);
assert.equal(remainingSeconds(resendAt, receivedAt), 60);
assert.equal(remainingSeconds(resendAt, receivedAt + 59_000), 1);
assert.equal(remainingSeconds(resendAt, receivedAt + 60_000), 0);
assert.equal(remainingSeconds(expiresAt, receivedAt + 599_000), 1);
assert.equal(remainingSeconds(expiresAt, receivedAt + 600_000), 0);
assert.equal(deadlineAt(issued.server_now, "bad", receivedAt), receivedAt);
console.log("Signup expiry and resend are independent and follow the server's deadlines.");
