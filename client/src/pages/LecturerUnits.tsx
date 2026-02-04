import { useMemo, useState } from "react";
import { Link } from "wouter";
import Seo from "@/components/Seo";
import AppShell from "@/components/AppShell";
import DataTable, { type Column } from "@/components/DataTable";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLecturerMyCourses, useLecturerUnits, useCreateUnit, useDeleteUnit, useUpdateUnit } from "@/hooks/use-lecturer";
import type { UnitResponse } from "@shared/routes";
import { BookOpen, Layers3, Plus, Trash2, Pencil, ArrowRight } from "lucide-react";

type UnitRow = {
  unit: UnitResponse;
  course: { id: number; name: string; code: string; departmentId: number };
  department: { id: number; name: string; code: string };
  enrolledCount: number;
};

export default function LecturerUnits() {
  const { toast } = useToast();
  const courses = useLecturerMyCourses();
  const [filterCourseId, setFilterCourseId] = useState<string>("all");
  const list = useLecturerUnits(filterCourseId === "all" ? undefined : Number(filterCourseId));

  const create = useCreateUnit();
  const update = useUpdateUnit();
  const del = useDeleteUnit();

  const [createOpen, setCreateOpen] = useState(false);
  const [edit, setEdit] = useState<UnitRow | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Create form
  const [courseId, setCourseId] = useState<string>("");
  const [lecturerId, setLecturerId] = useState<string>(""); // required by schema; backend should validate
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  // Edit form
  const [eCourseId, setECourseId] = useState<string>("");
  const [eTitle, setETitle] = useState("");
  const [eCode, setECode] = useState("");
  const [eDescription, setEDescription] = useState("");

  const columns: Column<UnitRow>[] = useMemo(
    () => [
      {
        key: "unit",
        header: "Unit",
        sortValue: (r) => r.unit.title,
        cell: (r) => (
          <div className="min-w-0">
            <div className="font-semibold text-foreground truncate">{r.unit.title}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono rounded-xl bg-secondary/60 ring-1 ring-border/60 px-2 py-1 inline-flex">
                {r.unit.code}
              </span>
              <span className="truncate">
                {r.course.code} • {r.department.code}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "enrolled",
        header: "Enrolled",
        sortValue: (r) => r.enrolledCount,
        cell: (r) => (
          <div className="inline-flex items-center rounded-full bg-[hsl(var(--success))]/10 ring-1 ring-[hsl(var(--success))]/20 px-3 py-1 text-xs font-semibold text-[hsl(var(--success))]">
            {r.enrolledCount} students
          </div>
        ),
      },
      {
        key: "open",
        header: "Open",
        cell: (r) => (
          <Link
            href={`/lecturer/units/${r.unit.id}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
            data-testid={`unit-open-${r.unit.id}`}
          >
            Manage <ArrowRight className="h-4 w-4" />
          </Link>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        cell: (r) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl"
              onClick={() => {
                setEdit(r);
                setECourseId(String(r.unit.courseId));
                setETitle(r.unit.title);
                setECode(r.unit.code);
                setEDescription(r.unit.description ?? "");
              }}
              data-testid={`unit-edit-${r.unit.id}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-xl"
              onClick={() => setDeleteId(r.unit.id)}
              data-testid={`unit-delete-${r.unit.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const rows = (list.data ?? []) as UnitRow[];
  const loading = courses.isLoading || list.isLoading;
  const error = courses.error || list.error;

  return (
    <AppShell
      role="lecturer"
      title="Units"
      subtitle="Create units, then enroll students and upload materials with deadlines."
      right={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Select value={filterCourseId} onValueChange={setFilterCourseId}>
            <SelectTrigger className="rounded-2xl w-[260px]" data-testid="units-filter-course">
              <SelectValue placeholder="Filter by course" />
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

          <Button
            onClick={() => {
              setCourseId("");
              setLecturerId("");
              setTitle("");
              setCode("");
              setDescription("");
              setCreateOpen(true);
            }}
            data-testid="unit-open-create"
            className="rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Unit
          </Button>
        </div>
      }
    >
      <Seo title="BeTTI LMS — Lecturer Units" description="Manage units, enrollments, and materials." />

      {loading ? (
        <div className="glass shadow-premium rounded-3xl p-8 animate-pulse" data-testid="units-loading">
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="mt-6 h-10 w-full bg-muted rounded-2xl" />
          <div className="mt-4 h-48 w-full bg-muted rounded-3xl" />
        </div>
      ) : error ? (
        <div className="glass shadow-premium rounded-3xl p-6 text-sm text-destructive" data-testid="units-error">
          {(error as Error).message}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Layers3}
          title="No units found"
          description="Create a unit under your assigned course(s). You’ll then enroll students and add materials."
          actionLabel="Create Unit"
          onAction={() => setCreateOpen(true)}
          testid="units-empty"
        />
      ) : (
        <DataTable
          rows={rows}
          columns={columns}
          searchPlaceholder="Search by unit title or code…"
          searchKeys={[(r) => r.unit.title, (r) => r.unit.code, (r) => r.course.name, (r) => r.course.code]}
          testid="units-table"
        />
      )}

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-3xl" data-testid="unit-create-dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">New Unit</DialogTitle>
          </DialogHeader>

          <div className="mt-2 grid grid-cols-1 gap-4">
            <div className="rounded-3xl bg-secondary/70 ring-1 ring-border/60 p-4">
              <div className="text-sm font-semibold">Tip</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Choose a course you’re assigned to. Unit codes should be short and consistent (e.g. <span className="font-mono">SCM-201</span>).
              </div>
            </div>

            <div>
              <Label>Course</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger className="mt-2 rounded-2xl" data-testid="unit-create-course">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {(courses.data ?? []).map((c) => (
                    <SelectItem key={c.course.id} value={String(c.course.id)}>
                      {c.course.code} — {c.course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="unit-lecturerId">Lecturer ID</Label>
              <Input
                id="unit-lecturerId"
                value={lecturerId}
                onChange={(e) => setLecturerId(e.target.value)}
                placeholder="Backend expects lecturerId (number). If not auto-derived, enter here."
                className="rounded-2xl mt-2"
                data-testid="unit-create-lecturerId"
              />
              <div className="mt-2 text-xs text-muted-foreground">
                If your backend derives lecturerId from session, you can ignore this field. Otherwise it must be a number.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="unit-code">Unit Code</Label>
                <Input
                  id="unit-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SCM-201"
                  className="rounded-2xl mt-2"
                  data-testid="unit-create-code"
                />
              </div>
              <div>
                <Label htmlFor="unit-title">Title</Label>
                <Input
                  id="unit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Procurement Fundamentals"
                  className="rounded-2xl mt-2"
                  data-testid="unit-create-title"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="unit-desc">Description (optional)</Label>
              <Textarea
                id="unit-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief outline, expectations, assessment style…"
                className="rounded-2xl mt-2 min-h-[110px]"
                data-testid="unit-create-description"
              />
            </div>

            <Button
              onClick={async () => {
                try {
                  await create.mutateAsync({
                    courseId: Number(courseId),
                    lecturerId: Number(lecturerId),
                    code: code.trim(),
                    title: title.trim(),
                    description: description.trim() ? description.trim() : null,
                    isActive: true,
                  });
                  setCreateOpen(false);
                  toast({ title: "Unit created", description: "Now enroll students and add materials." });
                } catch (e: any) {
                  toast({ title: "Create failed", description: e?.message ?? "Unknown error", variant: "destructive" });
                }
              }}
              disabled={
                create.isPending ||
                !courseId ||
                !String(lecturerId).trim() ||
                !code.trim() ||
                !title.trim()
              }
              data-testid="unit-create-submit"
              className="rounded-2xl py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              {create.isPending ? "Creating…" : "Create Unit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!edit} onOpenChange={(v) => !v && setEdit(null)}>
        <DialogContent className="rounded-3xl" data-testid="unit-edit-dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Edit Unit</DialogTitle>
          </DialogHeader>

          <div className="mt-2 grid grid-cols-1 gap-4">
            <div>
              <Label>Course</Label>
              <Select value={eCourseId} onValueChange={setECourseId}>
                <SelectTrigger className="mt-2 rounded-2xl" data-testid="unit-edit-course">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {(courses.data ?? []).map((c) => (
                    <SelectItem key={c.course.id} value={String(c.course.id)}>
                      {c.course.code} — {c.course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Unit Code</Label>
                <Input
                  value={eCode}
                  onChange={(e) => setECode(e.target.value.toUpperCase())}
                  className="rounded-2xl mt-2"
                  data-testid="unit-edit-code"
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={eTitle}
                  onChange={(e) => setETitle(e.target.value)}
                  className="rounded-2xl mt-2"
                  data-testid="unit-edit-title"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={eDescription}
                onChange={(e) => setEDescription(e.target.value)}
                className="rounded-2xl mt-2 min-h-[110px]"
                data-testid="unit-edit-description"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="secondary" onClick={() => setEdit(null)} className="rounded-2xl py-6" data-testid="unit-edit-cancel">
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!edit) return;
                  try {
                    await update.mutateAsync({
                      id: edit.unit.id,
                      updates: {
                        courseId: Number(eCourseId),
                        code: eCode.trim(),
                        title: eTitle.trim(),
                        description: eDescription.trim() ? eDescription.trim() : null,
                      },
                    });
                    setEdit(null);
                    toast({ title: "Updated", description: "Unit updated successfully." });
                  } catch (e: any) {
                    toast({ title: "Update failed", description: e?.message ?? "Unknown error", variant: "destructive" });
                  }
                }}
                disabled={update.isPending || !eCourseId || !eCode.trim() || !eTitle.trim()}
                className="rounded-2xl py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
                data-testid="unit-edit-submit"
              >
                {update.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Delete unit?"
        description="This will remove the unit and cascade-delete enrollments/materials. This cannot be undone."
        confirmLabel={del.isPending ? "Deleting…" : "Delete"}
        destructive
        testid="unit-delete-confirm"
        onConfirm={async () => {
          if (deleteId === null) return;
          try {
            await del.mutateAsync(deleteId);
            toast({ title: "Deleted", description: "Unit removed." });
          } catch (e: any) {
            toast({ title: "Delete failed", description: e?.message ?? "Unknown error", variant: "destructive" });
          } finally {
            setDeleteId(null);
          }
        }}
      />

      {/* Footer guidance */}
      <div className="mt-6 glass shadow-premium rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/12 ring-1 ring-primary/20">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="font-display text-2xl">Enrollment workflow</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Open a unit to enroll students (admission format like <span className="font-mono">SCM/6155/25S</span>).
              If the student exists in another unit, the system returns a confirmation prompt before adding them here.
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
