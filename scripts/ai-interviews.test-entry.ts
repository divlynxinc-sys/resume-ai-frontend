import assert from "node:assert/strict";
import { MockInterviewApi } from "../src/features/ai-interviews/api";
import { sessionDestination, validateSetup, weightedScore } from "../src/features/ai-interviews/utils";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

Object.assign(globalThis, {
  localStorage: new MemoryStorage(),
  window: { setTimeout, clearTimeout },
});

const validSetup = { roleTitle: "Frontend Developer", interviewType: "behavioural" as const, seniority: "mid" as const, durationMinutes: 10 as const, voiceEnabled: true as const };
assert.equal(validateSetup(validSetup).roleTitle, undefined, "valid setup passes");
assert.ok(validateSetup({ ...validSetup, roleTitle: "" }).roleTitle, "role is required");
assert.ok(validateSetup({ ...validSetup, jobDescription: "x".repeat(8001) }).jobDescription, "job description limit is enforced");
assert.equal(weightedScore({ relevance: 100, evidence: 80, structure: 60, roleAlignment: 70, communication: 90 }), 82, "weighted score follows report contract");
assert.equal(sessionDestination("abc", "processing"), "/ai-interviews/abc/processing", "processing state recovers to processing route");
assert.equal(sessionDestination("abc", "failed"), "/ai-interviews", "invalid terminal state recovers to dashboard");

const api = new MockInterviewApi();
let session = await api.createInterview(validSetup);
assert.equal(session.status, "draft");
session = await api.prepareInterview(session.id);
assert.equal(session.status, "ready");
session = await api.startInterview(session.id);
assert.equal(session.status, "in_progress");
const blob = new Blob(["mock audio"], { type: "audio/webm" });
const upload = await api.registerUpload(session.id, blob);
const payload = { questionId: session.questions[0].id, mediaAssetId: upload.mediaAssetId, durationMs: 42000, idempotencyKey: "stable-key-1" };
const first = await api.submitAnswer(session.id, payload);
const duplicate = await api.submitAnswer(session.id, payload);
assert.equal(first.id, duplicate.id, "duplicate submission returns original answer");
assert.equal(first.status, "completed");
localStorage.setItem("jobsynk.aiInterviews.failNext", "true");
const next = await api.getInterview(session.id);
const nextUpload = await api.registerUpload(session.id, blob);
await assert.rejects(() => api.submitAnswer(session.id, { ...payload, questionId: next.questions[next.currentQuestionIndex].id, mediaAssetId: nextUpload.mediaAssetId, idempotencyKey: "retry-key" }), /still available/);
const retried = await api.submitAnswer(session.id, { ...payload, questionId: next.questions[next.currentQuestionIndex].id, mediaAssetId: nextUpload.mediaAssetId, idempotencyKey: "retry-key" });
assert.equal(retried.status, "completed", "retry accepts retained recording");

console.log("AI Interviews: validation, scoring, state transitions, idempotency, route recovery, and retry checks passed.");
