/**
 * Spoken proctoring warnings.
 *
 * A banner is the wrong channel for this: the candidate earning a "looking away"
 * warning is, by definition, not looking at the screen. The warning is therefore
 * said out loud through the speakers, using the browser's own speech synthesis —
 * no network call, no extra dependency, and independent of the interviewer's
 * voice (which comes from the LiveKit room).
 */

let cachedVoice: SpeechSynthesisVoice | null = null;
let voiceResolved = false;

function synth(): SpeechSynthesis | null {
  try {
    return typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
  } catch {
    return null;
  }
}

/** Prefer a local en-* voice; a remote one adds latency the warning cannot afford. */
function pickVoice(s: SpeechSynthesis): SpeechSynthesisVoice | null {
  const voices = s.getVoices();
  if (!voices.length) return null;
  const en = voices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
  return en.find((v) => v.localService) ?? en[0] ?? voices[0];
}

/**
 * `getVoices()` is empty until the engine loads on some browsers, so warm it up
 * when the interview screen mounts rather than at the moment of a violation.
 */
export function primeSpeech() {
  const s = synth();
  if (!s || voiceResolved) return;
  const resolve = () => {
    const v = pickVoice(s);
    if (v) {
      cachedVoice = v;
      voiceResolved = true;
    }
  };
  resolve();
  if (!voiceResolved) s.addEventListener("voiceschanged", resolve, { once: true });
}

/**
 * Says `text` immediately, cancelling anything still being spoken — a stale
 * warning must never queue in front of the current one.
 */
export function speak(text: string) {
  const s = synth();
  if (!s) return;
  try {
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (cachedVoice) u.voice = cachedVoice;
    u.lang = cachedVoice?.lang || "en-US";
    u.rate = 1.05;
    u.pitch = 1;
    u.volume = 1;
    s.speak(u);
  } catch {
    /* speech unavailable — the banner and chime still fire */
  }
}

export function stopSpeech() {
  try {
    synth()?.cancel();
  } catch {
    /* nothing to stop */
  }
}
