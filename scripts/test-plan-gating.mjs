import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const services = [
  ["qa-answers", "qaAnswers"],
  ["hr-email-drafts", "hrEmailDrafts"],
];

for (const [route, name] of services) {
  const result = await build({
    entryPoints: [fileURLToPath(new URL(`../src/services/${name}.ts`, import.meta.url))],
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
    plugins: [{
      name: "stub-api-base-url",
      setup(plugin) {
        plugin.onResolve({ filter: /^@\/lib\/api$/ }, () => ({ path: "api", namespace: "test" }));
        plugin.onLoad({ filter: /.*/, namespace: "test" }, () => ({ contents: 'export const BASE_URL = "/api";' }));
      },
    }],
  });
  const url = `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].contents).toString("base64")}`;
  const service = (await import(url))[`${name}Service`];
  const events = [];
  let reportedError;

  globalThis.localStorage = { getItem: () => "test-token" };
  globalThis.window = { dispatchEvent: (event) => events.push(event) };
  globalThis.fetch = async (path) => {
    assert.equal(path, `/api/${route}/generate`);
    return new Response(JSON.stringify({ detail: { code: "requires_plan", message: "Paid plan needed" } }), {
      status: 402,
      headers: { "Content-Type": "application/json" },
    });
  };

  await assert.rejects(
    service.generate({}, { onToken() {}, onError(error) { reportedError = error; } }),
    /Paid plan needed/,
  );
  assert.equal(reportedError.message, "Paid plan needed");
  assert.equal(events.length, 1);
  assert.equal(events[0].type, "upgrade-required");
  assert.deepEqual(events[0].detail, { path: `/${route}/generate`, message: "Paid plan needed" });
}

console.log("Paid streaming endpoints open the upgrade modal on requires_plan.");
