import { useEffect, useMemo, useRef, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  useLocalParticipant,
  useMultibandTrackVolume,
  useRoomContext,
  useTranscriptions,
  useVoiceAssistant,
} from "@livekit/components-react";
import { DisconnectReason, LocalAudioTrack } from "livekit-client";
import { LoaderCircle, Mic, MicOff, PhoneOff, TriangleAlert, Volume2 } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { cardClass } from "./components";
import { useSessionClock } from "./hooks";
import { SessionTimer } from "./session-timer";
import { VoiceOrb } from "./voice-wave";
import { WAVE_TONE } from "./utils";
import type { LiveConnection, WaveTone } from "./types";

export type LiveEndReason = "agent_finished" | "candidate_left" | "error";

/** Bars drawn in the orb — also the band count we ask LiveKit's analyser for. */
const BANDS = 9;

interface LiveInterviewRoomProps {
  connection: LiveConnection;
  roleTitle: string;
  durationMinutes: number;
  startedAt?: string;
  onEnded: (reason: LiveEndReason, detail?: string) => void;
}

/**
 * The live interview: joins the LiveKit room with the mic, renders the
 * interviewer's audio, and shows state + captions. Ending the room (either the
 * interviewer wrapping up, or the candidate leaving) reports back via `onEnded`.
 */
export function LiveInterviewRoom({ connection, roleTitle, durationMinutes, startedAt, onEnded }: LiveInterviewRoomProps) {
  const [error, setError] = useState("");
  const ended = useRef(false);
  const finish = (reason: LiveEndReason, detail?: string) => {
    if (ended.current) return;
    ended.current = true;
    onEnded(reason, detail);
  };

  return (
    <LiveKitRoom
      serverUrl={connection.url}
      token={connection.token}
      connect
      audio
      video={false}
      className="contents"
      onDisconnected={(reason) => {
        if (reason === DisconnectReason.ROOM_DELETED || reason === DisconnectReason.PARTICIPANT_REMOVED) finish("agent_finished");
        else if (reason === DisconnectReason.CLIENT_INITIATED) finish("candidate_left");
        else finish("error", "The connection to the interview room was lost.");
      }}
      onError={(e) => setError(e.message || "We could not connect to the interview room.")}
      onMediaDeviceFailure={() => setError("We could not access your microphone. Allow microphone access in your browser settings, then rejoin.")}
    >
      <RoomAudioRenderer />
      <Stage
        roleTitle={roleTitle}
        durationMinutes={durationMinutes}
        startedAt={startedAt}
        agentJoinTimeoutSeconds={connection.agentJoinTimeoutSeconds}
        participantIdentity={connection.participantIdentity}
        error={error}
        onLeave={() => finish("candidate_left")}
      />
    </LiveKitRoom>
  );
}

type Phase = "connecting" | "joining" | "ready" | "listening" | "thinking" | "speaking" | "waiting" | "failed" | "error";

interface PhaseCopy {
  /** Short label, shown in the status chip. */
  title: string;
  hint: string;
  tone: WaveTone;
  /** Whether the orb should follow live audio rather than idle. */
  live: boolean;
}

const PHASES: Record<Phase, PhaseCopy> = {
  connecting: { title: "Connecting", hint: "Setting up your room — this usually takes a few seconds.", tone: "idle", live: false },
  joining: { title: "Sam is joining", hint: "Your interviewer is coming on the line.", tone: "idle", live: false },
  ready: { title: "Ready to begin", hint: "Sam will open the conversation in a moment.", tone: "idle", live: false },
  listening: { title: "Your turn", hint: "Answer naturally — take a moment to think whenever you need to.", tone: "you", live: true },
  thinking: { title: "Sam is thinking", hint: "Give it a second — Sam is putting the next question together.", tone: "thinking", live: false },
  speaking: { title: "Sam is speaking", hint: "Listen for the question, then answer once Sam finishes.", tone: "sam", live: true },
  waiting: { title: "Sam is taking longer than usual", hint: "If nothing happens in the next few seconds, leave and rejoin from your interview list.", tone: "idle", live: false },
  failed: { title: "Sam could not join", hint: "Leave the room and start this interview again from your interview list.", tone: "idle", live: false },
  error: { title: "Connection problem", hint: "", tone: "idle", live: false },
};

const AGENT_STATE_PHASE: Record<string, Phase> = {
  disconnected: "connecting",
  connecting: "connecting",
  "pre-connect-buffering": "connecting",
  initializing: "joining",
  idle: "ready",
  listening: "listening",
  thinking: "thinking",
  speaking: "speaking",
  failed: "failed",
};

interface StageProps {
  roleTitle: string;
  durationMinutes: number;
  startedAt?: string;
  agentJoinTimeoutSeconds: number;
  participantIdentity: string;
  error: string;
  onLeave: () => void;
}

function Stage({ roleTitle, durationMinutes, startedAt, agentJoinTimeoutSeconds, participantIdentity, error, onLeave }: StageProps) {
  const room = useRoomContext();
  const { state, audioTrack, agent } = useVoiceAssistant();
  const { localParticipant, isMicrophoneEnabled, microphoneTrack } = useLocalParticipant();
  const transcriptions = useTranscriptions();
  const clock = useSessionClock(startedAt, durationMinutes);
  const [agentTimedOut, setAgentTimedOut] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // The orb follows whoever holds the floor. Watching only the agent's track (as
  // this screen used to) left the wave flat for the entire time the candidate was
  // answering, which read as a broken visualiser.
  const localTrack = microphoneTrack?.track;
  const samBands = useMultibandTrackVolume(audioTrack, { bands: BANDS, updateInterval: 50 });
  const myBands = useMultibandTrackVolume(localTrack instanceof LocalAudioTrack ? localTrack : undefined, { bands: BANDS, updateInterval: 50 });

  useEffect(() => {
    if (agent) { setAgentTimedOut(false); return; }
    const t = window.setTimeout(() => setAgentTimedOut(true), agentJoinTimeoutSeconds * 1000);
    return () => window.clearTimeout(t);
  }, [agent, agentJoinTimeoutSeconds]);

  const captions = useMemo(() => {
    const items = transcriptions.map((t) => ({
      id: t.streamInfo.id,
      at: t.streamInfo.timestamp,
      mine: t.participantInfo.identity === participantIdentity || t.participantInfo.identity === localParticipant.identity,
      text: t.text,
    }));
    items.sort((a, b) => a.at - b.at);
    return items.slice(-8);
  }, [transcriptions, participantIdentity, localParticipant.identity]);

  // Both volume subscriptions re-render this component ~20x/s; keeping the caption
  // list memoised means the ticks only touch the orb.
  const captionList = useMemo(() => captions.length === 0 ? (
    <p className="py-6 text-center text-sm text-[var(--app-fg-soft)]">Captions appear here as the conversation happens.</p>
  ) : captions.map((c) => (
    <div key={c.id} className={`flex ${c.mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
        c.mine ? "rounded-br-sm bg-[var(--accent-soft)] text-[var(--app-fg)]" : "rounded-bl-sm bg-[var(--app-surface-2)] text-[var(--app-fg)]"
      }`}>
        <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--app-fg-soft)]">{c.mine ? "You" : "Sam"}</span>
        {c.text}
      </div>
    </div>
  )), [captions]);

  const captionsRef = useRef<HTMLDivElement>(null);
  useEffect(() => { captionsRef.current?.scrollTo({ top: captionsRef.current.scrollHeight, behavior: "smooth" }); }, [captions]);

  const leave = async () => {
    if (leaving) return;
    setLeaving(true);
    try { await room.disconnect(); } catch { /* onDisconnected still fires */ }
    onLeave();
  };

  const phase: Phase = error ? "error" : agentTimedOut && !agent ? "waiting" : AGENT_STATE_PHASE[state] ?? "connecting";
  const copy = PHASES[phase];
  const yourTurnMuted = phase === "listening" && !isMicrophoneEnabled;
  const tone: WaveTone = yourTurnMuted ? "muted" : copy.tone;
  const hint = phase === "error" ? error : yourTurnMuted ? "Your microphone is muted — unmute to answer." : copy.hint;
  const busy = phase === "connecting" || phase === "joining";

  return (
    <div className="mx-auto max-w-3xl">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--accent-text)]">Live interview</p>
          <h1 className="mt-1 truncate font-display text-2xl font-light tracking-tight sm:text-3xl">{roleTitle}</h1>
        </div>
        <SessionTimer {...clock} />
      </header>

      <section className={`${cardClass} mt-6 overflow-hidden`}>
        <div className="relative flex flex-col items-center px-6 py-10 sm:py-12" style={{ ["--wave" as string]: WAVE_TONE[tone] }}>
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--wave) 13%, transparent) 0%, transparent 62%)" }}
            aria-hidden
          />

          <div className="relative flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--wave)_35%,var(--app-border))] bg-[var(--app-surface)] px-3.5 py-1.5">
            <span className="relative flex size-2">
              {copy.live && <span className="absolute inline-flex size-2 rounded-full bg-[var(--wave)] opacity-70 motion-safe:animate-ping" aria-hidden />}
              <span className="relative inline-flex size-2 rounded-full bg-[var(--wave)]" aria-hidden />
            </span>
            <span className="text-xs font-medium tracking-tight text-[var(--app-fg)]">{copy.title}</span>
            {busy && <LoaderCircle className="size-3.5 animate-spin text-[var(--app-fg-soft)]" aria-hidden />}
          </div>

          <VoiceOrb
            className="relative mt-7"
            source={phase === "listening" ? myBands : samBands}
            tone={tone}
            active={copy.live && !yourTurnMuted}
            working={phase === "thinking"}
            bars={BANDS}
          />

          <p className="relative mt-6 max-w-md text-center text-sm leading-6 text-[var(--app-fg-muted)]" aria-live="polite">
            {hint}
          </p>

          <StartAudio
            label="Enable interviewer audio"
            className="relative mt-5 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-soft)] hover:bg-[var(--accent-hover)]"
          />
        </div>

        <div className="flex items-center justify-center gap-3 border-t border-[var(--app-border)] bg-[var(--app-surface-2)] p-4">
          <button
            type="button"
            onClick={() => void localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
            aria-pressed={!isMicrophoneEnabled}
            aria-label={isMicrophoneEnabled ? "Mute your microphone" : "Unmute your microphone"}
            title={isMicrophoneEnabled ? "Mute" : "Unmute"}
            className={`grid size-11 cursor-pointer place-items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
              isMicrophoneEnabled
                ? "border-[var(--app-border-strong)] bg-[var(--app-surface)] text-[var(--app-fg)] hover:bg-[var(--app-surface-2)]"
                : "border-amber-500/40 bg-amber-500/15 text-amber-600"
            }`}
          >
            {isMicrophoneEnabled ? <Mic className="size-5" /> : <MicOff className="size-5" />}
          </button>
          <span className="min-w-16 text-sm text-[var(--app-fg-muted)]">{isMicrophoneEnabled ? "Mic on" : "Muted"}</span>
          <span className="h-6 w-px bg-[var(--app-border)]" aria-hidden />
          <AppButton variant="danger" onClick={leave} disabled={leaving} className="rounded-full px-5">
            {leaving ? <LoaderCircle className="size-4 animate-spin" /> : <PhoneOff className="size-4" />}
            {leaving ? "Leaving…" : "End interview"}
          </AppButton>
        </div>
      </section>

      <section className={`${cardClass} mt-5 p-5`} aria-label="Live captions">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><Volume2 className="size-4 text-[var(--app-fg-soft)]" />Live captions</h2>
          {!isMicrophoneEnabled && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/12 px-2.5 py-1 text-xs font-medium text-amber-600">
              <TriangleAlert className="size-3.5" />Microphone muted
            </span>
          )}
        </div>
        <div ref={captionsRef} className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1" role="log">
          {captionList}
        </div>
      </section>

      <p className="mt-4 text-center text-xs text-[var(--app-fg-muted)]">Audio is processed live and never stored. Your transcript is saved when the interview ends so we can build your report.</p>
    </div>
  );
}
