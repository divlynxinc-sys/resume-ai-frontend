import { useState } from "react";
import { FiCheck, FiChevronDown, FiDownload, FiEye } from "react-icons/fi";

function Halo() {
  return (
    <div className="mx-auto mb-6 flex items-center justify-center">
      <div className="relative">
        <div className="absolute -inset-10 rounded-full bg-blue-600/10 blur-2xl" aria-hidden />
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

function DownloadDropdown() {
  const [open, setOpen] = useState(false);

  const formats = [
    { label: "Download as PDF", format: "pdf" },
    { label: "Download as DOCX", format: "docx" },
    { label: "Download as TXT", format: "txt" },
  ];

  const handleDownload = (format: string) => {
    setOpen(false);
    // TODO: wire to actual download service
    console.log(`Downloading as ${format}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-[#0C1426] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111B30] transition-colors w-full justify-center"
      >
        <FiDownload className="size-4" />
        Download
        <FiChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-lg border border-white/10 bg-[#0C1426] shadow-xl overflow-hidden">
            {formats.map((f) => (
              <button
                key={f.format}
                onClick={() => handleDownload(f.format)}
                className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
              >
                {f.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ResumeGeneratedScreen() {
  return (
    <div className="min-h-screen w-full bg-[var(--app-bg)] text-white flex items-center justify-center px-4">
      <div className="relative w-full max-w-xl">
        <div className="absolute -inset-2 sm:-inset-6 rounded-[32px] bg-blue-600/10 blur-2xl" aria-hidden />

        <div className="relative rounded-3xl border border-white/10 bg-[#0F1629]/80 p-8 sm:p-10 text-center shadow-xl backdrop-blur">
          <Halo />

          <h1 className="text-2xl sm:text-3xl font-semibold">Resume Generated<br />Successfully</h1>
          <p className="mt-3 text-sm text-white/70">
            Your resume has been successfully generated. You can now view, edit, or
            download it to start applying for your dream job.
          </p>

          <div className="my-6 h-px bg-white/10" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button className="inline-flex items-center gap-2 justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 shadow-[0_10px_20px_rgba(56,189,248,0.25)]">
              <FiEye className="size-4" />
              Full Preview
            </button>
            <DownloadDropdown />
          </div>

          <p className="mt-3 text-xs text-white/40">Only 5 downloads left</p>
        </div>
      </div>
    </div>
  );
}
