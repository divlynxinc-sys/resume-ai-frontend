import { useCallback, useEffect, useRef, useState } from "react";
import { useBlocker, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, CheckCircle2, Circle, Clock3, FileText, Headphones, History, LoaderCircle, Mic, Plus, RotateCcw, Sparkles, Trash2, TriangleAlert, Trophy, Upload } from "lucide-react";
import SiteNavbar from "@/components/layout/site-navbar";
import PageWithSidebar from "@/components/layout/page-with-sidebar";
import { AppButton, AppButtonLink } from "@/components/ui/AppButton";
import { useJobDescriptionImport } from "@/hooks/use-job-description-import";
import { JobDescriptionModeToggle } from "@/components/shared/job-description-source";
import { interviewApi } from "./api";
import { AnswerFeedback, cardClass, ErrorPanel, LoadingPanel, PageHeading, RecorderControls, ScoreBreakdown } from "./components";
import { useInterviewSession, useMicrophoneTest } from "./hooks";
import { LiveInterviewRoom, type LiveEndReason } from "./live-room";
import type { InterviewSession, InterviewSetup, LiveConnection, ResumeOption } from "./types";
import { formatDate, INTERVIEW_TYPE_LABELS, readinessNote, SENIORITY_LABELS, sessionDestination, statusLabel, validateSetup } from "./utils";
import { ProctorChecklist, ProctorFailedScreen, ProctorMonitor } from "./proctor/components";
import { PROCTOR } from "./proctor/config";
import { enterFullscreen, exitFullscreen } from "./proctor/fullscreen";
import { useCameraCheck, useLiveProctor, useProctorSession, useProctorVerdict, useScreenCheck } from "./proctor/hooks";
import { preloadFaceLandmarker } from "./proctor/gaze";
import { clearProctorVerdict, readProctorVerdict } from "./proctor/storage";
import type { ProctorVerdict } from "./proctor/types";

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]"><SiteNavbar /><PageWithSidebar activeRoute="ai-interviews"><main className="mx-auto max-w-6xl py-5 sm:py-9">{children}</main></PageWithSidebar></div>;
}

/**
 * The live proctored interview runs with **no app chrome** — no navbar, no
 * sidebar, no links. Fullscreen alone does not hide those, and while they are on
 * screen they are both a distraction and an escape hatch: one click on a sidebar
 * item navigates away and silently ends the interview. Nothing here is clickable
 * except the room's own controls.
 */
function ExamShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]">
      <main className="mx-auto max-w-3xl px-4 py-6 sm:py-10">{children}</main>
    </div>
  );
}

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error && e.message ? e.message : fallback;
}

// --- Dashboard ----------------------------------------------------------------------------

function Dashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setSessions(await interviewApi.listInterviews()); }
    catch (e) { setError(errorMessage(e, "Unable to load interview history.")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  // A proctor-failed interview never counts towards practice stats, even if the backend built a report.
  const completed = sessions.filter((s) => s.status === "report_ready" && !readProctorVerdict(s.id));
  const latest = completed[0]?.report?.overallScore;

  const remove = async (id: string) => {
    if (!window.confirm("Delete this interview and its report? This cannot be undone.")) return;
    setBusy(id);
    try { await interviewApi.deleteInterview(id); clearProctorVerdict(id); await load(); }
    catch (e) { setError(errorMessage(e, "Unable to delete this interview.")); }
    finally { setBusy(null); }
  };
  const retry = async (id: string) => {
    setBusy(id);
    try { await interviewApi.retryInterview(id); navigate(`/ai-interviews/${id}/processing`); }
    catch (e) { setError(errorMessage(e, "Unable to retry this interview.")); setBusy(null); }
  };

  const actionFor = (s: InterviewSession) => {
    if (readProctorVerdict(s.id)) return <AppButton variant="secondary" size="sm" onClick={() => navigate(`/ai-interviews/${s.id}/report`)}>Why it failed</AppButton>;
    if (s.status === "report_ready") return <AppButton variant="secondary" size="sm" onClick={() => navigate(sessionDestination(s.id, s.status))}>View report</AppButton>;
    if (s.status === "failed") return <AppButton variant="secondary" size="sm" onClick={() => retry(s.id)} disabled={busy === s.id}><RotateCcw className="size-3.5" />Retry report</AppButton>;
    if (s.status === "abandoned") return <AppButton variant="secondary" size="sm" disabled>Ended early</AppButton>;
    if (s.status === "in_progress") return <AppButton variant="secondary" size="sm" onClick={() => navigate(sessionDestination(s.id, s.status))}>Rejoin</AppButton>;
    return <AppButton variant="secondary" size="sm" onClick={() => navigate(sessionDestination(s.id, s.status))}>Continue</AppButton>;
  };

  return <Shell>
    <PageHeading eyebrow="AI interview coach" title={<>Practise with <span className="italic">purpose</span></>} description="A live, spoken mock interview built around your résumé and the job you want — then a detailed readiness report." action={<AppButton onClick={() => navigate("/ai-interviews/new")} size="lg"><Plus className="size-4" />Start new interview</AppButton>} />
    <section className="mt-7 grid gap-4 sm:grid-cols-3">
      <div className={`${cardClass} p-5`}><Sparkles className="size-5 text-violet-500" /><p className="mt-5 text-xs text-[var(--app-fg-muted)]">Latest readiness</p><p className="mt-1 text-3xl font-light">{latest ?? "—"}{latest != null && <span className="text-base text-[var(--app-fg-soft)]">/100</span>}</p></div>
      <div className={`${cardClass} p-5`}><Trophy className="size-5 text-amber-500" /><p className="mt-5 text-xs text-[var(--app-fg-muted)]">Completed interviews</p><p className="mt-1 text-3xl font-light">{completed.length}</p></div>
      <div className={`${cardClass} p-5`}><Clock3 className="size-5 text-blue-500" /><p className="mt-5 text-xs text-[var(--app-fg-muted)]">Practice time</p><p className="mt-1 text-3xl font-light">{completed.reduce((sum, s) => sum + s.setup.durationMinutes, 0)}<span className="ml-1 text-base text-[var(--app-fg-soft)]">min</span></p></div>
    </section>
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="font-display text-2xl font-light">Interview history</h2><p className="mt-1 text-sm text-[var(--app-fg-muted)]">Rejoin a session or revisit your feedback.</p></div><History className="size-5 text-[var(--app-fg-soft)]" /></div>
      {loading ? <LoadingPanel label="Loading your interviews…" /> : error ? <ErrorPanel message={error} onRetry={load} /> : sessions.length === 0 ? (
        <div className={`${cardClass} flex flex-col items-center p-10 text-center`}>
          <div className="grid size-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-text)]"><Mic className="size-6" /></div>
          <h3 className="mt-5 font-display text-2xl font-light">Your first practice session starts here</h3>
          <p className="mt-2 max-w-md text-sm text-[var(--app-fg-muted)]">Choose a role, level and interview style. Sam, your AI interviewer, asks about your real experience and adapts to your answers.</p>
          <AppButton className="mt-6" onClick={() => navigate("/ai-interviews/new")}>Start practising</AppButton>
        </div>
      ) : (
        <div className="space-y-3">{sessions.map((s) => (
          <article key={s.id} className={`${cardClass} flex flex-col gap-4 p-5 sm:flex-row sm:items-center`}>
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)]"><BriefcaseBusiness className="size-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-medium">{s.setup.roleTitle}</h3>{readProctorVerdict(s.id)
                ? <span className="rounded-full bg-[var(--pastel-rose)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#a13f62]">Failed · proctoring</span>
                : <span className="rounded-full bg-[var(--app-surface-2)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--app-fg-muted)]">{statusLabel(s.status)}</span>}</div>
              <p className="mt-1 text-xs text-[var(--app-fg-muted)]">{INTERVIEW_TYPE_LABELS[s.setup.interviewType]} · {SENIORITY_LABELS[s.setup.seniority]} · {formatDate(s.updatedAt)} · {s.setup.durationMinutes} min {s.report ? `· ${s.report.overallScore}/100` : ""}</p>
            </div>
            <div className="flex gap-2">{actionFor(s)}<AppButton variant="ghost" size="icon" onClick={() => remove(s.id)} disabled={busy === s.id} aria-label={`Delete ${s.setup.roleTitle} interview`}><Trash2 className="size-4" /></AppButton></div>
          </article>
        ))}</div>
      )}
    </section>
  </Shell>;
}

// --- New interview ----------------------------------------------------------------------

const initialSetup: InterviewSetup = { roleTitle: "", interviewType: "general", seniority: "mid", durationMinutes: 15 };

function NewInterview() {
  const navigate = useNavigate();
  const [setup, setSetup] = useState(initialSetup);
  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"form" | "summary">("form");
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const resumeFileRef = useRef<HTMLInputElement>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeUploadError, setResumeUploadError] = useState("");
  const {
    mode: jdMode, setMode: setJdMode, url: jdUrl, setUrl: setJdUrl,
    fetching: jdFetching, error: jdFetchError, importedFrom: jdImportedFrom,
    fetchFromLink: fetchJdFromLink, clearImportedNote: clearJdImportedNote,
  } = useJobDescriptionImport((text) => update("jobDescription", text));

  useEffect(() => { interviewApi.listResumes().then(setResumes).catch(() => setLoadError("Résumé options are unavailable, but you can continue without one.")); }, []);
  const update = <K extends keyof InterviewSetup>(key: K, value: InterviewSetup[K]) => setSetup((s) => ({ ...s, [key]: value }));
  const review = () => { const next = validateSetup(setup); setErrors(next); if (!Object.keys(next).length) setStep("summary"); };
  const create = async () => {
    setSaving(true);
    try {
      const resume = resumes.find((r) => r.id === setup.resumeId);
      const session = await interviewApi.createInterview({ ...setup, roleTitle: setup.roleTitle.trim(), resumeTitle: resume?.title });
      navigate(`/ai-interviews/${session.id}/ready`);
    } catch (e) { setErrors({ form: errorMessage(e, "Unable to create interview.") }); setStep("form"); }
    finally { setSaving(false); }
  };

  const onResumeFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setResumeUploading(true); setResumeUploadError("");
    try {
      const uploaded = await interviewApi.uploadResume(file);
      setResumes((prev) => [uploaded, ...prev]);
      update("resumeId", uploaded.id);
    } catch (err) { setResumeUploadError(errorMessage(err, "Unable to upload that résumé. Use a PDF or DOCX under 10MB.")); }
    finally { setResumeUploading(false); }
  };

  return <Shell>
    <button onClick={() => step === "summary" ? setStep("form") : navigate("/ai-interviews")} className="mb-5 inline-flex items-center gap-2 text-sm text-[var(--app-fg-muted)] hover:text-[var(--app-fg)]"><ArrowLeft className="size-4" />{step === "summary" ? "Edit setup" : "Back to interviews"}</button>
    <PageHeading eyebrow={step === "summary" ? "Review your setup" : "New practice session"} title={step === "summary" ? <>Ready when <span className="italic">you are</span></> : <>Shape your <span className="italic">interview</span></>} description={step === "summary" ? "Check the details below. You can still go back and make changes." : "Your résumé and the job description let Sam ask about your real projects and experience at the right level."} />
    {step === "form" ? (
      <div className={`${cardClass} mt-7 p-5 sm:p-7`}>
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Target role" error={errors.roleTitle}><input value={setup.roleTitle} onChange={(e) => update("roleTitle", e.target.value)} placeholder="e.g. Frontend Developer" className="input" aria-invalid={!!errors.roleTitle} /></Field>
          <Field label="Interview type" error={errors.interviewType}><select value={setup.interviewType} onChange={(e) => update("interviewType", e.target.value as InterviewSetup["interviewType"])} className="input">{Object.entries(INTERVIEW_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          <Field label="Level you are interviewing for" hint="Questions are calibrated to this level." error={errors.seniority}><select value={setup.seniority} onChange={(e) => update("seniority", e.target.value as InterviewSetup["seniority"])} className="input">{Object.entries(SENIORITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          <Field label="Duration" hint="Longer sessions include more questions."><div className="grid grid-cols-3 gap-2">{([10, 15, 20] as const).map((m) => <button key={m} type="button" onClick={() => update("durationMinutes", m)} className={`rounded-xl border px-3 py-2.5 text-sm ${setup.durationMinutes === m ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-text)]" : "border-[var(--app-border)] bg-[var(--app-surface-2)]"}`}>{m} min</button>)}</div></Field>
          <Field label="Résumé (recommended)" hint="Sam asks about the experience and projects on it.">
            <div className="flex gap-2">
              <select value={setup.resumeId ?? ""} onChange={(e) => update("resumeId", e.target.value || undefined)} className="input flex-1"><option value="">No résumé selected</option>{resumes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}</select>
              <AppButton type="button" variant="secondary" onClick={() => resumeFileRef.current?.click()} disabled={resumeUploading} aria-label="Upload a résumé">
                {resumeUploading ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
                <span className="hidden sm:inline">Upload</span>
              </AppButton>
              <input ref={resumeFileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={onResumeFileSelected} />
            </div>
            {loadError && <p className="mt-2 text-xs text-amber-600">{loadError}</p>}
            {resumeUploadError && <p className="mt-2 text-xs text-red-600">{resumeUploadError}</p>}
          </Field>
          <div className="md:col-span-2">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium">Job description (optional)</span>
              <JobDescriptionModeToggle
                mode={jdMode}
                onChange={setJdMode}
                activeClassName="bg-[var(--accent-soft)] text-[var(--accent-text)]"
                inactiveClassName="bg-[var(--app-surface-2)] text-[var(--app-fg-muted)]"
              />
            </div>
            {jdMode === "link" ? (
              <div>
                <div className="flex gap-2">
                  <input value={jdUrl} onChange={(e) => setJdUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void fetchJdFromLink(); } }} placeholder="Paste the job posting URL…" className="input flex-1" inputMode="url" />
                  <AppButton type="button" variant="secondary" onClick={fetchJdFromLink} disabled={jdFetching || !jdUrl.trim()}>{jdFetching ? <LoaderCircle className="size-4 animate-spin" /> : "Fetch"}</AppButton>
                </div>
                <p className="mt-2 text-xs text-[var(--app-fg-soft)]">Works best with a company careers page or job board. Some sites (e.g. LinkedIn) block this — paste the text instead if it fails.</p>
                {jdFetchError && <p className="mt-2 text-xs text-red-600">{jdFetchError}</p>}
              </div>
            ) : (
              <>
                <textarea value={setup.jobDescription ?? ""} onChange={(e) => { update("jobDescription", e.target.value); clearJdImportedNote(); }} rows={7} placeholder="Paste the role description for more targeted questions…" className="input resize-y" />
                <div className="mt-1.5 flex justify-between text-xs text-[var(--app-fg-soft)]">
                  <span>{jdImportedFrom && `Imported from ${jdImportedFrom} — feel free to edit.`}</span>
                  <span>{setup.jobDescription?.length ?? 0}/8,000 characters</span>
                </div>
              </>
            )}
            {errors.jobDescription && <p className="mt-1.5 text-xs text-red-600">{errors.jobDescription}</p>}
          </div>
        </div>
        {errors.form && <p className="mt-4 text-sm text-red-600">{errors.form}</p>}
        <div className="mt-7 flex justify-end"><AppButton onClick={review} size="lg">Review setup<ArrowRight className="size-4" /></AppButton></div>
      </div>
    ) : (
      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className={`${cardClass} p-6`}>
          <dl className="divide-y divide-[var(--app-border)]">{[["Target role", setup.roleTitle], ["Interview style", INTERVIEW_TYPE_LABELS[setup.interviewType]], ["Level", SENIORITY_LABELS[setup.seniority]], ["Duration", `${setup.durationMinutes} minutes`], ["Résumé", resumes.find((r) => r.id === setup.resumeId)?.title ?? "Not selected"], ["Job description", setup.jobDescription?.trim() ? `${setup.jobDescription.trim().length} characters` : "Not provided"]].map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-4 first:pt-0 last:pb-0"><dt className="text-sm text-[var(--app-fg-muted)]">{k}</dt><dd className="text-right text-sm font-medium">{v}</dd></div>)}</dl>
        </div>
        <aside className={`${cardClass} h-fit p-6`}>
          <h2 className="font-display text-xl font-light">What happens next</h2>
          <ul className="mt-4 space-y-3 text-sm text-[var(--app-fg-muted)]">{["Test your microphone on the next screen.", "Sam starts with an introduction, then digs into your experience.", "Questions adapt to your answers — it is a real conversation.", "Your report is ready moments after you finish."].map((x) => <li key={x} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />{x}</li>)}</ul>
          {errors.form && <p className="mt-4 text-sm text-red-600">{errors.form}</p>}
          <AppButton className="mt-6 w-full" size="lg" onClick={create} disabled={saving}>{saving ? <LoaderCircle className="size-4 animate-spin" /> : null}{saving ? "Creating…" : "Continue to device check"}</AppButton>
        </aside>
      </div>
    )}
  </Shell>;
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 flex justify-between gap-3 text-sm font-medium"><span>{label}</span>{hint && <span className="text-xs font-normal text-[var(--app-fg-soft)]">{hint}</span>}</span>{children}{error && <span className="mt-1.5 block text-xs text-red-600">{error}</span>}</label>;
}

// --- Ready (device check) --------------------------------------------------------------------

function Ready() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, loading, error, refresh } = useInterviewSession(id);
  const mic = useMicrophoneTest();
  const [consent, setConsent] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");
  const proctoring = PROCTOR.enabled;
  const { session: proctor, handOff } = useProctorSession(id, proctoring);
  const screenCheck = useScreenCheck(proctoring);
  const camera = useCameraCheck(proctor);

  // The face model is ~4 MB; fetching it while the candidate reads this screen keeps the camera check instant.
  useEffect(() => { if (proctoring) preloadFaceLandmarker(); }, [proctoring]);

  useEffect(() => {
    if (session && session.status !== "ready" && session.status !== "in_progress") navigate(sessionDestination(session.id, session.status), { replace: true });
  }, [session, navigate]);

  const screenOk = !proctoring || screenCheck === "single" || (screenCheck === "unsupported" && !PROCTOR.requireScreenCheckSupport);
  const proctorReady = !proctoring || (screenOk && camera.passed);
  const blockedReason = !proctoring || proctorReady ? ""
    : !screenOk ? (screenCheck === "extended" ? "Disconnect the additional display to start." : screenCheck === "unsupported" ? "This browser cannot verify your displays. Use Chrome or Edge on a desktop computer." : "Checking your displays…")
    : "Turn on your camera and look at the screen to finish the eye-tracking check.";

  const start = async () => {
    if (!session || !proctorReady) return;
    setStarting(true); setStartError("");
    if (mic.state === "recording" || mic.state === "paused") mic.stop();
    // Fullscreen must be requested inside the click gesture, before any await.
    if (proctoring) {
      try { await enterFullscreen(); }
      catch { setStartError("The interview must run in fullscreen. Allow fullscreen for this site, then press Start again."); setStarting(false); return; }
    }
    try {
      const { connection } = await interviewApi.startInterview(session.id);
      handOff(); // the live screen adopts this proctor (and its camera) as-is
      navigate(`/ai-interviews/${session.id}/live`, { state: { connection } });
    } catch (e) {
      if (proctoring) await exitFullscreen();
      setStartError(errorMessage(e, "We could not start the interview. Please try again."));
      setStarting(false);
    }
  };

  return <Shell>{loading ? <LoadingPanel /> : error || !session ? <ErrorPanel message={error || "Interview not found."} onRetry={refresh} /> : <>
    <PageHeading eyebrow="Device check" title={<>Settle in, then <span className="italic">begin</span></>} description={`About ${session.questionTarget} main questions plus follow-ups · ${session.setup.durationMinutes} minutes · ${session.setup.roleTitle} (${SENIORITY_LABELS[session.setup.seniority]})`} />
    <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className={`${cardClass} p-6`}>
        <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl bg-[var(--accent-soft)]"><Headphones className="size-5 text-[var(--accent-text)]" /></div><div><h2 className="font-display text-xl font-light">Test your microphone</h2><p className="text-xs text-[var(--app-fg-muted)]">Record up to 10 seconds, then play it back.</p></div></div>
        {mic.devices.length > 1 && <label className="mt-5 block text-sm">Microphone<select className="input mt-2" value={mic.selectedDeviceId} onChange={(e) => mic.setSelectedDeviceId(e.target.value)}>{mic.devices.map((d, i) => <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${i + 1}`}</option>)}</select></label>}
        <div className="mt-6 rounded-2xl bg-[var(--app-surface-2)] p-5"><RecorderControls recorder={mic} selectedDeviceId={mic.selectedDeviceId} /></div>
        <p className="mt-4 text-xs leading-5 text-[var(--app-fg-muted)]">Microphone access is requested only when you press “Start recording.” If access is denied, open your browser’s site controls, allow the microphone, and retry.</p>
      </section>
      {proctoring && <div className="lg:col-start-1"><ProctorChecklist screen={screenCheck} camera={camera} session={proctor} /></div>}
      <aside className={`${cardClass} h-fit p-6`}>
        <h2 className="font-display text-xl font-light">Before you start</h2>
        <ul className="mt-4 space-y-3 text-sm text-[var(--app-fg-muted)]">{["Find a quiet space and use headphones if you can.", "Speak naturally — Sam waits for you to finish, even if you pause to think.", "Aim for focused answers of one to two minutes.", "You can end the interview at any time; the report covers what you answered."].map((x) => <li key={x} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />{x}</li>)}</ul>
        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] p-3 text-sm"><input type="checkbox" className="mt-1 size-4" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>I consent to my voice being processed live by JobSynk’s AI interviewer. Audio is not stored; a text transcript is kept to build my report.{proctoring && " I understand this interview is proctored: my camera is analysed on this device to check that I stay on screen, and the interview is failed if I break the rules above."}</span></label>
        {startError && <p className="mt-4 rounded-xl bg-[var(--pastel-rose)] p-3 text-sm text-[#a13f62]" role="alert">{startError}</p>}
        <AppButton className="mt-5 w-full" size="lg" onClick={start} disabled={!consent || starting || !proctorReady}>{starting ? <LoaderCircle className="size-4 animate-spin" /> : null}{starting ? "Connecting…" : session.status === "in_progress" ? "Rejoin interview" : "Start interview"}</AppButton>
        {blockedReason && <p className="mt-2 text-center text-xs text-[var(--app-fg-muted)]">{blockedReason}</p>}
      </aside>
    </div>
  </>}</Shell>;
}

// --- Live -----------------------------------------------------------------------------------

function Live() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { session, loading, error, refresh } = useInterviewSession(id);
  const [connection, setConnection] = useState<LiveConnection | null>((location.state as { connection?: LiveConnection } | null)?.connection ?? null);
  const [connectError, setConnectError] = useState("");
  const [endMessage, setEndMessage] = useState("");
  const finishing = useRef(false);
  const proctoring = PROCTOR.enabled;
  // The proctor was created on /ready; adopt it (already calibrated, camera running) rather than restarting it.
  const { session: proctor } = useProctorSession(id, proctoring);
  const [failedByProctor, setFailedByProctor] = useState<ProctorVerdict | null>(null);

  useEffect(() => {
    if (session && session.status !== "in_progress" && session.status !== "ready") navigate(sessionDestination(session.id, session.status), { replace: true });
  }, [session, navigate]);

  // No connection in router state (refresh / deep link): ask the backend for a fresh token.
  useEffect(() => {
    if (!session || connection || connectError) return;
    if (session.status !== "in_progress" && session.status !== "ready") return;
    let cancelled = false;
    interviewApi.startInterview(session.id)
      .then((r) => { if (!cancelled) setConnection(r.connection); })
      .catch((e) => { if (!cancelled) setConnectError(errorMessage(e, "We could not join the interview room.")); });
    return () => { cancelled = true; };
  }, [session, connection, connectError]);

  useEffect(() => {
    if (!connection || finishing.current) return;
    const protect = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [connection]);

  const onEnded = async (reason: LiveEndReason, detail?: string) => {
    if (!session || finishing.current) return;
    finishing.current = true;
    if (reason === "error") setEndMessage(detail || "The connection was lost.");
    // Disarm first: leaving fullscreen is what we are about to do deliberately, and an
    // armed proctor would read that `fullscreenchange` as a violation.
    proctor?.disarm();
    if (proctoring) await exitFullscreen();
    try { await interviewApi.completeInterview(session.id); } catch { /* the processing page reconciles */ }
    navigate(`/ai-interviews/${session.id}/processing`, { replace: true });
  };

  // A proctoring violation ends the interview: unmounting the room disconnects LiveKit, then the
  // normal completion path runs and /processing shows the failure reason instead of a report.
  const onProctorFail = useCallback((verdict: ProctorVerdict) => {
    setFailedByProctor(verdict);
    if (!id || finishing.current) return;
    finishing.current = true;
    void exitFullscreen();
    void interviewApi.completeInterview(id).catch(() => { /* the processing page reconciles */ });
  }, [id]);

  // A reload during the interview fires `pagehide` -> `left_page`, so a verdict may already
  // exist when this screen mounts. A proctored interview cannot be resumed, so nothing is armed.
  const priorVerdict = useProctorVerdict(id);
  const liveProctor = useLiveProctor(priorVerdict ? null : proctor, session?.startedAt, onProctorFail);

  // The failure happened during unload, so the room was never closed server-side. Do it now.
  useEffect(() => {
    if (!priorVerdict || !id || finishing.current) return;
    finishing.current = true;
    void interviewApi.completeInterview(id).catch(() => { /* reconciled server-side */ });
  }, [priorVerdict, id]);

  // `ExamShell` removes every in-app link, but the back button is still a way out of a
  // running interview — and letting it through would silently end the session. Block it
  // while the proctor is armed; `finishing.current` lets our own completion navigate.
  const guarding = proctoring && !!connection && !failedByProctor && !priorVerdict;
  const blocker = useBlocker(() => guarding && !finishing.current);
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    // A deliberate attempt to leave a proctored interview is treated as leaving it.
    if (proctor?.armed) proctor.fail("left_page");
    // Always reset: the navigation is cancelled either way, and leaving the blocker
    // stuck in "blocked" would break the links on the failure screen we just showed.
    blocker.reset();
  }, [blocker, proctor]);

  const Frame = proctoring ? ExamShell : Shell;
  if (failedByProctor || priorVerdict) return <Shell><ProctorFailedScreen verdict={failedByProctor ?? priorVerdict!} roleTitle={session?.setup.roleTitle} /></Shell>;
  if (loading) return <Frame><LoadingPanel /></Frame>;
  if (error || !session) return <Shell><ErrorPanel message={error || "Interview not found."} onRetry={refresh} /></Shell>;
  if (connectError) return <Shell><ErrorPanel message={connectError} onRetry={() => { setConnectError(""); }} /><div className="mt-4 text-center"><AppButtonLink to="/ai-interviews" variant="secondary">Back to interviews</AppButtonLink></div></Shell>;
  if (!connection) return <Frame><LoadingPanel label="Joining your interview room…" /></Frame>;
  return <Frame>
    {endMessage && <p className="mb-4 rounded-xl bg-[var(--pastel-rose)] p-3 text-center text-sm text-[#a13f62]" role="alert">{endMessage}</p>}
    <LiveInterviewRoom key={connection.token} connection={connection} roleTitle={session.setup.roleTitle} durationMinutes={session.setup.durationMinutes} startedAt={session.startedAt} onEnded={onEnded} />
    {proctor && <ProctorMonitor session={proctor} {...liveProctor} />}
  </Frame>;
}

// --- Processing ----------------------------------------------------------------------------

function Processing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, setSession, loading, error, refresh } = useInterviewSession(id);
  const [elapsed, setElapsed] = useState(0);
  const [retrying, setRetrying] = useState(false);
  // A proctoring failure overrides whatever the backend makes of the session — no report is shown.
  const proctorVerdict = useProctorVerdict(id);

  useEffect(() => {
    if (!session || proctorVerdict) return;
    if (session.status === "report_ready") { navigate(`/ai-interviews/${session.id}/report`, { replace: true }); return; }
    if (session.status === "ready" || session.status === "in_progress") { navigate(sessionDestination(session.id, session.status), { replace: true }); return; }
    if (session.status !== "processing") return;
    const started = new Date(session.processingStartedAt ?? Date.now()).getTime();
    const tick = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    const poll = window.setInterval(async () => {
      try {
        const next = await interviewApi.getInterview(session.id);
        if (next.status !== "processing") setSession(next);
      } catch { /* keep polling; the next tick retries */ }
    }, 2500);
    return () => { window.clearInterval(tick); window.clearInterval(poll); };
  }, [session, navigate, setSession, proctorVerdict]);

  const retry = async () => {
    if (!session) return;
    setRetrying(true);
    try { setSession(await interviewApi.retryInterview(session.id)); }
    catch (e) { setSession({ ...session, error: errorMessage(e, "Unable to retry right now.") }); }
    finally { setRetrying(false); }
  };

  const stages = ["Saving your conversation", "Reviewing each answer", "Calculating scores", "Preparing recommendations"];
  const current = Math.min(3, Math.floor(elapsed / 6));

  if (proctorVerdict) return <Shell><ProctorFailedScreen verdict={proctorVerdict} roleTitle={session?.setup.roleTitle} /></Shell>;
  if (loading) return <Shell><LoadingPanel /></Shell>;
  if (error || !session) return <Shell><ErrorPanel message={error || "Interview not found."} onRetry={refresh} /></Shell>;

  if (session.status === "failed") return <Shell>
    <ErrorPanel message={session.error || "We couldn't build your report this time."} onRetry={retrying ? undefined : retry} />
    <div className="mt-4 flex justify-center gap-2"><AppButtonLink to="/ai-interviews" variant="secondary">Back to interviews</AppButtonLink><AppButton onClick={() => navigate("/ai-interviews/new")}>Start a new interview</AppButton></div>
  </Shell>;

  if (session.status === "abandoned") return <Shell>
    <div className={`${cardClass} mx-auto max-w-2xl p-8 text-center`}>
      <TriangleAlert className="mx-auto size-8 text-amber-500" />
      <h1 className="mt-4 font-display text-3xl font-light">This interview ended early</h1>
      <p className="mt-3 text-sm text-[var(--app-fg-muted)]">It finished before you answered a question, so there is nothing to score yet. Start a new session whenever you are ready.</p>
      <div className="mt-6 flex justify-center gap-2"><AppButtonLink to="/ai-interviews" variant="secondary">Back to interviews</AppButtonLink><AppButton onClick={() => navigate("/ai-interviews/new")}>Start a new interview</AppButton></div>
    </div>
  </Shell>;

  return <Shell>
    <div className="mx-auto max-w-2xl py-8 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[var(--accent-soft)]"><Sparkles className="size-7 animate-pulse text-[var(--accent)]" /></div>
      <h1 className="mt-6 font-display text-4xl font-light">Building your feedback</h1>
      <p className="mt-3 text-sm text-[var(--app-fg-muted)]">This usually takes under a minute. You can safely refresh this page.</p>
      <div className={`${cardClass} mt-8 p-6 text-left`}>{stages.map((label, i) => <div key={label} className="flex items-center gap-4 py-3"><div className={`grid size-8 place-items-center rounded-full ${i < current ? "bg-emerald-500 text-white" : i === current ? "bg-[var(--accent)] text-white" : "bg-[var(--app-surface-2)] text-[var(--app-fg-soft)]"}`}>{i < current ? <Check className="size-4" /> : i === current ? <LoaderCircle className="size-4 animate-spin" /> : <Circle className="size-3" />}</div><span className={i <= current ? "text-[var(--app-fg)]" : "text-[var(--app-fg-soft)]"}>{label}</span></div>)}</div>
    </div>
  </Shell>;
}

// --- Report ---------------------------------------------------------------------------------

function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, loading, error, refresh } = useInterviewSession(id);
  const proctorVerdict = useProctorVerdict(id);
  useEffect(() => { if (session && !proctorVerdict && session.status !== "report_ready") navigate(sessionDestination(session.id, session.status), { replace: true }); }, [session, navigate, proctorVerdict]);
  if (proctorVerdict) return <Shell><ProctorFailedScreen verdict={proctorVerdict} roleTitle={session?.setup.roleTitle} /></Shell>;
  if (loading) return <Shell><LoadingPanel label="Loading your feedback…" /></Shell>;
  if (error || !session?.report) return <Shell><ErrorPanel message={error || "This report is not ready yet."} onRetry={refresh} /></Shell>;
  const report = session.report;
  const answered = session.answers.filter((a) => a.evaluation);
  return <Shell>
    <PageHeading eyebrow="Interview report" title={<>Your readiness <span className="italic">review</span></>} description={`${session.setup.roleTitle} · ${INTERVIEW_TYPE_LABELS[session.setup.interviewType]} · ${SENIORITY_LABELS[session.setup.seniority]} · ${formatDate(report.generatedAt)}`} action={<div className="flex gap-2"><AppButtonLink to="/ai-interviews" variant="secondary">Back to interviews</AppButtonLink><AppButton onClick={() => navigate("/ai-interviews/new")}>Practise again</AppButton></div>} />
    <section className="mt-7 grid gap-6 lg:grid-cols-[300px_1fr]">
      <div className={`${cardClass} flex flex-col items-center justify-center p-7 text-center`}>
        <div className="relative grid size-40 place-items-center rounded-full" style={{ background: `conic-gradient(var(--accent) ${report.overallScore * 3.6}deg, var(--app-surface-2) 0)` }}><div className="grid size-32 place-items-center rounded-full bg-[var(--app-surface)]"><div><p className="text-5xl font-light">{report.overallScore}</p><p className="text-xs text-[var(--app-fg-muted)]">out of 100</p></div></div></div>
        <h2 className="mt-5 font-display text-xl font-light">Overall readiness</h2>
        <p className="mt-2 text-sm text-[var(--app-fg-muted)]">{report.summary || readinessNote(report.overallScore)}</p>
      </div>
      <div className={`${cardClass} p-6`}><h2 className="font-display text-2xl font-light">Score breakdown</h2><p className="mb-6 mt-1 text-sm text-[var(--app-fg-muted)]">Weighted toward relevance, evidence, and role alignment.</p><ScoreBreakdown scores={report.scores} /></div>
    </section>
    <section className="mt-6 grid gap-5 lg:grid-cols-3">
      <ReportList title="Strengths" icon={<Trophy className="size-5 text-emerald-500" />} items={report.strengths} />
      <ReportList title="Priority improvements" icon={<TriangleAlert className="size-5 text-amber-500" />} items={report.improvements} />
      <ReportList title="Recommended action plan" icon={<FileText className="size-5 text-blue-500" />} items={report.actionPlan} ordered />
    </section>
    <section className="mt-8">
      <h2 className="font-display text-2xl font-light">Question-by-question feedback</h2>
      <p className="mt-1 text-sm text-[var(--app-fg-muted)]">Expand each answer to review what you said, the evidence behind the scores, and a stronger outline.</p>
      <div className="mt-4 space-y-3">{answered.length ? answered.map((a) => <AnswerFeedback key={a.id} answer={a} question={session.questions.find((q) => q.id === a.questionId)?.prompt ?? "Interview question"} />) : <p className="text-sm text-[var(--app-fg-soft)]">No individual answers were scored in this session.</p>}</div>
    </section>
    {session.transcript && session.transcript.length > 0 && (
      <section className="mt-8">
        <details className={`${cardClass} group overflow-hidden`}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5"><div><p className="text-xs font-medium uppercase tracking-wider text-[var(--accent-text)]">Full transcript</p><h3 className="mt-1 text-sm font-medium">Everything Sam and you said, in order</h3></div><span className="text-xs text-[var(--app-fg-soft)]">{session.transcript.length} turns</span></summary>
          <div className="space-y-3 border-t border-[var(--app-border)] p-5 text-sm">{session.transcript.map((t, i) => <p key={i} className={t.role === "user" ? "text-[var(--app-fg)]" : "text-[var(--app-fg-muted)]"}><span className="mr-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--app-fg-soft)]">{t.role === "user" ? "You" : "Sam"}</span>{t.text}</p>)}</div>
        </details>
      </section>
    )}
  </Shell>;
}

function ReportList({ title, icon, items, ordered }: { title: string; icon: React.ReactNode; items: string[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return <div className={`${cardClass} p-5`}><div className="flex items-center gap-2">{icon}<h3 className="font-medium">{title}</h3></div><Tag className={`${ordered ? "list-decimal" : "list-disc"} mt-4 space-y-2 pl-5 text-sm leading-5 text-[var(--app-fg-muted)]`}>{items.map((x) => <li key={x}>{x}</li>)}</Tag></div>;
}

export default function AiInterviewsPage() {
  const { pathname } = useLocation();
  if (pathname === "/ai-interviews") return <Dashboard />;
  if (pathname === "/ai-interviews/new") return <NewInterview />;
  if (pathname.endsWith("/ready")) return <Ready />;
  if (pathname.endsWith("/live")) return <Live />;
  if (pathname.endsWith("/processing")) return <Processing />;
  if (pathname.endsWith("/report")) return <Report />;
  return <Shell><ErrorPanel message="This interview page does not exist." /></Shell>;
}
