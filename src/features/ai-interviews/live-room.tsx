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
import { DisconnectReason } from "livekit-client";
import { Clock3, LoaderCircle, Mic, MicOff, PhoneOff, TriangleAlert } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { cardClass } from "./components";
import type { LiveConnection } from "./types";
import { formatTime } from "./utils";

export type LiveEndReason = "agent_finished" | "candidate_left" | "error";

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

const STATE_LABEL: Record<string, string> = {
  disconnected: "Connecting to the room…",
  connecting: "Connecting to the room…",
  "pre-connect-buffering": "Connecting to the room…",
  initializing: "Your interviewer is joining…",
  idle: "Your interviewer is ready",
  listening: "Sam is listening",
  thinking: "Sam is thinking…",
  speaking: "Sam is speaking",
  failed: "Your interviewer could not join",
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
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const transcriptions = useTranscriptions();
  const volumes = useMultibandTrackVolume(audioTrack, { bands: 14 });
  const [elapsed, setElapsed] = useState(0);
  const [agentTimedOut, setAgentTimedOut] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const mounted = useRef(Date.now());

  useEffect(() => {
    const start = startedAt ? new Date(startedAt).getTime() : mounted.current;
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, [startedAt]);

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

  const captionsRef = useRef<HTMLDivElement>(null);
  useEffect(() => { captionsRef.current?.scrollTo({ top: captionsRef.current.scrollHeight }); }, [captions]);

  const leave = async () => {
    if (leaving) return;
    setLeaving(true);
    try { await room.disconnect(); } catch { /* onDisconnected still fires */ }
    onLeave();
  };

  const remaining = Math.max(0, durationMinutes * 60 - elapsed);
  const label = error ? "Connection problem" : agentTimedOut && !agent ? "Your interviewer is taking longer than usual" : STATE_LABEL[state] ?? "Connecting…";
  const live = state === "listening" || state === "thinking" || state === "speaking";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--app-border)] pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-text)]">Live interview · {roleTitle}</p>
          <h1 className="mt-1 font-display text-2xl font-light">{label}</h1>
        </div>
        <span className="rounded-full bg-[var(--app-surface)] px-3 py-2 font-mono text-sm" aria-label="Time remaining">
          <Clock3 className="mr-1.5 inline size-4" />{formatTime(remaining)}
        </span>
      </div>

      <section className={`${cardClass} mt-8 overflow-hidden`}>
        <div className="flex flex-col items-center bg-[linear-gradient(135deg,var(--accent-soft),var(--app-surface))] px-6 py-10 sm:py-14">
          <div className="flex h-24 items-end justify-center gap-1.5" aria-hidden>
            {Array.from({ length: 14 }, (_, i) => {
              const v = volumes[i] ?? 0;
              const height = live ? 10 + Math.min(80, Math.round(v * 220)) : 10;
              return <span key={i} className={`w-2 rounded-full transition-[height] duration-100 ${state === "speaking" ? "bg-[var(--accent)]" : state === "thinking" ? "bg-violet-400 animate-pulse" : "bg-[var(--app-border-strong)]"}`} style={{ height }} />;
            })}
          </div>
          <p className="mt-6 text-sm text-[var(--app-fg-muted)]" aria-live="polite">
            {!live && !error && <LoaderCircle className="mr-2 inline size-4 animate-spin text-[var(--accent)]" />}
            {error ? error : state === "listening" ? "Answer naturally — take a moment to think whenever you need to." : state === "speaking" ? "Listen for the question. You can start answering when Sam finishes." : state === "thinking" ? "One moment…" : agentTimedOut && !agent ? "If nothing happens in the next few seconds, leave and rejoin from your interview list." : "Setting things up — this usually takes a few seconds."}
          </p>
          <StartAudio label="Tap to enable interviewer audio" className="mt-4 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 p-5">
          <AppButton variant="secondary" onClick={() => void localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)} aria-pressed={!isMicrophoneEnabled}>
            {isMicrophoneEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
            {isMicrophoneEnabled ? "Mute" : "Unmute"}
          </AppButton>
          <AppButton variant="danger" onClick={leave} disabled={leaving}>
            {leaving ? <LoaderCircle className="size-4 animate-spin" /> : <PhoneOff className="size-4" />}
            {leaving ? "Leaving…" : "End interview"}
          </AppButton>
        </div>
      </section>

      <section className={`${cardClass} mt-5 p-5`} aria-label="Live captions">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Live captions</h2>
          {!isMicrophoneEnabled && <span className="inline-flex items-center gap-1 text-xs text-amber-600"><TriangleAlert className="size-3.5" />Your microphone is muted</span>}
        </div>
        <div ref={captionsRef} className="mt-3 max-h-56 space-y-3 overflow-y-auto pr-1 text-sm">
          {captions.length === 0 ? (
            <p className="text-[var(--app-fg-soft)]">Captions appear here as the conversation happens.</p>
          ) : captions.map((c) => (
            <p key={c.id} className={c.mine ? "text-[var(--app-fg-muted)]" : "text-[var(--app-fg)]"}>
              <span className="mr-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--app-fg-soft)]">{c.mine ? "You" : "Sam"}</span>{c.text}
            </p>
          ))}
        </div>
      </section>
      <p className="mt-4 text-center text-xs text-[var(--app-fg-muted)]">Audio is processed live and never stored. Your transcript is saved when the interview ends so we can build your report.</p>
    </div>
  );
}
