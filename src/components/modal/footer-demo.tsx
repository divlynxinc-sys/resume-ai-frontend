import SiteFooter from "../layout/site-footer";

function Hero() {
  return (
    <section className="text-center py-20">
      <h1 className="text-3xl sm:text-5xl font-extrabold">Craft a Resume That Gets Results</h1>
      <p className="text-white/70 mt-3 max-w-[720px] mx-auto">
        Use our AI-powered tools to create a professional resume that highlights your skills and experience, helping you land your dream job.
      </p>
      <div className="mt-6 flex items-center justify-center gap-4">
        <button className="h-11 px-5 rounded-full bg-[oklch(0.488_0.243_264.376)] text-white text-sm">Get Started Free</button>
        <button className="h-11 px-5 rounded-full bg-white/6 border border-white/12 text-white text-sm">Browse All Templates</button>
      </div>
    </section>
  );
}

export default function FooterDemoScreen() {
  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white flex flex-col">
      <main className="flex-1">
        <Hero />
      </main>
      <SiteFooter />
    </div>
  );
}