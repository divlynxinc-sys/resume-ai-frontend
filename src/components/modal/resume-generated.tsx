import { FiCheck } from "react-icons/fi";

function Halo() {
  return (
    <div className="mx-auto mb-6 flex items-center justify-center">
      <div className="relative">
        {/* outer glow */}
        <div className="absolute -inset-10 rounded-full bg-blue-600/10 blur-2xl" aria-hidden />
        {/* concentric rings */}
        <div className="flex items-center justify-center rounded-full border border-blue-500/30 bg-blue-600/10 size-28">
          <div className="flex items-center justify-center rounded-full border border-blue-500/40 bg-blue-600/20 size-20">
            <div className="flex items-center justify-center rounded-full bg-blue-600 size-12 shadow-[0_12px_30px_rgba(56,189,248,0.35)]">
              <FiCheck className="text-white text-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResumeGeneratedScreen() {
  return (
    <div className="min-h-screen w-full bg-[var(--app-bg)] text-white flex items-center justify-center px-4">
      <div className="relative w-full max-w-xl">
        {/* card glow */}
        <div className="absolute -inset-6 rounded-[32px] bg-blue-600/10 blur-2xl" aria-hidden />

        <div className="relative rounded-3xl border border-white/10 bg-[#0F1629]/80 p-8 sm:p-10 text-center shadow-xl backdrop-blur">
          <Halo />

          <h1 className="text-2xl sm:text-3xl font-semibold">Resume Generated<br />Successfully</h1>
          <p className="mt-3 text-sm text-white/70">
            Your resume has been successfully generated. You can now view, edit, or
            download it to start applying for your dream job.
          </p>

          <div className="my-6 h-px bg-white/10" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 shadow-[0_10px_20px_rgba(56,189,248,0.25)]">View Resume</button>
            <button disabled className="rounded-lg border border-white/12 bg-[#0C1426] px-4 py-2.5 text-sm font-medium text-white/40">Download</button>
          </div>
        </div>
      </div>
    </div>
  );
}