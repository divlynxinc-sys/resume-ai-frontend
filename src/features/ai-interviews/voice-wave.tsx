import { useEffect, useRef } from "react";
import { WAVE_TONE } from "./utils";
import type { BandSource, WaveTone } from "./types";

/**
 * One voice visualiser for the whole feature — the mic test and the live room
 * both render this, so the wave looks and moves identically on every screen.
 *
 * Two things it deliberately does that the old per-screen bar rows did not:
 *  - it animates on its own rAF loop with an asymmetric envelope (fast attack,
 *    slow release) instead of a CSS `transition-[height]`, so the motion no
 *    longer stutters at whatever rate the audio source happens to publish; and
 *  - it mirrors the band values around the centre and weights them with a bell
 *    curve, so the bars read as a single shape rather than a random picket fence.
 */

const prefersReducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const read = (source: BandSource): readonly number[] => (Array.isArray(source) ? source : (source as { current: readonly number[] }).current);

/** Nearest-neighbour sample of an arbitrary-length band array at position `k` of `count`. */
function sample(src: readonly number[], k: number, count: number) {
  if (!src.length) return 0;
  const i = Math.round((k / Math.max(1, count - 1)) * (src.length - 1));
  return src[Math.min(src.length - 1, Math.max(0, i))] ?? 0;
}

interface VoiceWaveProps {
  source: BandSource;
  /** Number of bars drawn. */
  bars?: number;
  /** When false the wave settles into a slow breathing idle instead of following the audio. */
  active?: boolean;
  gain?: number;
  height?: number;
  barWidth?: number;
  gap?: number;
  minScale?: number;
  className?: string;
  /** Called once per frame with the smoothed 0–1 average, for a halo or glow that tracks the voice. */
  onLevel?: (level: number) => void;
}

export function VoiceWave({
  source,
  bars = 9,
  active = true,
  gain = 2.4,
  height = 72,
  barWidth = 6,
  gap = 7,
  minScale = 0.09,
  className = "",
  onLevel,
}: VoiceWaveProps) {
  const els = useRef<(HTMLSpanElement | null)[]>([]);
  const latest = useRef<BandSource>(source);
  const activeRef = useRef(active);
  const gainRef = useRef(gain);
  const levelCb = useRef(onLevel);
  latest.current = source;
  activeRef.current = active;
  gainRef.current = gain;
  levelCb.current = onLevel;

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const smoothed = new Array(bars).fill(0);
    // Centre-weighted envelope: the middle bars carry the most amplitude.
    const envelope = Array.from({ length: bars }, (_, i) => Math.sin((Math.PI * (i + 0.5)) / bars) ** 0.55);
    const t0 = performance.now();
    let frame = requestAnimationFrame(function loop(t) {
      frame = requestAnimationFrame(loop);
      const src = read(latest.current);
      let sum = 0;
      for (let i = 0; i < bars; i++) {
        let target: number;
        if (activeRef.current && src.length) {
          // Fold the spectrum onto itself so the wave is symmetric about the centre.
          target = ((sample(src, i, bars) + sample(src, bars - 1 - i, bars)) / 2) * gainRef.current * envelope[i];
        } else if (reduced) {
          target = 0.05;
        } else {
          target = (0.05 + 0.05 * (1 + Math.sin((t - t0) / 640 + i * 0.62))) * envelope[i];
        }
        target = target > 1 ? 1 : target < 0 ? 0 : target;
        // Fast attack so speech feels immediate, slow release so it never flickers.
        smoothed[i] += (target - smoothed[i]) * (target > smoothed[i] ? 0.42 : 0.11);
        sum += smoothed[i];
        const el = els.current[i];
        if (el) el.style.transform = `scaleY(${(minScale + (1 - minScale) * smoothed[i]).toFixed(4)})`;
      }
      levelCb.current?.(sum / bars);
    });
    return () => cancelAnimationFrame(frame);
  }, [bars, minScale]);

  return (
    <div className={`flex items-center justify-center ${className}`} style={{ height, gap }} aria-hidden>
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          ref={(el) => { els.current[i] = el; }}
          className="block shrink-0 rounded-full bg-[var(--wave)] transition-colors duration-500 will-change-transform"
          style={{ width: barWidth, height, transform: `scaleY(${minScale})` }}
        />
      ))}
    </div>
  );
}

interface VoiceOrbProps {
  source: BandSource;
  tone: WaveTone;
  active: boolean;
  /** Slowly rotating ring, used while the interviewer is thinking. */
  working?: boolean;
  size?: number;
  bars?: number;
  className?: string;
}

/** The live room's centrepiece: a halo that breathes with the voice, with the wave at its core. */
export function VoiceOrb({ source, tone, active, working = false, size = 208, bars = 9, className = "" }: VoiceOrbProps) {
  const halo = useRef<HTMLSpanElement>(null);
  const core = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`relative grid place-items-center ${className}`}
      style={{ width: size, height: size, ["--wave" as string]: WAVE_TONE[tone] }}
    >
      <span
        ref={halo}
        className="pointer-events-none absolute inset-0 rounded-full blur-2xl will-change-transform"
        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--wave) 55%, transparent) 0%, transparent 68%)", opacity: 0.35 }}
        aria-hidden
      />
      <span
        className={`pointer-events-none absolute inset-[6%] rounded-full border border-dashed border-[color-mix(in_srgb,var(--wave)_45%,transparent)] transition-opacity duration-500 ${working ? "motion-safe:animate-spin motion-safe:[animation-duration:9s]" : "opacity-0"}`}
        aria-hidden
      />
      <span className="pointer-events-none absolute inset-[13%] rounded-full border border-[color-mix(in_srgb,var(--wave)_28%,transparent)]" aria-hidden />
      <div
        ref={core}
        className="relative grid place-items-center rounded-full bg-[var(--app-surface)] shadow-[0_18px_44px_-22px_color-mix(in_srgb,var(--wave)_70%,transparent)] will-change-transform"
        style={{ width: size * 0.66, height: size * 0.66 }}
      >
        <VoiceWave
          source={source}
          bars={bars}
          active={active}
          height={Math.round(size * 0.34)}
          barWidth={Math.max(4, Math.round(size * 0.028))}
          gap={Math.max(4, Math.round(size * 0.03))}
          onLevel={(level) => {
            if (halo.current) {
              halo.current.style.transform = `scale(${(0.82 + level * 0.5).toFixed(3)})`;
              halo.current.style.opacity = `${(0.24 + level * 0.55).toFixed(3)}`;
            }
            if (core.current) core.current.style.transform = `scale(${(1 + level * 0.045).toFixed(4)})`;
          }}
        />
      </div>
    </div>
  );
}
