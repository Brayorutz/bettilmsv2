import { Link } from "wouter";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import bettiLogo from "@assets/logo1_1770205562697.jpg";

export default function Landing() {
  return (
    <div className="min-h-dvh mesh-bg">
      <Seo
        title="BeTTI LMS — Secure Learning Management System"
        description="A secure, role-based Learning Management System for Belgut Technical Training Institute (BeTTI)."
      />

      <header className="sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="glass shadow-premium rounded-3xl px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-11 w-11 rounded-2xl overflow-hidden ring-1 ring-border/60 shadow-[0_18px_40px_rgba(0,0,0,0.10)]">
                <img src={bettiLogo} alt="BeTTI Logo" className="h-full w-full object-cover" data-testid="landing-logo" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-lg leading-none">BeTTI LMS</div>
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  Belgut Technical Training Institute
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="hidden sm:inline-flex text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                data-testid="landing-nav-home"
              >
                Home
              </Link>
              <Button
                onClick={() => (window.location.href = "/api/login")}
                data-testid="landing-login"
                className="rounded-2xl px-5 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                Login with Replit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-6">
          <div className="lg:col-span-7 glass shadow-premium rounded-3xl p-7 sm:p-9 relative overflow-hidden">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-[hsl(var(--accent))]/18 blur-3xl" />

            <div className="relative">
              <div className="fade-up inline-flex items-center gap-2 rounded-full bg-secondary/70 px-3 py-1.5 ring-1 ring-border/60">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold tracking-wide text-foreground">
                  Clean • Secure • Role-based
                </span>
              </div>

              <h1 className="fade-up stagger-1 mt-5 font-display text-4xl sm:text-5xl leading-[1.05] text-foreground">
                A world-class LMS, built for <span className="text-primary">academic clarity</span> — and
                <span className="text-[hsl(var(--success))]"> progress</span>.
              </h1>

              <p className="fade-up stagger-2 mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl">
                BeTTI LMS helps Admins, Lecturers and Students work in sync — units, enrollments,
                materials, deadlines and real-time notifications — all in one polished workspace.
              </p>

              <div className="fade-up stagger-3 mt-7 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => (window.location.href = "/api/login")}
                  data-testid="landing-cta-primary"
                  className="rounded-2xl px-6 py-6 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Enter BeTTI LMS
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => {
                    const el = document.getElementById("features");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  data-testid="landing-cta-secondary"
                  className="rounded-2xl px-6 py-6 text-base border border-border/60 hover:bg-secondary/80 transition-all duration-300"
                >
                  Explore features
                </Button>
              </div>

              <div className="fade-up stagger-4 mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: ShieldCheck, title: "Secure access", desc: "Session-based auth, role driven." },
                  { icon: CheckCircle2, title: "Progress cues", desc: "Green success states & actions." },
                  { icon: GraduationCap, title: "Academic polish", desc: "Structured, responsive UI." },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="rounded-3xl bg-white/55 ring-1 ring-border/60 p-4 shadow-[0_12px_28px_rgba(0,0,0,0.06)]"
                    data-testid={`landing-feature-${i}`}
                  >
                    <div className="h-10 w-10 rounded-2xl bg-secondary/70 ring-1 ring-border/60 grid place-items-center">
                      <f.icon className="h-5 w-5 text-foreground/75" />
                    </div>
                    <div className="mt-3 font-semibold">{f.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div id="features" className="lg:col-span-5 grid grid-cols-1 gap-6">
            <div className="glass shadow-premium rounded-3xl p-6 sm:p-7">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                The BeTTI color system
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3" data-testid="palette-blue">
                  <span className="h-10 w-10 rounded-2xl bg-primary/15 ring-1 ring-primary/20 grid place-items-center">
                    <span className="h-4 w-4 rounded-full bg-primary" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold">Blue</div>
                    <div className="text-sm text-muted-foreground">
                      Navigation, headers, links — trust & clarity.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3" data-testid="palette-green">
                  <span className="h-10 w-10 rounded-2xl bg-[hsl(var(--success))]/15 ring-1 ring-[hsl(var(--success))]/25 grid place-items-center">
                    <span className="h-4 w-4 rounded-full bg-[hsl(var(--success))]" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold">Green</div>
                    <div className="text-sm text-muted-foreground">
                      Success states, confirmations, active selections.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3" data-testid="palette-gold">
                  <span className="h-10 w-10 rounded-2xl bg-[hsl(var(--accent))]/16 ring-1 ring-[hsl(var(--accent))]/30 grid place-items-center">
                    <span className="h-4 w-4 rounded-full bg-[hsl(var(--accent))]" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold">Gold</div>
                    <div className="text-sm text-muted-foreground">
                      Highlights, badges, deadlines, important alerts.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass shadow-premium rounded-3xl p-6 sm:p-7">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                What you can do
              </div>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  "Admins manage departments, courses and lecturers.",
                  "Lecturers create units, enroll students, upload materials & deadlines.",
                  "Students view assigned units, receive notifications, and access materials with clear lock states.",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2" data-testid={`landing-bullet-${i}`}>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-[hsl(var(--success))]" />
                    <span className="text-muted-foreground">{t}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-3xl bg-secondary/70 ring-1 ring-border/60 p-4">
                <div className="text-sm font-semibold text-foreground">No credit card. No friction.</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Authenticate securely with Replit. Your session stays protected via httpOnly cookies.
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Belgut Technical Training Institute (BeTTI) — Learning Management System.
        </footer>
      </main>
    </div>
  );
}
