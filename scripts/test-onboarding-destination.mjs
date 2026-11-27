import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const { outputFiles: [bundle] } = await build({
  entryPoints: [fileURLToPath(new URL("../src/lib/navigation.ts", import.meta.url))],
  bundle: true,
  format: "esm",
  write: false,
});
const { getSafeRedirectPath, onboardingPath } =
  await import("data:text/javascript;base64," + Buffer.from(bundle.contents).toString("base64"));

const target = "/templates?template=classic-professional#preview";
assert.equal(getSafeRedirectPath(target), target);
assert.equal(new URL(onboardingPath(target), "https://jobsynk.invalid").searchParams.get("next"), target);
assert.equal(onboardingPath(), "/onboarding");
for (const ignored of ["/signup/", "/LOGIN", "/onboarding?next=/account", "/a/../login", "https://example.com"]) {
  assert.equal(getSafeRedirectPath(ignored), "/dashboard");
}
console.log("Onboarding preserves the protected return destination and avoids auth route loops.");
