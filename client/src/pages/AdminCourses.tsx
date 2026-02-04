import { useMemo, useState } from "react";
import Seo from "@/components/Seo";
import AppShell from "@/components/AppShell";
import DataTable, { type Column } from "@/components/DataTable";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminCourses,
  useAdminDepartments,
  useCreateCourse,
  useDeleteCourse,
  useUpdateCourse,
} from "@/hooks/use-admin";
import type { CourseResponse, DepartmentResponse } from "@shared/routes";
import { BookOpen, Plus, Trash2, Pencil } from "lucide-react";

export default function AdminCourses() {
  const { toast } = useToast();
  const depts = useAdminDepartments();
  const list = useAdminCourses();
  const create = useCreateCourse();
  const update = useUpdateCourse();
  const del = useDeleteCourse();

  const [createOpen, setCreateOpen] = useState(false);
  const [edit, setEdit] = useState<CourseResponse | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [departmentId, setDepartmentId] = useState<string>("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const [editDepartmentId, setEditDepartmentId] = useState<string>("");
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");

  const deptMap = useMemo(() => {
    const m = new Map<number, DepartmentResponse>();
    (depts.data ?? []).forEach((d) => m.set(d.id, d));
    return m;
  }, [depts.data]);

  const columns: Column<CourseResponse>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Code",
        sortValue: (c) => c.code,
        cell: (c) => (
          <div className="font-mono text-xs rounded-xl bg-secondary/60 ring-1 ring-border/60 px-2 py-1 inline-flex">
            {c.code}
          </div>
        ),
      },
      {
        key: "name",
        header: "Course",
        sortValue: (c) => c.name,
        cell: (c) => <div className="font-semibold text-foreground">{c.name}</div>,
      },
      {
        key: "dept",
        header: "Department",
        sortValue: (c) => deptMap.get(c.departmentId)?.name ?? "",
        cell: (c) => (
          <div className="text-sm text-muted-foreground">
            {deptMap.get(c.departmentId)?.name ?? `Dept #${c.departmentId}`}
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        cell: (c) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl"
              onClick={() => {
                setEdit(c);
                setEditDepartmentId(String(c.departmentId));
                setEditName(c.name);
                setEditCode(c.code);
              }}
              data-testid={`course-edit-${c.id}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-xl"
              onClick={() => setDeleteId(c.id)}
              data-testid={`course-delete-${c.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [deptMap]
  );

  const isLoading = list.isLoading || depts.isLoading;
  const error = list.error || depts.error;

  return (
    <AppShell
      role="admin"
      title="Courses"
      subtitle="Map programs to departments, clean codes included."
      right={
        <Button
          onClick={() => {
            setDepartmentId("");
            setName("");
            setCode("");
            setCreateOpen(true);
          }}
          data-testid="course-open-create"
          className="rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Course
        </Button>
      }
    >
      <Seo title="BeTTI LMS — Courses" description="Manage courses for BeTTI." />

      {isLoading ? (
        <div className="glass shadow-premium rounded-3xl p-8 animate-pulse" data-testid="course-loading">
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="mt-6 h-10 w-full bg-muted rounded-2xl" />
          <div className="mt-4 h-48 w-full bg-muted rounded-3xl" />
        </div>
      ) : error ? (
        <div className="glass shadow-premium rounded-3xl p-6 text-sm text-destructive" data-testid="course-error">
          {(error as Error).message}
        </div>
      ) : (list.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create a course and attach it to a department to enable unit creation."
          actionLabel="Create Course"
          onAction={() => setCreateOpen(true)}
          testid="course-empty"
        />
      ) : (
        <DataTable
          rows={list.data ?? []}
          columns={columns}
          searchPlaceholder="Search courses by name or code…"
          searchKeys={[(c) => c.name, (c) => c.code]}
          testid="course-table"
        />
      )}

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-3xl" data-testid="course-create-dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">New Course</DialogTitle>
          </DialogHeader>

          <div className="mt-2 grid grid-cols-1 gap-4">
            <div>
              <Label>Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="mt-2 rounded-2xl" data-testid="course-create-dept">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {(depts.data ?? []).map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.code} — {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="course-code">Code</Label>
              <Input
                id="course-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SCM-DIP"
                className="rounded-2xl mt-2"
                data-testid="course-create-code"
              />
            </div>

            <div>
              <Label htmlFor="course-name">Name</Label>
              <Input
                id="course-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Diploma in Supply Chain Management"
                className="rounded-2xl mt-2"
                data-testid="course-create-name"
              />
            </div>

            <Button
              onClick={async () => {
                try {
                  await create.mutateAsync({
                    departmentId: Number(departmentId),
                    code: code.trim(),
                    name: name.trim(),
                  });
                  setCreateOpen(false);
                  toast({ title: "Course created", description: "Course has been added." });
                } catch (e: any) {
                  toast({ title: "Create failed", description: e?.message ?? "Unknown error", variant: "destructive" });
                }
              }}
              disabled={create.isPending || !departmentId || !code.trim() || !name.trim()}
              data-testid="course-create-submit"
              className="rounded-2xl py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              {create.isPending ? "Creating…" : "Create Course"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!edit} onOpenChange={(v) => !v && setEdit(null)}>
        <DialogContent className="rounded-3xl" data-testid="course-edit-dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Edit Course</DialogTitle>
          </DialogHeader>

          <div className="mt-2 grid grid-cols-1 gap-4">
            <div>
              <Label>Department</Label>
              <Select value={editDepartmentId} onValueChange={setEditDepartmentId}>
                <SelectTrigger className="mt-2 rounded-2xl" data-testid="course-edit-dept">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {(depts.data ?? []).map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.code} — {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="course-edit-code">Code</Label>
              <Input
                id="course-edit-code"
                value={editCode}
                onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                className="rounded-2xl mt-2"
                data-testid="course-edit-code"
              />
            </div>

            <div>
              <Label htmlFor="course-edit-name">Name</Label>
              <Input
                id="course-edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="rounded-2xl mt-2"
                data-testid="course-edit-name"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="secondary"
                onClick={() => setEdit(null)}
                className="rounded-2xl py-6"
                data-testid="course-edit-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!edit) return;
                  try {
                    await update.mutateAsync({
                      id: edit.id,
                      updates: {
                        departmentId: Number(editDepartmentId),
                        code: editCode.trim(),
                        name: editName.trim(),
                      },
                    });
                    setEdit(null);
                    toast({ title: "Updated", description: "Course updated successfully." });
                  } catch (e: any) {
                    toast({ title: "Update failed", description: e?.message ?? "Unknown error", variant: "destructive" });
                  }
                }}
                disabled={update.isPending || !editDepartmentId || !editCode.trim() || !editName.trim()}
                className="rounded-2xl py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
                data-testid="course-edit-submit"
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
        title="Delete course?"
        description="This action cannot be undone. If units reference this course, deletion may fail."
        confirmLabel={del.isPending ? "Deleting…" : "Delete"}
        destructive
        testid="course-delete-confirm"
        onConfirm={async () => {
          if (deleteId === null) return;
          try {
            await del.mutateAsync(deleteId);
            toast({ title: "Deleted", description: "Course removed." });
          } catch (e: any) {
            toast({ title: "Delete failed", description: e?.message ?? "Unknown error", variant: "destructive" });
          } finally {
            setDeleteId(null);
          }
        }}
      />
    </AppShell>
  );
}
