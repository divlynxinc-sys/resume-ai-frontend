import SiteNavbar from "../layout/site-navbar";
import { useEffect } from "react";

import type { ReactNode } from 'react';
function TermItem({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <div className="group">
      <div className="flex items-start gap-4">
        <div className="text-blue-400 font-semibold text-lg">{number}.</div>
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <p className="mt-2 text-white/70 leading-relaxed text-sm md:text-[15px]">
            {children}
          </p>
        </div>
      </div>
      <div className="mt-6 h-px bg-white/10" />
    </div>
  );
}

export default function TermsOfServiceScreen() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-white">
      <SiteNavbar />

      <main className="mx-auto max-w-4xl px-6">
        <section className="pt-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="mt-4 text-white/70 max-w-2xl mx-auto">
            Welcome to ResumeAI! By accessing or using our platform, you agree to be bound by these terms. Please read them carefully.
          </p>
        </section>

        <section className="mt-10 space-y-8">
          <TermItem number={1} title="Acceptance of Terms">
            By using ResumeAI, you agree to these Terms of Service. If you do not agree, please do not use our services. We may update these terms from time to time, and your continued use constitutes acceptance of those changes. For more information, please see our{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline">Privacy Policy</a>.
          </TermItem>

          <TermItem number={2} title="Account Usage">
            You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use or security breaches.
          </TermItem>

          <TermItem number={3} title="Payment & Credits">
            Our services may require payment. By purchasing credits or subscriptions, you agree to our{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline">Payment Terms</a> and to pay the applicable fees. Payments are non-refundable, and credits have an expiration date as specified at the time of purchase.
          </TermItem>

          <TermItem number={4} title="Limitation of Liability">
            ResumeAI is not liable for any direct, indirect, incidental, or consequential damages arising from your use of our services. We provide our services 'as is' and make no warranties, express or implied.
          </TermItem>

          <TermItem number={5} title="Governing Law">
            These Terms of Service are governed by the laws of the jurisdiction in which our company is registered. Any disputes will be resolved in the courts of that jurisdiction.
          </TermItem>
        </section>
      </main>
    </div>
  );
}