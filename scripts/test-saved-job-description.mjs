import assert from "node:assert/strict";
import { test } from "node:test";
import { readSavedJobDescription } from "../src/lib/saved-job-description.ts";

test("reads a résumé's saved job description", () => {
  assert.deepEqual(readSavedJobDescription({ content: { job_description: { description: "Role requirements" } } }), {
    description: "Role requirements", error: "",
  });
});

test("rejects missing descriptions without replacing the current text", () => {
  const result = readSavedJobDescription({ content: { job_description: {} } });
  assert.equal(result.description, "");
  assert.match(result.error, /no saved job description/i);
});

test("rejects descriptions that exceed the interview limit", () => {
  const result = readSavedJobDescription({ content: { job_description: { description: "a".repeat(8001) } } }, 8000);
  assert.equal(result.description, "");
  assert.match(result.error, /8,000 characters/);
});
