# AI Interviews frontend integration

The feature lives in `src/features/ai-interviews`. `page.tsx` owns route-level screens, `components.tsx` contains reusable interview UI, `hooks.ts` owns microphone/recorder and session loading, `types.ts` defines domain view models, `utils.ts` contains validation/formatting/scoring, and `api.ts` contains the adapter boundary.

## Routes

- `/ai-interviews` — overview and history
- `/ai-interviews/new` — setup and review
- `/ai-interviews/:id/ready` — consent and microphone check
- `/ai-interviews/:id/live` — voice-first question room
- `/ai-interviews/:id/processing` — recoverable staged processing
- `/ai-interviews/:id/report` — readiness report

All routes use the existing `PrivateRoute`, navbar, and dashboard sidebar.

## Mock mode

Mock mode is the default. Set `VITE_INTERVIEW_API_MODE=mock` explicitly if desired. Session metadata, deterministic questions, answer states, transcripts, evaluations, reports, stable idempotency results, and processing timestamps are stored under `jobsynk.aiInterviews.v1` in local storage. Audio blobs remain in component memory until `registerUpload` and `submitAnswer` succeed; object URLs and microphone tracks are cleaned up on replacement/unmount.

For a controlled retry scenario, set `localStorage["jobsynk.aiInterviews.failNext"] = "true"`; the next answer submission fails once without clearing the recording.

## Live mode and API contract

Set `VITE_INTERVIEW_API_MODE=live` to select `LiveInterviewApi`. Its methods intentionally fail clearly until the backend is available. Implement only this adapter to connect the UI:

- `listInterviews` → `GET /interviews`
- `createInterview` → `POST /interviews`
- `getInterview` → `GET /interviews/{id}`
- `prepareInterview` → `POST /interviews/{id}/prepare`
- `startInterview` → `POST /interviews/{id}/start`
- `registerUpload` → `POST /interviews/{id}/uploads`, followed by the returned signed upload
- `submitAnswer` → `POST /interviews/{id}/answers`
- `getAnswer` → `GET /interviews/{id}/answers/{answerId}`
- `completeInterview` → `POST /interviews/{id}/complete`
- `getReport` → `GET /interviews/{id}/report`
- `deleteInterview` → `DELETE /interviews/{id}`

The adapter maps UI camelCase models to backend snake_case DTOs. Create payloads contain `interview_type`, `role_title`, `seniority`, `duration_minutes`, optional `resume_id` and `job_description`, and `voice_enabled`. Answer payloads contain `question_id`, `media_asset_id`, `duration_ms`, and a stable `idempotency_key`. Answer responses support `follow_up`, `next_question`, or `complete` as `next_action`.

Authentication headers should be attached inside `LiveInterviewApi` using the existing `src/lib/api.ts` token/refresh path. Signed binary uploads should use the returned URL directly and must not attach the app authorization token to a third-party storage origin.

Initial live processing can poll `getInterview`/`getAnswer`. Later, replace polling inside the adapter with SSE while keeping the same `InterviewApi` promises/view models, so page components remain unchanged.

Remaining backend work: implement endpoints, persistent media assets, transcription/evaluation jobs, report generation, server-side idempotency, ownership checks, retention/privacy policy, and authoritative recovery states.
