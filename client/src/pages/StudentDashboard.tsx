import { useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import Seo from "@/components/Seo";
import AppShell from "@/components/AppShell";
import EmptyState from "@/components/EmptyState";
import StatCard from "@/components/StatCard";
import StudentPasswordGate from "@/pages/StudentPasswordGate";
import { useStudentDashboard } from "@/hooks/use-student";
import { Bell, BookOpen, GraduationCap, ArrowRight } from "lucide-react";

export default function StudentDashboard() {
  const [, setLocation] = useLocation();
  const dash = useStudentDashboard();

  const mustChange = dash.data?.student?.mustChangePassword;

  // If backend sets mustChangePassword, gate the dashboard
  if (dash.isLoading) {
    return (
      <AppShell role="student" title="Student Dashboard" subtitle="Loading your workspace…">
        <Seo title="BeTTI LMS — Student Dashboard" description="Student dashboard for units and notifications." />
        <div className="glass shadow-premium rounded-3xl p-8 animate-pulse" data-testid="student-loading">
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="mt-6 h-10 w-full bg-muted rounded-2xl" />
          <div className="mt-4 h-48 w-full bg-muted rounded-3xl" />
        </div>
      </AppShell>
    );
  }

  if (dash.error) {
    return (
      <AppShell role="student" title="Student Dashboard" subtitle="We couldn’t load your data.">
        <Seo title="BeTTI LMS — Student Dashboard Error" description="Student dashboard failed to load." />
        <div className="glass shadow-premium rounded-3xl p-6 text-sm text-destructive" data-testid="student-error">
          {(dash.error as Error).message}
        </div>
      </AppShell>
    );
  }

  if (mustChange) {
    return (
      <StudentPasswordGate
        admissionNumber={dash.data?.student?.admissionNumber ?? ""}
        fullName={dash.data?.student?.fullName ?? "Student"}
        onDone={() => {
          // refresh via refetch
          dash.refetch();
        }}
      />
    );
  }

  const unitItems = dash.data?.units ?? [];
  const unread = dash.data?.unreadNotifications ?? 0;

  const tone = unread > 0 ? "gold" : "green";

  return (
    <AppShell
      role="student"
      title="My Dashboard"
      subtitle="Your units, materials and notifications — tailored to your learning."
      unreadCount={unread}
      right={
        <Link
          href="/student/notifications"
          className="inline-flex items-center gap-2 rounded-2xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
          data-testid="student-open-notifications"
        >
          <Bell className="h-4 w-4" />
          Notifications
          <ArrowRight className="h-4 w-4 opacity-90" />
        </Link>
      }
    >
      <Seo title="BeTTI LMS — Student Dashboard" description="Student dashboard for units and notifications." />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard
          title="Units"
          value={unitItems.length}
          description="Assigned to you"
          icon={BookOpen}
          tone="blue"
          href="/student"
          testid="student-stat-units"
        />
        <StatCard
          title="Unread notifications"
          value={unread}
          description={unread > 0 ? "New items waiting" : "All caught up"}
          icon={Bell}
          tone={tone as any}
          href="/student/notifications"
          testid="student-stat-unread"
        />
        <StatCard
          title="Learner status"
          value="Active"
          description="BeTTI learning profile"
          icon={GraduationCap}
          tone="green"
          testid="student-stat-status"
        />
      </div>

      <div className="mt-6">
        {unitItems.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No units assigned yet"
            description="When your lecturer enrolls you into units, they will appear here automatically."
            testid="student-units-empty"
          />
        ) : (
          <div className="glass shadow-premium rounded-3xl p-6 sm:p-8" data-testid="student-units-grid">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              My units
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {unitItems.map((u) => (
                <Link
                  key={u.unit.id}
                  href={`/student/units/${u.unit.id}`}
                  className="group block rounded-3xl bg-white/55 hover:bg-white/70 ring-1 ring-border/60 p-5 shadow-[0_14px_34px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1"
                  data-testid={`student-unit-card-${u.unit.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">{u.unit.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-2">
                        <span className="font-mono rounded-xl bg-secondary/70 ring-1 ring-border/60 px-2 py-1 inline-flex">
                          {u.unit.code}
                        </span>
                        <span className="truncate">
                          {u.course.code} • {u.department.code}
                        </span>
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-2xl bg-primary/12 ring-1 ring-primary/20 grid place-items-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-muted-foreground">
                    Lecturer: <span className="font-semibold text-foreground/85">{u.lecturer.fullName}</span>
                  </div>

                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    View materials
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
