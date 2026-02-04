import { useMemo } from "react";
import Seo from "@/components/Seo";
import AppShell from "@/components/AppShell";
import DataTable, { type Column } from "@/components/DataTable";
import EmptyState from "@/components/EmptyState";
import { useAdminStudents } from "@/hooks/use-admin";
import type { Student } from "@shared/schema";
import { GraduationCap } from "lucide-react";

export default function AdminStudents() {
  const list = useAdminStudents();

  const columns: Column<Student>[] = useMemo(
    () => [
      {
        key: "admission",
        header: "Admission #",
        sortValue: (s) => s.admissionNumber,
        cell: (s) => (
          <div className="font-mono text-xs rounded-xl bg-secondary/60 ring-1 ring-border/60 px-2 py-1 inline-flex">
            {s.admissionNumber}
          </div>
        ),
      },
      {
        key: "name",
        header: "Student",
        sortValue: (s) => s.fullName,
        cell: (s) => <div className="font-semibold text-foreground">{s.fullName}</div>,
      },
      {
        key: "status",
        header: "Status",
        sortValue: (s) => (s.isActive ? 1 : 0),
        cell: (s) => (
          <div
            className={[
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1",
              s.isActive
                ? "bg-[hsl(var(--success))]/12 text-[hsl(var(--success))] ring-[hsl(var(--success))]/20"
                : "bg-destructive/10 text-destructive ring-destructive/20",
            ].join(" ")}
            data-testid={`student-status-${s.id}`}
          >
            <span className={s.isActive ? "h-2 w-2 rounded-full bg-[hsl(var(--success))]" : "h-2 w-2 rounded-full bg-destructive"} />
            {s.isActive ? "Active" : "Inactive"}
          </div>
        ),
      },
      {
        key: "mustChange",
        header: "Password",
        sortValue: (s) => (s.mustChangePassword ? 0 : 1),
        cell: (s) => (
          <div
            className={[
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1",
              s.mustChangePassword
                ? "bg-[hsl(var(--accent))]/14 text-[hsl(var(--accent-foreground))] ring-[hsl(var(--accent))]/25"
                : "bg-secondary/70 text-secondary-foreground ring-border/60",
            ].join(" ")}
            data-testid={`student-password-state-${s.id}`}
          >
            {s.mustChangePassword ? "Must change on login" : "OK"}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <AppShell
      role="admin"
      title="Students"
      subtitle="Read-only view for now — enrollment is managed inside Units by Lecturers."
    >
      <Seo title="BeTTI LMS — Students" description="View registered students." />

      {list.isLoading ? (
        <div className="glass shadow-premium rounded-3xl p-8 animate-pulse" data-testid="students-loading">
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="mt-6 h-10 w-full bg-muted rounded-2xl" />
          <div className="mt-4 h-48 w-full bg-muted rounded-3xl" />
        </div>
      ) : list.error ? (
        <div className="glass shadow-premium rounded-3xl p-6 text-sm text-destructive" data-testid="students-error">
          {(list.error as Error).message}
        </div>
      ) : (list.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No students yet"
          description="Students are created when lecturers enroll them into units using a strict admission number format."
          testid="students-empty"
        />
      ) : (
        <DataTable
          rows={list.data ?? []}
          columns={columns}
          searchPlaceholder="Search by admission number or name…"
          searchKeys={[(s) => s.admissionNumber, (s) => s.fullName]}
          testid="students-table"
        />
      )}
    </AppShell>
  );
}
