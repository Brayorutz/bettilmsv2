import { useMemo, useState } from "react";
import Seo from "@/components/Seo";
import AppShell from "@/components/AppShell";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { useLecturerMyCourses, useLecturerUnits } from "@/hooks/use-lecturer";
import { BookOpen, Layers3, Users2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LecturerDashboard() {
  const courses = useLecturerMyCourses();
  const [courseId, setCourseId] = useState<string>("all");
  const units = useLecturerUnits(courseId === "all" ? undefined : Number(courseId));

  const loading = courses.isLoading || units.isLoading;
  const error = courses.error || units.error;

  const counts = useMemo(() => {
    const unitItems = units.data ?? [];
    const enrolledTotal = unitItems.reduce((a, u) => a + (u.enrolledCount || 0), 0);
    return { units: unitItems.length, enrolledTotal };
  }, [units.data]);

  return (
    <AppShell
      role="lecturer"
      title="Lecturer Dashboard"
      subtitle="Your teaching space — units, enrollments and materials in one flow."
      right={
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Course Filter
          </div>
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger className="rounded-2xl w-[220px]" data-testid="lecturer-course-filter">
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All courses</SelectItem>
              {(courses.data ?? []).map((c) => (
                <SelectItem key={c.course.id} value={String(c.course.id)}>
                  {c.course.code} — {c.course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      <Seo title="BeTTI LMS — Lecturer Dashboard" description="Lecturer dashboard for units, enrollments and materials." />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="lecturer-loading">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass shadow-premium rounded-3xl p-6 animate-pulse">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="mt-4 h-10 w-28 bg-muted rounded" />
              <div className="mt-3 h-4 w-40 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass shadow-premium rounded-3xl p-6 text-sm text-destructive" data-testid="lecturer-error">
          {(error as Error).message}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <StatCard
              title="Assigned courses"
              value={courses.data?.length ?? 0}
              description="You can create units under these"
              icon={BookOpen}
              tone="blue"
              href="/lecturer/units"
              testid="lecturer-stat-courses"
            />
            <StatCard
              title="Units"
              value={counts.units}
              description="Active teaching units"
              icon={Layers3}
              tone="green"
              href="/lecturer/units"
              testid="lecturer-stat-units"
            />
            <StatCard
              title="Enrolled students"
              value={counts.enrolledTotal}
              description="Across visible units"
              icon={Users2}
              tone="gold"
              href="/lecturer/units"
              testid="lecturer-stat-enrolled"
            />
          </div>

          <div className="mt-6">
            {(units.data?.length ?? 0) === 0 ? (
              <EmptyState
                icon={Layers3}
                title="No units yet"
                description="Create a unit under one of your assigned courses to begin enrolling students and uploading materials."
                actionLabel="Go to Units"
                onAction={() => (window.location.href = "/lecturer/units")}
                testid="lecturer-units-empty"
              />
            ) : (
              <div className="glass shadow-premium rounded-3xl p-6 sm:p-8">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Next steps
                </div>
                <div className="mt-2 font-display text-2xl">Keep your units moving.</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Use <span className="font-semibold text-primary">Units</span> to enroll students, upload PDFs/videos/assignments,
                  and set deadlines with gold-highlighted lock states.
                </p>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { t: "Enroll students", d: "Admission format: SCM/6155/25S" },
                    { t: "Upload materials", d: "Add instructions and links" },
                    { t: "Set deadlines", d: "Gold warnings & reminders" },
                  ].map((x, i) => (
                    <div
                      key={i}
                      className="rounded-3xl bg-white/55 ring-1 ring-border/60 p-4 shadow-[0_12px_28px_rgba(0,0,0,0.06)]"
                      data-testid={`lecturer-next-${i}`}
                    >
                      <div className="font-semibold">{x.t}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{x.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
