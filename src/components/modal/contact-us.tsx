import type { ReactNode } from "react";

function Label({ children }: { children: ReactNode }) {
  return <label className="text-white/60 text-xs mb-1 block">{children}</label>;
}

function Input({ placeholder, type = "text" }: { placeholder: string; type?: string }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="w-full h-10 rounded-md border border-white/20 bg-transparent px-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/35"
    />
  );
}

function Textarea({ placeholder }: { placeholder: string }) {
  return (
    <textarea
      placeholder={placeholder}
      className="w-full h-28 rounded-md border border-white/20 bg-transparent px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-white/35"
    />
  );
}

export default function ContactUsModal() {
  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white">
      <main className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-semibold text-center">Get in Touch with Us</h1>
        <p className="text-white/60 text-center mt-2">
          We're here to help! Reach out to us with any questions or feedback.
        </p>

        <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div className="mt-4 space-y-3 text-white/80">
                <div className="flex items-center gap-3">
                  <svg className="size-5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <a href="mailto:info@divlynx.com" className="text-[var(--accent-text)] underline underline-offset-4 hover:text-[var(--accent-hover)]">
                    info@divlynx.com
                  </a>
                </div>
              </div>
            </div>

            <div>
              <div className="space-y-4">
                <div>
                  <Label>Your Name</Label>
                  <Input placeholder="John Doe" />
                </div>
                <div>
                  <Label>Your Email</Label>
                  <Input placeholder="you@example.com" type="email" />
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input placeholder="Question about pricing" />
                </div>
                <div>
                  <Label>Your Message</Label>
                  <Textarea placeholder="Your message here..." />
                </div>
                <button className="w-full mt-2 rounded-md bg-[oklch(0.488_0.243_264.376)] py-2.5 text-white font-medium shadow-md shadow-[oklch(0.488_0.243_264.376)/30]">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-12 text-center">
          <h3 className="text-xl font-semibold">Looking for Immediate Answers?</h3>
          <p className="text-white/60 mt-2">Our Help Center is packed with articles and tutorials to guide you.</p>
          <button className="mt-4 rounded-full bg-[oklch(0.488_0.243_264.376)] px-5 py-2.5 text-white shadow-md shadow-[oklch(0.488_0.243_264.376)/30]">Go to Help Center</button>
        </section>

        <footer className="mt-14 text-center text-white/70">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
          </div>
          <div className="mt-3 text-xs">© 2024 Jobsynk AI. All rights reserved.</div>
        </footer>
      </main>
    </div>
  );
}
