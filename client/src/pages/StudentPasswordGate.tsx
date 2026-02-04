import { useEffect, useMemo, useState } from "react";
import Seo from "@/components/Seo";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useChangeStudentPassword } from "@/hooks/use-student";
import { KeyRound, ShieldCheck } from "lucide-react";

export default function StudentPasswordGate({
  admissionNumber,
  fullName,
  onDone,
}: {
  admissionNumber: string;
  fullName: string;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const change = useChangeStudentPassword();

  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [touched, setTouched] = useState(false);

  const mismatch = useMemo(() => touched && pw1.trim() && pw2.trim() && pw1 !== pw2, [pw1, pw2, touched]);
  const tooShort = useMemo(() => touched && pw1.trim().length > 0 && pw1.trim().length < 8, [pw1, touched]);

  useEffect(() => {
    if (change.isSuccess) onDone();
  }, [change.isSuccess, onDone]);

  return (
    <AppShell
      role="student"
      title="Security Check"
      subtitle="First login requires a password change — this protects your account."
    >
      <Seo title="BeTTI LMS — Change Password" description="Student must change password on first login." />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 glass shadow-premium rounded-3xl p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/12 ring-1 ring-primary/20">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="font-display text-2xl">Set a new password</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a strong password (min 8 characters). You’ll use it whenever you log in with your admission number.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-secondary/70 ring-1 ring-border/60 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Student</div>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="font-semibold text-foreground" data-testid="student-gate-name">
                {fullName}
              </div>
              <div className="font-mono text-xs text-muted-foreground" data-testid="student-gate-admission">
                {admissionNumber}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4">
            <div>
              <Label>New password</Label>
              <Input
                type="password"
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
                onBlur={() => setTouched(true)}
                className="rounded-2xl mt-2"
                data-testid="student-new-password"
              />
              {tooShort ? (
                <div className="mt-2 text-xs text-destructive" data-testid="student-password-too-short">
                  Password must be at least 8 characters.
                </div>
              ) : null}
            </div>

            <div>
              <Label>Confirm password</Label>
              <Input
                type="password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                onBlur={() => setTouched(true)}
                className="rounded-2xl mt-2"
                data-testid="student-confirm-password"
              />
              {mismatch ? (
                <div className="mt-2 text-xs text-destructive" data-testid="student-password-mismatch">
                  Passwords do not match.
                </div>
              ) : null}
            </div>

            <Button
              onClick={async () => {
                setTouched(true);
                if (pw1.trim().length < 8) return;
                if (pw1 !== pw2) return;
                try {
                  await change.mutateAsync(pw1);
                  toast({ title: "Password updated", description: "You can now continue to your dashboard." });
                } catch (e: any) {
                  toast({ title: "Update failed", description: e?.message ?? "Unknown error", variant: "destructive" });
                }
              }}
              disabled={change.isPending || pw1.trim().length < 8 || pw1 !== pw2}
              className="rounded-2xl py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
              data-testid="student-password-submit"
            >
              {change.isPending ? "Updating…" : "Update password & continue"}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-5 glass shadow-premium rounded-3xl p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--success))]/12 ring-1 ring-[hsl(var(--success))]/20">
              <ShieldCheck className="h-6 w-6 text-[hsl(var(--success))]" />
            </div>
            <div>
              <div className="font-display text-2xl">Why this matters</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Temporary passwords are meant for onboarding only. A unique password ensures your learning materials, deadlines and notifications stay private.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-[hsl(var(--accent))]/10 ring-1 ring-[hsl(var(--accent))]/20 p-4">
            <div className="text-sm font-semibold text-foreground">Tip</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Use a long passphrase that you can remember. Avoid using your admission number.
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
