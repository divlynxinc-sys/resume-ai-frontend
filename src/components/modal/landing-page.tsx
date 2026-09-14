// The landing page.
//
// ─── WHAT CHANGED, AND WHY ───────────────────────────────────────────────────
// This page used to be twenty-two rounded boxes. Three separate 3×2 grids of
// icon-in-a-tinted-square cards ("Features", "What industry demands", "Our
// approach"), two illustrated header panels, two proof cards — every one of them
// the same rectangle at the same size with the same three lines inside. The
// abstractions repeated across grids ("ATS Score & Compatibility" / "ATS
// Optimizer" / "Real-Time Score & Fixes" are one feature written three times),
// and uniform boxes carrying interchangeable copy is exactly the texture that
// makes a page read as machine-assembled.
//
// The rebuild keeps the parts that were doing real work — the before/after
// bullet, the ten named checks, the honesty about not having testimonials — and
// re-stages them as an edited page: an animated hero that states the premise, a
// scroll-driven walkthrough, a ruled index of what actually ships, and one
// inverted band to end on. Section composition lives here; every moving part
// lives in `components/landing/`.
//
// ─── THE FOLD ────────────────────────────────────────────────────────────────
// The ATS upload panel used to occupy the hero. It asked the visitor to find a
// file and drag it in before they had been given any reason to care, and it
// spent the most valuable space on the page explaining a free side tool rather
// than the product. It now has its own section (`AtsStandard`) plus a secondary
// CTA up here, which is where a free tool belongs: reachable, not first.
//
// ─── SEO ─────────────────────────────────────────────────────────────────────
// `useSeo` here and `MARKETING["/"]` in scripts/prerender.mjs must emit the same
// title, description and JSON-LD graph — Google renders JS and sees this one,
// GPTBot/ClaudeBot never execute JS and only ever see the prerendered one. If
// you change either, change both.

import { useEffect, useState } from "react";
import { ChevronUp, ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";

import SiteNavbar from "../layout/site-navbar";
import LaunchOfferBanner from "../layout/launch-offer-banner";
import SiteFooter from "../layout/site-footer";
import { PricingSection } from "./pricing";
import { TemplatesShowingSection } from "./templates-showing";
import { BlogSection } from "./blog";

import ApplicationJourney from "../landing/application-journey";
import ChecksTicker from "../landing/checks-ticker";
import HowItWorks from "../landing/how-it-works";
import FeatureIndex from "../landing/feature-index";
import AtsStandard from "../landing/ats-standard";
import LandingFaq from "../landing/landing-faq";
import ClosingCta from "../landing/closing-cta";
import { EASE } from "../landing/easing";
import { SplitHeadline } from "../landing/motion-primitives";

import { useSeo } from "@/lib/seo";
import { HOME_FAQ } from "@/content/site-faq";
import {
  faqPageSchema,
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
} from "@/content/blog/schema";

const TITLE = "Jobsynk AI — AI Resume Builder, ATS-Friendly Templates & Cover Letters";
const DESCRIPTION =
  "Build an ATS-friendly resume free, tailor it to any job description, and generate cover letters, interview answers and recruiter emails with AI.";

function Hero() {
  const reduce = useReducedMotion();

  return (
    <section id="landing-hero" className="relative overflow-hidden px-6 pb-16 pt-8 sm:pb-20 sm:pt-12">
      {/* Page texture. The grid is masked to an ellipse and the washes sit under
          it, so the fold has depth without a hero image to download. */}
      <div aria-hidden className="landing-grid" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-28 size-[30rem] rounded-full bg-[var(--pastel-lavender)] opacity-60 blur-[110px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-40 size-[26rem] rounded-full bg-[var(--pastel-peach)] opacity-50 blur-[110px]"
      />

      {/* `min-w-0` on both grid children is load-bearing, not tidiness. Below
          `lg` this collapses to a single implicit column whose `auto` minimum is
          the items' min-content — and the journey panel's rows use `truncate`
          (white-space: nowrap), so their min-content is the untruncated string.
          That blew the track out to 380px inside a 342px container, and the
          section's `overflow-hidden` swallowed the scrollbar, so the only symptom
          was hero copy silently sliced off at the right edge on a phone. */}
      <div className="relative mx-auto grid max-w-[1160px] items-center gap-14 py-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:py-14">
        <div className="min-w-0">
          <motion.div
            className="flex items-center gap-2.5"
            initial={reduce ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span aria-hidden className="h-px w-8 bg-[var(--app-border-strong)]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--app-fg-soft)]">
              AI resume builder
            </span>
          </motion.div>

          <h1 className="mt-6 font-display text-[2.6rem] font-light leading-[1.03] tracking-tight text-[var(--app-fg)] sm:text-6xl xl:text-[4.25rem]">
            <SplitHeadline
              segments={[
                { text: "For the jobs that" },
                { text: " keep saying no.", className: "italic text-[var(--app-fg-muted)]" },
              ]}
              stagger={0.05}
            />
          </h1>

          <motion.p
            className="mt-7 max-w-xl text-[16px] leading-relaxed text-[var(--app-fg-muted)] sm:text-[17px]"
            initial={reduce ? undefined : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
          >
            Paste the job description. Jobsynk names every line a parser would trip on and every
            word the posting asks for that your resume never says — then drafts the cover letter,
            the interview answers and the follow-up email to go with it.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-7"
            initial={reduce ? undefined : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.6 }}
          >
            <Link
              to="/signup"
              className="group inline-flex h-13 items-center gap-2.5 rounded-full bg-[var(--accent)] px-8 text-[15px] font-semibold text-white shadow-[0_10px_28px_color-mix(in_srgb,var(--accent)_22%,transparent)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
            >
              Build my resume
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/ats-checker"
              className="text-[15px] font-medium text-[var(--app-fg)] underline decoration-[var(--app-border-strong)] underline-offset-[6px] transition-colors hover:decoration-[var(--accent)]"
            >
              Check the resume you already have
            </Link>
          </motion.div>

          <motion.p
            className="mt-7 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--app-fg-soft)]"
            initial={reduce ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.75 }}
          >
            No credit card &nbsp;&#9670;&nbsp; Start in minutes &nbsp;&#9670;&nbsp; Nothing uploaded
          </motion.p>
        </div>

        <motion.div
          className="min-w-0"
          initial={reduce ? undefined : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
        >
          <ApplicationJourney />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * The one piece of the old page worth keeping intact: a real before/after. It is
 * the shortest possible demonstration of what "tailored" means, and unlike a
 * testimonial the visitor can judge it in five seconds without trusting us.
 *
 * (The testimonials that used to sit near here were three invented people with
 * invented quotes. Fabricated reviews are illegal in both target markets — the
 * UK's DMCC Act 2024 and the FTC's 16 CFR 465 — and this site takes live
 * payments. They are not coming back.)
 */
function RewriteProof() {
  const reduce = useReducedMotion();

  return (
    <section className="mx-auto max-w-[1160px] px-6">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--app-fg-soft)]">
            One bullet
          </span>
          <h2 className="mt-4 font-display text-[2rem] font-light leading-[1.08] tracking-tight text-[var(--app-fg)] sm:text-[2.75rem]">
            <SplitHeadline
              segments={[
                { text: "Same job." },
                { text: " Same person.", className: "italic text-[var(--app-fg-muted)]" },
              ]}
            />
          </h2>
          <motion.p
            className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-[var(--app-fg-muted)]"
            initial={reduce ? undefined : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
          >
            One of these gets a call. The difference is not writing talent — it is a number, a
            verb and a result.{" "}
            <Link
              to="/blog/resume-bullet-points-that-get-interviews"
              className="font-medium text-[var(--accent-text)] underline decoration-current/30 underline-offset-4 transition-opacity hover:opacity-70"
            >
              How to write them yourself
            </Link>
            .
          </motion.p>
        </div>

        <div className="space-y-4">
          <motion.figure
            className="border-l-2 border-[var(--app-border-strong)] pl-6"
            initial={reduce ? undefined : { opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <figcaption className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--app-fg-soft)]">
              Before
            </figcaption>
            <p className="mt-2.5 font-mono text-[13.5px] leading-7 text-[var(--app-fg-muted)]">
              Responsible for managing the company's social media accounts.
            </p>
          </motion.figure>

          <motion.figure
            className="border-l-2 border-[var(--accent)] pl-6"
            initial={reduce ? undefined : { opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
          >
            <figcaption className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent-text)]">
              After
            </figcaption>
            <p className="mt-2.5 font-mono text-[13.5px] leading-7 text-[var(--app-fg)]">
              Grew Instagram from{" "}
              <span className="rounded px-1" style={{ backgroundColor: "var(--pastel-mint)" }}>
                4k to 27k followers in 11 months
              </span>{" "}
              by replacing daily product posts with a weekly customer-story series — now{" "}
              <span className="rounded px-1" style={{ backgroundColor: "var(--pastel-mint)" }}>
                ~18% of site traffic
              </span>
              .
            </p>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}

export default function LandingPageScreen() {
  const [showTop, setShowTop] = useState(false);
  const location = useLocation();

  useSeo({
    title: TITLE,
    description: DESCRIPTION,
    path: "/",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@graph": [
          organizationSchema(),
          websiteSchema(),
          softwareApplicationSchema(),
          faqPageSchema(HOME_FAQ),
        ],
      },
    ],
  });

  useEffect(() => {
    const hero = document.getElementById("landing-hero");
    if (!hero) return;
    const io = new IntersectionObserver(([entry]) => setShowTop(!entry.isIntersecting), {
      threshold: 0.05,
    });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const id = window.decodeURIComponent(location.hash.slice(1));
    const target = document.getElementById(id);
    if (!target) return;
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.hash]);

  // Still here for the sections this page composes but does not own — pricing,
  // templates and blog cards all carry `data-landing-reveal`. Everything written
  // for this rebuild animates through Framer Motion instead.
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".landing-page [data-landing-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((card) => card.classList.add("landing-reveal-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("landing-reveal-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]">
      <LaunchOfferBanner />
      <SiteNavbar marketingMode />

      <main>
        <Hero />
        <ChecksTicker />

        <div className="mt-24 sm:mt-32">
          <HowItWorks />
        </div>

        <div className="mt-28 sm:mt-36">
          <RewriteProof />
        </div>

        <div className="mt-28 sm:mt-36">
          <FeatureIndex />
        </div>

        <div className="mt-28 sm:mt-36">
          <AtsStandard />
        </div>

        <div className="mt-28 sm:mt-36">
          <TemplatesShowingSection />
        </div>

        <div className="mt-28 sm:mt-36">
          <PricingSection />
        </div>

        <div className="mt-8">
          <LandingFaq />
        </div>

        {/* Blog sits after pricing on purpose — it catches the visitor who isn't
            ready to buy, rather than competing with the conversion moment. */}
        <div className="mt-28 sm:mt-36">
          <BlogSection />
        </div>

        <div className="mt-28 sm:mt-36">
          <ClosingCta />
        </div>
      </main>

      <SiteFooter publicOnly />

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`fixed bottom-20 right-6 z-50 grid h-11 w-11 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--app-border-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 ${
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
        style={{ color: "var(--app-fg-muted)", boxShadow: "var(--shadow-soft)" }}
      >
        <ChevronUp className="size-4" />
      </button>
    </div>
  );
}
