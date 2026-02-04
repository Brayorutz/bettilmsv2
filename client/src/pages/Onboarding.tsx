import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, GraduationCap, Shield, Users } from "lucide-react";
import Seo from "@/components/Seo";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/use-me";

export default function Onboarding() {
  const { data } = useMe();
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<"admin" | "lecturer" | "student" | null>(null);

  return (
    <AppShell
      role="unknown"
      title="Welcome to BeTTI LMS"
      subtitle="Your account is authenticated — now choose where to begin."
      right={
        <Button
          variant="secondary"
          onClick={() => setLocation("/")}
          className="rounded-2xl"
          data-testid="onboarding-back-home"
        >
          Back
        </Button>
      }
    >
      <Seo
        title="BeTTI LMS — Onboarding"
        description="Choose your workspace: Admin, Lecturer, or Student."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 glass shadow-premium rounded-3xl p-6 sm:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Account
          </div>
          <div className="mt-2 font-display text-3xl text-foreground" data-testid="onboarding-greeting">
            Hello{data?.user?.firstName ? `, ${data.user.firstName}` : ""}.
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn’t determine a role for this account yet. In production, an Admin assigns roles.
            For now, pick the workspace you want to preview.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { k: "admin", icon: Shield, title: "Admin", desc: "Structure the institute." },
              { k: "lecturer", icon: Users, title: "Lecturer", desc: "Teach, enroll, upload." },
              { k: "student", icon: GraduationCap, title: "Student", desc: "Learn, track, submit." },
            ].map((c) => {
              const active = selected === (c.k as any);
              return (
                <button
                  key={c.k}
                  type="button"
                  onClick={() => setSelected(c.k as any)}
                  data-testid={`onboarding-select-${c.k}`}
                  className={[
                    "text-left rounded-3xl p-4 ring-1 transition-all duration-300",
                    "bg-white/55 hover:bg-white/70 shadow-[0_14px_34px_rgba(0,0,0,0.06)]",
                    active
                      ? "ring-primary/40 bg-gradient-to-br from-primary/10 to-transparent"
                      : "ring-border/60",
                  ].join(" ")}
                >
                  <div className="h-10 w-10 rounded-2xl bg-secondary/70 ring-1 ring-border/60 grid place-items-center">
                    <c.icon className="h-5 w-5 text-foreground/75" />
                  </div>
                  <div className="mt-3 font-semibold">{c.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{c.desc}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              disabled={!selected}
              onClick={() => {
                if (!selected) return;
                setLocation(selected === "admin" ? "/admin" : selected === "lecturer" ? "/lecturer" : "/student");
              }}
              data-testid="onboarding-continue"
              className="rounded-2xl px-6 py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              variant="secondary"
              onClick={() => (window.location.href = "/")}
              data-testid="onboarding-skip"
              className="rounded-2xl px-6 py-6"
            >
              Skip for now
            </Button>
          </div>
        </div>

        <div className="lg:col-span-5 glass shadow-premium rounded-3xl p-6 sm:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Tip
          </div>
          <div className="mt-2 font-display text-2xl">Role-based clarity</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Each workspace shows only what matters:
            <span className="text-primary font-semibold"> Blue</span> guides navigation,
            <span className="text-[hsl(var(--success))] font-semibold"> Green</span> confirms progress,
            and <span className="text-[hsl(var(--accent))] font-semibold">Gold</span> flags deadlines & important alerts.
          </p>

          <div className="mt-5 rounded-3xl bg-secondary/70 ring-1 ring-border/60 p-4 text-sm text-muted-foreground">
            If your backend doesn’t yet implement role assignment, /api/me may return role=null.
            Once roles are wired, this screen will disappear automatically.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
