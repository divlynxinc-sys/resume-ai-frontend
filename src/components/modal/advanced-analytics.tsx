import type { ReactNode } from "react";
import SiteNavbar from "../layout/site-navbar";


function StatCard({
  title,
  value,
  delta,
  positive = true,
}: {
  title: string;
  value: string;
  delta: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/12 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
      <div className="text-white/70 text-sm">{title}</div>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
      <div className={`mt-2 text-xs ${positive ? "text-emerald-400" : "text-rose-400"}`}>
        {positive ? "↗" : "↘"} {delta}
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="text-white/80 font-semibold text-sm">{children}</h2>;
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/12 p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">{children}</div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-white/10">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-[#2b5bd9] to-[#4a7dff]"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function LineChart() {
  return (
    <div className="h-64 rounded-2xl bg-[#0f162a] border border-white/10 relative overflow-hidden">
      <svg viewBox="0 0 800 260" className="absolute inset-0">
        <defs>
          <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(74, 125, 255, 0.35)" />
            <stop offset="100%" stopColor="rgba(74, 125, 255, 0.0)" />
          </linearGradient>
        </defs>
        <path
          d="M0 180 C 120 80 180 120 260 150 C 340 180 380 150 430 140 C 520 120 560 220 640 200 C 710 185 760 80 800 80 L 800 260 L 0 260 Z"
          fill="url(#blueGrad)"
        />
        <path
          d="M0 180 C 120 80 180 120 260 150 C 340 180 380 150 430 140 C 520 120 560 220 640 200 C 710 185 760 80 800 80"
          stroke="#4a7dff"
          strokeWidth="3"
          fill="none"
        />
      </svg>
      <div className="absolute bottom-2 left-0 right-0 px-4 flex justify-between text-xs text-white/60">
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
        <span>Jul</span>
        <span>Aug</span>
      </div>
    </div>
  );
}

export default function AdvancedAnalyticsModal() {
  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white">
      <SiteNavbar />
      <main className="max-w-[1100px] mx-auto px-6 py-10">
        <h1 className="text-2xl sm:text-3xl font-semibold">Resume Analytics</h1>
        <p className="text-white/60 mt-2">Gain insights into your resume's performance and optimize it for better results.</p>
        <div className="mt-6">
          <SectionHeading>Overall Performance</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-3">
            <StatCard title="ATS Compatibility" value="95%" delta="+5%" positive />
            <StatCard title="Readability Score" value="78/100" delta="-2%" positive={false} />
            <StatCard title="Keyword Density" value="6.2%" delta="+1.5%" positive />
          </div>
        </div>
        <div className="mt-10">
          <SectionHeading>Keyword Analysis</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
            <Card>
              <div className="text-white/80">Top Keywords</div>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-white/70 text-xs">Project Management</div>
                  <ProgressBar value={90} />
                </div>
                <div>
                  <div className="text-white/70 text-xs">Data Analysis</div>
                  <ProgressBar value={72} />
                </div>
                <div>
                  <div className="text-white/70 text-xs">Communication</div>
                  <ProgressBar value={85} />
                </div>
                <div>
                  <div className="text-white/70 text-xs">Leadership</div>
                  <ProgressBar value={80} />
                </div>
                <div>
                  <div className="text-white/70 text-xs">Problem Solving</div>
                  <ProgressBar value={75} />
                </div>
              </div>
            </Card>
            <Card>
              <div className="text-white/80">Keyword Frequency</div>
              <div className="mt-4 h-40 rounded-lg bg-[#0f162a] border border-white/10 flex items-end justify-between px-4 pb-3">
                {['Jan','Feb','Mar','Apr','May'].map((m) => (
                  <span key={m} className="text-xs text-white/60">{m}</span>
                ))}
              </div>
            </Card>
          </div>
        </div>
        <div className="mt-10">
          <SectionHeading>Readability and Structure</SectionHeading>
          <Card>
            <div className="text-white/70 text-sm">Readability Score Over Time</div>
            <div className="mt-4">
              <LineChart />
            </div>
          </Card>
        </div>
        <div className="mt-10">
          <SectionHeading>Industry Benchmarks</SectionHeading>
          <Card>
            <div className="text-white/70 text-sm">Comparison with Industry Average</div>
            <div className="mt-4 space-y-5">
              <div>
                <div className="text-xs text-white/60">Your Resume Score</div>
                <div className="flex items-center gap-4">
                  <div className="flex-1"><ProgressBar value={82} /></div>
                  <div className="w-12 text-right text-white/70 text-xs">82%</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-white/60">Industry Average</div>
                <div className="flex items-center gap-4">
                  <div className="flex-1"><ProgressBar value={65} /></div>
                  <div className="w-12 text-right text-white/70 text-xs">65%</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}