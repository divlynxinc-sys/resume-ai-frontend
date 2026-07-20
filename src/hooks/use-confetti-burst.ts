import { useEffect, useRef } from "react";

/** Shared celebratory burst. Change the trigger value to replay it. */
export function useConfettiBurst(trigger: boolean | number = true) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !trigger) return;

    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#10B981", "#34D399", "#60A5FA", "#A78BFA", "#F472B6", "#FBBF24", "#5B6CDB"];

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      rot: number;
      vr: number;
      size: number;
      color: string;
      shape: "rect" | "circle";
      life: number;
    };

    const particles: Particle[] = [];
    const spawnBurst = (count: number) => {
      const width = window.innerWidth;
      for (let index = 0; index < count; index++) {
        particles.push({
          x: Math.random() * width,
          y: -20 - Math.random() * 80,
          vx: (Math.random() - 0.5) * 2.2,
          vy: 0.8 + Math.random() * 1.6,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.18,
          size: 6 + Math.random() * 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: Math.random() > 0.5 ? "rect" : "circle",
          life: 0,
        });
      }
    };

    spawnBurst(90);
    const firstWave = window.setTimeout(() => spawnBurst(60), 700);
    const secondWave = window.setTimeout(() => spawnBurst(40), 1500);
    const gravity = 0.045;
    const drag = 0.998;
    const maxLife = 720;

    let animationFrame = 0;
    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let index = particles.length - 1; index >= 0; index--) {
        const particle = particles[index];
        particle.vy += gravity;
        particle.vx *= drag;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rot += particle.vr;
        particle.life += 1;

        if (particle.y > window.innerHeight + 40 || particle.life > maxLife) {
          particles.splice(index, 1);
          continue;
        }

        const fadeStart = maxLife - 60;
        const alpha = particle.life > fadeStart ? 1 - (particle.life - fadeStart) / 60 : 1;
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rot);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        if (particle.shape === "rect") {
          ctx.fillRect(-particle.size / 2, -particle.size / 3, particle.size, (particle.size * 2) / 3);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (particles.length > 0) {
        animationFrame = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };
    animationFrame = requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(firstWave);
      window.clearTimeout(secondWave);
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
  }, [trigger]);

  return canvasRef;
}
