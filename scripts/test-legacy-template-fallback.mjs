// Regression test for PR #33 review: a résumé whose template was only ever
// recorded in the legacy resume-draft:<id>.templateSlug field (pre-dating the
// dedicated resume-template:<id> key) must not lose that choice.
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import assert from 'node:assert/strict';

const __dirname = dirname(fileURLToPath(import.meta.url));
const helpersPath = resolve(__dirname, '../src/components/modal/resume-builder.helpers.ts');
const bundlePath = resolve(__dirname, '.helpers-test-bundle.mjs');

await build({ entryPoints: [helpersPath], bundle: true, format: 'esm', outfile: bundlePath, platform: 'neutral' });
const mod = await import('file://' + bundlePath);

const store = {};
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = v; },
  removeItem: (k) => { delete store[k]; },
};

const { readResumeTemplate, writeResumeTemplate, readResumeDraft, removeResumeDraft } = mod;

// Simulate a résumé edited before this PR shipped: template lives only in the
// legacy draft, no dedicated key exists yet.
store['resume-draft:42'] = JSON.stringify({ resume: { name: 'Old Resume' }, templateSlug: 'creative-bold' });

const fallback = readResumeTemplate(42);
assert.equal(fallback, 'creative-bold', 'must fall back to legacy draft templateSlug');
console.log('PASS: falls back to legacy draft templateSlug');

// The builder's load effect migrates it to the new key immediately.
writeResumeTemplate(42, fallback);

// Then the draft-staleness check (no baseUpdatedAt match) removes the legacy draft.
removeResumeDraft(42);

const afterRemoval = readResumeTemplate(42);
assert.equal(afterRemoval, 'creative-bold', 'template must survive after legacy draft removed');
console.log('PASS: template survives after legacy draft removed');

assert.equal(readResumeTemplate(999), null, 'no draft at all must return null');
console.log('PASS: no draft at all -> null');

console.log('\nAll legacy-template-fallback cases passed.');
