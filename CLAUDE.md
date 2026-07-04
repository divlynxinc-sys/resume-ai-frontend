# ResumeAI Frontend (JobSynk)

React SPA for the ResumeAI product. One of three sibling repos:

| Repo | Stack | Role |
|---|---|---|
| `resume-ai-frontend` (this) | Vite + React 18 + TypeScript + Tailwind + react-router | UI |
| `../resumeai-backend` | FastAPI + SQLAlchemy + Alembic + Postgres | API, auth, payments (Polar), usage limits |
| `../resumeai-AI` | FastAPI, single `main.py` | LLM generation (Groq hosted / Ollama local) |

Request flow: **frontend → backend (`VITE_API_URL`, default `/api`) → AI service**. The frontend never calls the AI service directly.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` / `npx tsc -b` — build / type-check
- Backend runs in Docker via root `docker-compose.yml`; uvicorn has no `--reload`, so backend code edits need `docker compose restart resumeai-backend`.

## Structure

- `src/App.tsx` — all routes, lazy-loaded. Public routes, `PublicOnlyRoute` (login/signup), `PrivateRoute` (everything else).
- `src/components/modal/` — every page/screen lives here (naming is historical; they are full pages, not modals). Key AI pages: `tailoring.tsx` (resume optimization), `cover-letter.tsx`, `qa-answers.tsx`, `hr-email-drafts.tsx`.
- `src/components/layout/` — `PageWithSidebar` (shared shell for dashboard/AI pages, renders `UsageLimitBanner` at top of content), `SiteNavbar`, `SiteFooter`.
- `src/contexts/` — `AuthContext` (JWT in localStorage `accessToken`/`refreshToken`), `PlanContext` (plan state + upgrade/usage-limit modals + banner state), `ThemeContext`, `ToastContext`. Provider order in `main.tsx`: Theme > Auth > Plan > Toast.
- `src/services/` — one file per backend router (`coverLetter.ts`, `qaAnswers.ts`, `hrEmailDrafts.ts` stream via `fetch` + reader; the rest go through `src/lib/api.ts`).
- `src/lib/api.ts` — fetch wrapper: token attach, 401 refresh-and-retry, and global error → CustomEvent dispatch (see below).

## Plan gating & AI usage limits (read this before touching AI features)

Two distinct backend signals, both handled globally:

1. **402 `{detail: {code: "requires_plan"}}`** — feature is paid-only. Since 2026-07-04 this covers ALL four AI features (resume optimize, cover letter, Q&A answers, HR emails); free tier gets only the resume builder. `lib/api.ts` and the streaming services dispatch `window` CustomEvent `upgrade-required` → `PlanContext` shows `UpgradeModal` ("View plans" → `/pricing`). Pre-click guard: `useRequirePaid()` (currently unused — pages rely on the 402 event).
2. **429 `{detail: {code: "usage_limit_reached", feature, resets_at}}`** — hidden weekly anti-abuse cap (all four AI features, paid users included). Dispatched as CustomEvent `usage-limit-reached` → `PlanContext`:
   - opens `UsageLimitModal` (free users get a subscribe CTA with the cheapest plan price; paid users get a "resets in ~N days" note), and
   - records the hit in localStorage `jobsynk.usageLimitHits` so `UsageLimitBanner` (rendered by `PageWithSidebar`) persists across reloads until `resets_at` passes or the user dismisses it.

**Template gating**: free tier gets only the Classic Professional template. Source of truth: `src/lib/template-access.ts` (`FREE_TEMPLATE_SLUG`, `isTemplateLockedForFree`). `/templates` shows a Lock/Pro badge and opens `UpgradeModal` on locked clicks; the resume builder coerces locked slugs (deep links `?template=`, stale drafts) back to the free template for preview/export via `effectiveTemplateSlug` once the plan has loaded. The landing-page template carousel is deliberately unlocked (marketing). UI-level only — no backend enforcement.

Never surface token counts or exact quotas in UI — limits are intentionally soft/hidden. Cheapest-plan price comes from `useMinPlanPrice()` (cached `pricingService.listPlans()` call).

**Cancellation / money-back / free-reactivate** (account-management billing card + cancel modal): `pricingService.cancelSubscription()` returns `{refunded}` — within the plan's money-back window (weekly/monthly 1 day, 3-month 7 days) it's an automatic 100% refund + immediate end; past the window it's no-refund + blocked-now but **re-subscribe free until `reserved_until`** via `pricingService.reactivateSubscription()`. The cancel modal text and the "Reactivate (free)" button branch on `subDetails` fields (`refund_eligible_now`, `refund_window_days`, `can_reactivate_free`). Pricing cards show a per-plan `trialNote` ("7-day free trial · 100% money-back" on 3-month). Backend policy lives in `resumeai-backend` (see its CLAUDE.md).

`PlanContext` also self-heals Polar subscription drift: if an authenticated user looks unpaid it calls `pricingService.syncPolarSubscription()` once per session (sessionStorage flag `polar-reconciled`). Broadcast `plan-updated` CustomEvent after any plan change so all listeners refetch.

## Launch offer (50% off, ends 2027-01-04)

Single source of truth: `src/lib/launch-offer.ts` (`LAUNCH_OFFER`, `isLaunchOfferActive()`, `launchOfferPrice[Label]()`). Display-only — the real charge is discounted by Polar (backend pre-applies `POLAR_DISCOUNT_ID` to checkouts). Surfaces: `LaunchOfferBanner` (landing page top bar), pricing cards (strikethrough original + discounted, both `/pricing` and the landing `PricingSection`), offer pill in `PricingSection`, note in `UpgradeModal`, and discounted `useMinPlanPrice()`. Pricing cards are STATIC in `pricing.tsx` (`defaultPlans`, backend fetch disabled) — DB prices in `pricing_plans` must match. To retire the offer: flip `enabled` or let `endsAt` pass, and remove the Polar discount env.

## Conventions

- Theming via CSS variables (`var(--app-surface)`, `var(--app-border)`, `var(--accent)`, ...) — use them, not hardcoded colors.
- Path alias `@/` → `src/`.
- Streaming AI endpoints return `text/plain` chunks; services expose `onChunk`/`onError` handler callbacks and replicate the 402/429 event dispatching (they can't use `lib/api.ts` because they stream).
