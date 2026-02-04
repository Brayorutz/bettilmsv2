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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminDepartments,
  useAdminLecturers,
  useCreateLecturer,
  useDeleteLecturer,
  useUpdateLecturer,
} from "@/hooks/use-admin";
import type { DepartmentResponse, LecturerResponse } from "@shared/routes";
import { Plus, Trash2, Pencil, Users } from "lucide-react";

export default function AdminLecturers() {
  const { toast } = useToast();
  const depts = useAdminDepartments();
  const list = useAdminLecturers();
  const create = useCreateLecturer();
  const update = useUpdateLecturer();
  const del = useDeleteLecturer();

  const [createOpen, setCreateOpen] = useState(false);
  const [edit, setEdit] = useState<LecturerResponse | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Create form
  const [userId, setUserId] = useState("");
  const [staffNumber, setStaffNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("__none__");
  const [isActive, setIsActive] = useState(true);

  // Edit form
  const [eStaffNumber, setEStaffNumber] = useState("");
  const [eFullName, setEFullName] = useState("");
  const [eDepartmentId, setEDepartmentId] = useState<string>("__none__");
  const [eIsActive, setEIsActive] = useState(true);

  const deptMap = useMemo(() => {
    const m = new Map<number, DepartmentResponse>();
    (depts.data ?? []).forEach((d) => m.set(d.id, d));
    return m;
  }, [depts.data]);

  const columns: Column<LecturerResponse>[] = useMemo(
    () => [
      {
        key: "staffNumber",
        header: "Staff #",
        sortValue: (l) => l.staffNumber,
        cell: (l) => (
          <div className="font-mono text-xs rounded-xl bg-secondary/60 ring-1 ring-border/60 px-2 py-1 inline-flex">
            {l.staffNumber}
          </div>
        ),
      },
      {
        key: "fullName",
        header: "Lecturer",
        sortValue: (l) => l.fullName,
        cell: (l) => (
          <div>
            <div className="font-semibold text-foreground">{l.fullName}</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-mono">userId: {l.userId}</div>
          </div>
        ),
      },
      {
        key: "department",
        header: "Department",
        sortValue: (l) => (l.departmentId ? deptMap.get(l.departmentId)?.name ?? "" : ""),
        cell: (l) => (
          <div className="text-sm text-muted-foreground">
            {l.departmentId ? deptMap.get(l.departmentId)?.name ?? `Dept #${l.departmentId}` : "—"}
          </div>
        ),
      },
      {
        key: "active",
        header: "Status",
        sortValue: (l) => (l.isActive ? 1 : 0),
        cell: (l) => (
          <div
            className={[
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1",
              l.isActive
                ? "bg-[hsl(var(--success))]/12 text-[hsl(var(--success))] ring-[hsl(var(--success))]/20"
                : "bg-destructive/10 text-destructive ring-destructive/20",
            ].join(" ")}
            data-testid={`lecturer-status-${l.id}`}
          >
            <span className={l.isActive ? "h-2 w-2 rounded-full bg-[hsl(var(--success))]" : "h-2 w-2 rounded-full bg-destructive"} />
            {l.isActive ? "Active" : "Inactive"}
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        cell: (l) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl"
              onClick={() => {
                setEdit(l);
                setEStaffNumber(l.staffNumber);
                setEFullName(l.fullName);
                setEDepartmentId(l.departmentId ? String(l.departmentId) : "__none__");
                setEIsActive(!!l.isActive);
              }}
              data-testid={`lecturer-edit-${l.id}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-xl"
              onClick={() => setDeleteId(l.id)}
              data-testid={`lecturer-delete-${l.id}`}
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
      title="Lecturers"
      subtitle="Create and manage lecturers — staff numbers, departments, and activation state."
      right={
        <Button
          onClick={() => {
            setUserId("");
            setStaffNumber("");
            setFullName("");
            setDepartmentId("__none__");
            setIsActive(true);
            setCreateOpen(true);
          }}
          data-testid="lecturer-open-create"
          className="rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Lecturer
        </Button>
      }
    >
      <Seo title="BeTTI LMS — Lecturers" description="Manage lecturers in BeTTI LMS." />

      {isLoading ? (
        <div className="glass shadow-premium rounded-3xl p-8 animate-pulse" data-testid="lecturer-loading">
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="mt-6 h-10 w-full bg-muted rounded-2xl" />
          <div className="mt-4 h-48 w-full bg-muted rounded-3xl" />
        </div>
      ) : error ? (
        <div className="glass shadow-premium rounded-3xl p-6 text-sm text-destructive" data-testid="lecturer-error">
          {(error as Error).message}
        </div>
      ) : (list.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={Users}
          title="No lecturers yet"
          description="Create your first lecturer. Use the Replit Auth userId (sub) as the account link."
          actionLabel="Create Lecturer"
          onAction={() => setCreateOpen(true)}
          testid="lecturer-empty"
        />
      ) : (
        <DataTable
          rows={list.data ?? []}
          columns={columns}
          searchPlaceholder="Search by name, staff number, or userId…"
          searchKeys={[(l) => l.fullName, (l) => l.staffNumber, (l) => l.userId]}
          testid="lecturer-table"
        />
      )}

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-3xl" data-testid="lecturer-create-dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">New Lecturer</DialogTitle>
          </DialogHeader>

          <div className="mt-2 grid grid-cols-1 gap-4">
            <div className="rounded-3xl bg-[hsl(var(--accent))]/10 ring-1 ring-[hsl(var(--accent))]/20 p-4">
              <div className="text-sm font-semibold text-foreground">Admin note</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Link the lecturer to their authenticated account using <span className="font-mono">userId</span>{" "}
                (Replit OIDC <span className="font-mono">sub</span>). Temporary passwords are handled server-side.
              </div>
            </div>

            <div>
              <Label htmlFor="lect-userId">User ID (Replit sub)</Label>
              <Input
                id="lect-userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. 7a9d0f2b-…"
                className="rounded-2xl mt-2"
                data-testid="lecturer-create-userId"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="lect-staff">Staff Number</Label>
                <Input
                  id="lect-staff"
                  value={staffNumber}
                  onChange={(e) => setStaffNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. BeTTI/LEC/014"
                  className="rounded-2xl mt-2"
                  data-testid="lecturer-create-staffNumber"
                />
              </div>
              <div>
                <Label htmlFor="lect-name">Full Name</Label>
                <Input
                  id="lect-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Mr. Daniel Kiptoo"
                  className="rounded-2xl mt-2"
                  data-testid="lecturer-create-fullName"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <Label>Department (optional)</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger className="mt-2 rounded-2xl" data-testid="lecturer-create-dept">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {(depts.data ?? []).map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.code} — {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-secondary/70 ring-1 ring-border/60 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold">Active</div>
                  <div className="text-xs text-muted-foreground">Can access lecturer workspace</div>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} data-testid="lecturer-create-active" />
              </div>
            </div>

            <Button
              onClick={async () => {
                try {
                  await create.mutateAsync({
                    userId: userId.trim(),
                    staffNumber: staffNumber.trim(),
                    fullName: fullName.trim(),
                    departmentId: departmentId === "__none__" ? null : Number(departmentId),
                    isActive,
                  });
                  setCreateOpen(false);
                  toast({ title: "Lecturer created", description: "Lecturer profile added successfully." });
                } catch (e: any) {
                  toast({ title: "Create failed", description: e?.message ?? "Unknown error", variant: "destructive" });
                }
              }}
              disabled={create.isPending || !userId.trim() || !staffNumber.trim() || !fullName.trim()}
              data-testid="lecturer-create-submit"
              className="rounded-2xl py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              {create.isPending ? "Creating…" : "Create Lecturer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!edit} onOpenChange={(v) => !v && setEdit(null)}>
        <DialogContent className="rounded-3xl" data-testid="lecturer-edit-dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Edit Lecturer</DialogTitle>
          </DialogHeader>

          <div className="mt-2 grid grid-cols-1 gap-4">
            <div className="rounded-3xl bg-secondary/70 ring-1 ring-border/60 p-4">
              <div className="text-sm font-semibold">Linked account</div>
              <div className="mt-1 text-xs text-muted-foreground font-mono" data-testid="lecturer-edit-userId">
                userId: {edit?.userId}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Staff Number</Label>
                <Input
                  value={eStaffNumber}
                  onChange={(e) => setEStaffNumber(e.target.value.toUpperCase())}
                  className="rounded-2xl mt-2"
                  data-testid="lecturer-edit-staffNumber"
                />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input
                  value={eFullName}
                  onChange={(e) => setEFullName(e.target.value)}
                  className="rounded-2xl mt-2"
                  data-testid="lecturer-edit-fullName"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <Label>Department (optional)</Label>
                <Select value={eDepartmentId} onValueChange={setEDepartmentId}>
                  <SelectTrigger className="mt-2 rounded-2xl" data-testid="lecturer-edit-dept">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {(depts.data ?? []).map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.code} — {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-secondary/70 ring-1 ring-border/60 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold">Active</div>
                  <div className="text-xs text-muted-foreground">Can access lecturer workspace</div>
                </div>
                <Switch checked={eIsActive} onCheckedChange={setEIsActive} data-testid="lecturer-edit-active" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="secondary"
                onClick={() => setEdit(null)}
                className="rounded-2xl py-6"
                data-testid="lecturer-edit-cancel"
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
                        staffNumber: eStaffNumber.trim(),
                        fullName: eFullName.trim(),
                        departmentId: eDepartmentId === "__none__" ? null : Number(eDepartmentId),
                        isActive: eIsActive,
                      },
                    });
                    setEdit(null);
                    toast({ title: "Updated", description: "Lecturer updated successfully." });
                  } catch (e: any) {
                    toast({ title: "Update failed", description: e?.message ?? "Unknown error", variant: "destructive" });
                  }
                }}
                disabled={update.isPending || !eStaffNumber.trim() || !eFullName.trim()}
                className="rounded-2xl py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
                data-testid="lecturer-edit-submit"
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
        title="Delete lecturer?"
        description="This action cannot be undone. Units that reference this lecturer may block deletion."
        confirmLabel={del.isPending ? "Deleting…" : "Delete"}
        destructive
        testid="lecturer-delete-confirm"
        onConfirm={async () => {
          if (deleteId === null) return;
          try {
            await del.mutateAsync(deleteId);
            toast({ title: "Deleted", description: "Lecturer removed." });
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
