import Seo from "@/components/Seo";
import AppShell from "@/components/AppShell";
import StatCard from "@/components/StatCard";
import { useAdminCourses, useAdminDepartments, useAdminLecturers, useAdminStudents } from "@/hooks/use-admin";
import { BookOpen, GraduationCap, Shield, University, Users } from "lucide-react";

export default function AdminOverview() {
  const depts = useAdminDepartments();
  const courses = useAdminCourses();
  const lecturers = useAdminLecturers();
  const students = useAdminStudents();

  const loading = depts.isLoading || courses.isLoading || lecturers.isLoading || students.isLoading;
  const err = depts.error || courses.error || lecturers.error || students.error;

  return (
    <AppShell
      role="admin"
      title="Admin Command Center"
      subtitle="Manage departments, courses, lecturers, and institute structure with precision."
    >
      <Seo
        title="BeTTI LMS — Admin Dashboard"
        description="Admin dashboard for managing departments, courses, lecturers, and students."
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6" data-testid="admin-loading">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass shadow-premium rounded-3xl p-6 animate-pulse">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="mt-4 h-10 w-28 bg-muted rounded" />
              <div className="mt-3 h-4 w-40 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : err ? (
        <div className="glass shadow-premium rounded-3xl p-6 text-sm text-destructive" data-testid="admin-error">
          {(err as Error).message}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Departments"
            value={depts.data?.length ?? 0}
            description="Academic divisions"
            icon={University}
            tone="blue"
            href="/admin/departments"
            testid="stat-departments"
          />
          <StatCard
            title="Courses"
            value={courses.data?.length ?? 0}
            description="Programs & tracks"
            icon={BookOpen}
            tone="green"
            href="/admin/courses"
            testid="stat-courses"
          />
          <StatCard
            title="Lecturers"
            value={lecturers.data?.length ?? 0}
            description="Teaching staff"
            icon={Users}
            tone="gold"
            href="/admin/lecturers"
            testid="stat-lecturers"
          />
          <StatCard
            title="Students"
            value={students.data?.length ?? 0}
            description="Registered learners"
            icon={GraduationCap}
            tone="blue"
            href="/admin/students"
            testid="stat-students"
          />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 glass shadow-premium rounded-3xl p-6 sm:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Operating principles
          </div>
          <div className="mt-2 font-display text-2xl text-foreground">Consistency is a feature.</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Blue anchors system trust and navigation, Green confirms progress and active selections,
            and Gold is reserved for high-signal moments like deadlines and important alerts.
          </p>

          <div className="mt-6 rounded-3xl bg-secondary/70 ring-1 ring-border/60 p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/12 ring-1 ring-primary/20">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Role-based access</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Admin manages structure, Lecturer manages teaching flow, Student views assigned units only.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 glass shadow-premium rounded-3xl p-6 sm:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Quick routes
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            {[
              { href: "/admin/departments", label: "Manage departments" },
              { href: "/admin/courses", label: "Manage courses" },
              { href: "/admin/lecturers", label: "Create lecturers" },
              { href: "/admin/students", label: "View students" },
            ].map((l, i) => (
              <a
                key={i}
                href={l.href}
                className="rounded-3xl bg-white/55 hover:bg-white/70 ring-1 ring-border/60 px-4 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5"
                data-testid={`admin-quick-${i}`}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
