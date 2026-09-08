import { useCallback, useEffect, useRef, useState } from "react";
import { interviewApi } from "./api";
import type { InterviewSession } from "./types";
import { timerPhase } from "./utils";

/**
 * Ticks once a second from the server's `startedAt`, falling back to mount time
 * on a rejoin where the timestamp has not loaded yet. Kept separate from the
 * readout so the live room can react to the phase as well as show it.
 */
export function useSessionClock(startedAt: string | undefined, durationMinutes: number) {
  const mountedAt = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const parsed = startedAt ? new Date(startedAt).getTime() : NaN;
    const start = Number.isFinite(parsed) ? parsed : mountedAt.current;
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);

  const total = durationMinutes * 60;
  const remaining = Math.max(0, total - elapsed);
  return { elapsed, total, remaining, phase: timerPhase(remaining), progress: total ? Math.min(1, elapsed / total) : 0 };
}

export function useInterviewSession(id?: string) {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true); setError("");
    try { setSession(await interviewApi.getInterview(id)); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load this interview."); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void refresh(); }, [refresh]);
  return { session, setSession, loading, error, refresh };
}

export type RecorderState = "idle" | "recording" | "paused" | "recorded" | "unsupported";

/** Bands the mic test feeds to `<VoiceWave/>` — matches the live room so both screens move alike. */
const BAND_COUNT = 9;
/** Voice sits in the low bins of a 256-point FFT; the rest is mostly silence and would flatten the wave. */
const BIN_LO = 2;
const BIN_HI = 48;

export function useAudioRecorder(maxDurationMs = 180_000) {
  const [state, setState] = useState<RecorderState>(() => typeof MediaRecorder === "undefined" ? "unsupported" : "idle");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState("");
  const [durationMs, setDurationMs] = useState(0);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startedAt = useRef(0);
  const timer = useRef<number | null>(null);
  const analyserFrame = useRef<number | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  /** Mutated in place at frame rate and read by the visualiser's own rAF loop — never a state update. */
  const bands = useRef<number[]>(new Array(BAND_COUNT).fill(0));
  const lastLevel = useRef(0);

  const cleanupStream = useCallback(() => {
    stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null;
    if (analyserFrame.current) cancelAnimationFrame(analyserFrame.current);
    void audioContext.current?.close(); audioContext.current = null;
    bands.current.fill(0); lastLevel.current = 0; setLevel(0);
  }, []);

  const clearRecording = useCallback(() => {
    if (url) URL.revokeObjectURL(url); setUrl(""); setBlob(null); setDurationMs(0); chunks.current = []; setState("idle");
  }, [url]);

  const start = useCallback(async (deviceId?: string) => {
    setError(""); clearRecording();
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setState("unsupported"); setError("Audio recording is not supported in this browser. Try the latest Chrome, Edge, Firefox, or Safari."); return; }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: deviceId ? { deviceId: { exact: deviceId } } : true }); stream.current = media;
      const mr = new MediaRecorder(media); recorder.current = mr; chunks.current = [];
      mr.ondataavailable = (event) => { if (event.data.size) chunks.current.push(event.data); };
      mr.onstop = () => { const next = new Blob(chunks.current, { type: mr.mimeType || "audio/webm" }); setBlob(next); setUrl(URL.createObjectURL(next)); setState(next.size ? "recorded" : "idle"); cleanupStream(); };
      const ctx = new AudioContext(); audioContext.current = ctx; const analyser = ctx.createAnalyser(); analyser.fftSize = 256; ctx.createMediaStreamSource(media).connect(analyser); const data = new Uint8Array(analyser.frequencyBinCount);
      const hi = Math.min(BIN_HI, data.length); const per = (hi - BIN_LO) / BAND_COUNT;
      const tick = () => {
        analyser.getByteFrequencyData(data);
        let total = 0;
        for (let b = 0; b < BAND_COUNT; b++) {
          const from = Math.floor(BIN_LO + b * per); const to = Math.max(from + 1, Math.floor(BIN_LO + (b + 1) * per));
          let sum = 0; for (let i = from; i < to; i++) sum += data[i];
          const value = sum / (to - from) / 255;
          bands.current[b] = value; total += value;
        }
        // The numeric level only feeds the aria label, so throttle it — a state update per frame re-rendered the whole screen.
        const next = Math.min(100, Math.round((total / BAND_COUNT) * 190));
        if (Math.abs(next - lastLevel.current) > 3) { lastLevel.current = next; setLevel(next); }
        analyserFrame.current = requestAnimationFrame(tick);
      }; tick();
      mr.start(250); startedAt.current = Date.now(); setState("recording");
      timer.current = window.setInterval(() => { const elapsed = Date.now() - startedAt.current; setDurationMs(elapsed); if (elapsed >= maxDurationMs && mr.state !== "inactive") mr.stop(); }, 200);
    } catch (e) { cleanupStream(); setState("idle"); setError(e instanceof DOMException && e.name === "NotAllowedError" ? "Microphone access was denied. Allow microphone access in your browser site settings, then try again." : "We could not start your microphone. Check that it is connected and not being used by another app."); }
  }, [cleanupStream, clearRecording, maxDurationMs]);

  const stop = useCallback(() => { if (timer.current) window.clearInterval(timer.current); timer.current = null; if (recorder.current?.state !== "inactive") recorder.current?.stop(); }, []);
  const pause = useCallback(() => { if (recorder.current?.state === "recording") { recorder.current.pause(); setState("paused"); } }, []);
  const resume = useCallback(() => { if (recorder.current?.state === "paused") { recorder.current.resume(); setState("recording"); } }, []);
  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); if (recorder.current?.state !== "inactive") recorder.current?.stop(); cleanupStream(); if (url) URL.revokeObjectURL(url); }, [cleanupStream, url]);
  return { state, blob, url, durationMs, level, bands, error, start, stop, pause, resume, clearRecording };
}

export function useMicrophoneTest() {
  const recorder = useAudioRecorder(10_000);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const request = async () => { await recorder.start(selectedDeviceId || undefined); try { const all = await navigator.mediaDevices.enumerateDevices(); setDevices(all.filter((d) => d.kind === "audioinput")); } catch { /* selector is optional */ } };
  return { ...recorder, start: request, devices, selectedDeviceId, setSelectedDeviceId, request };
}
