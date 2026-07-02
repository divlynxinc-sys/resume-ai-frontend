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

function IconButton({ children }: { children: ReactNode }) {
  return (
    <button className="size-9 rounded-full bg-white/10 border border-white/20 text-white/80 hover:text-white hover:bg-white/15 flex items-center justify-center">
      {children}
    </button>
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

        {/* Modal Card */}
        <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Contact Information */}
            <div>
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div className="mt-4 space-y-3 text-white/80">
                <div className="flex items-center gap-3">
                  <span className="text-white/50">✉️</span>
                  <span>contact@jobsynk.ai</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/50">📞</span>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/50">📍</span>
                  <span>123 Innovation Drive, Tech City, USA</span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-white/90">Office Hours</h4>
                <p className="mt-2 text-white/80">Monday - Friday: 9:00 AM - 5:00 PM (EST)</p>
                <p className="text-white/50 text-sm">Closed on weekends and public holidays.</p>
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-semibold text-white/90">Follow Us</h4>
                <div className="mt-3 flex items-center gap-3">
                  <IconButton>
                    {/* Facebook */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </IconButton>
                  <IconButton>
                    {/* Twitter/X */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4l16 16M20 4L4 20" />
                    </svg>
                  </IconButton>
                  <IconButton>
                    {/* GitHub */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2C7 2 4 5.5 4 10c0 3.5 2.3 6.5 5.5 7.5-.4-.3-.5-.8-.5-1.3v-2c-2 .3-2.5-1-2.5-1 .5-.8 1.1-.9 1.1-.9 1 .7 1.6.5 2 .4.1-.7.4-1.1.7-1.4-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.2-.1-.2-.3-1 .1-2.1 0 0 .7-.2 2.3.8.7-.2 1.5-.3 2.3-.3s1.6.1 2.3.3c1.6-1 2.3-.8 2.3-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.2 0 3.1-1.8 3.8-3.6 4 .4.3.8.9.8 1.8v2.7c0 .5-.1 1.1-.5 1.4C17.7 16.5 20 13.5 20 10c0-4.5-3-8-8-8z" />
                    </svg>
                  </IconButton>
                </div>
              </div>
            </div>

            {/* Right: Form */}
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

        {/* Help Center CTA */}
        <section className="mt-12 text-center">
          <h3 className="text-xl font-semibold">Looking for Immediate Answers?</h3>
          <p className="text-white/60 mt-2">Our Help Center is packed with articles and tutorials to guide you.</p>
          <button className="mt-4 rounded-full bg-[oklch(0.488_0.243_264.376)] px-5 py-2.5 text-white shadow-md shadow-[oklch(0.488_0.243_264.376)/30]">Go to Help Center</button>
        </section>

        {/* Footer */}
        <footer className="mt-14 text-center text-white/70">
          <div className="space-x-6">
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
          </div>
          <div className="mt-3 text-xs">© 2024 Jobsynk AI. All rights reserved.</div>
        </footer>
      </main>
    </div>
  );
}
