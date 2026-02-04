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
import { useToast } from "@/hooks/use-toast";
import { useAdminDepartments, useCreateDepartment, useDeleteDepartment, useUpdateDepartment } from "@/hooks/use-admin";
import type { DepartmentResponse } from "@shared/routes";
import { Building2, Plus, Trash2, Pencil } from "lucide-react";

export default function AdminDepartments() {
  const { toast } = useToast();
  const list = useAdminDepartments();
  const create = useCreateDepartment();
  const update = useUpdateDepartment();
  const del = useDeleteDepartment();

  const [createOpen, setCreateOpen] = useState(false);
  const [edit, setEdit] = useState<DepartmentResponse | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");

  const columns: Column<DepartmentResponse>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Code",
        sortValue: (d) => d.code,
        cell: (d) => (
          <div className="font-mono text-xs rounded-xl bg-secondary/60 ring-1 ring-border/60 px-2 py-1 inline-flex">
            {d.code}
          </div>
        ),
      },
      {
        key: "name",
        header: "Department",
        sortValue: (d) => d.name,
        cell: (d) => <div className="font-semibold text-foreground">{d.name}</div>,
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        cell: (d) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl"
              onClick={() => {
                setEdit(d);
                setEditName(d.name);
                setEditCode(d.code);
              }}
              data-testid={`dept-edit-${d.id}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-xl"
              onClick={() => setDeleteId(d.id)}
              data-testid={`dept-delete-${d.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <AppShell
      role="admin"
      title="Departments"
      subtitle="Define academic divisions with clean codes and clear naming."
      right={
        <Button
          onClick={() => {
            setName("");
            setCode("");
            setCreateOpen(true);
          }}
          data-testid="dept-open-create"
          className="rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Department
        </Button>
      }
    >
      <Seo title="BeTTI LMS — Departments" description="Manage departments for BeTTI." />

      {list.isLoading ? (
        <div className="glass shadow-premium rounded-3xl p-8 animate-pulse" data-testid="dept-loading">
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="mt-6 h-10 w-full bg-muted rounded-2xl" />
          <div className="mt-4 h-48 w-full bg-muted rounded-3xl" />
        </div>
      ) : list.error ? (
        <div className="glass shadow-premium rounded-3xl p-6 text-sm text-destructive" data-testid="dept-error">
          {(list.error as Error).message}
        </div>
      ) : (list.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments yet"
          description="Create the first department to start structuring courses and assignments."
          actionLabel="Create Department"
          onAction={() => setCreateOpen(true)}
          testid="dept-empty"
        />
      ) : (
        <DataTable
          rows={list.data ?? []}
          columns={columns}
          searchPlaceholder="Search departments by name or code…"
          searchKeys={[(d) => d.name, (d) => d.code]}
          testid="dept-table"
        />
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-3xl" data-testid="dept-create-dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">New Department</DialogTitle>
          </DialogHeader>

          <div className="mt-2 grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="dept-code">Code</Label>
              <Input
                id="dept-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SCM"
                className="rounded-2xl mt-2"
                data-testid="dept-create-code"
              />
            </div>
            <div>
              <Label htmlFor="dept-name">Name</Label>
              <Input
                id="dept-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Supply Chain Management"
                className="rounded-2xl mt-2"
                data-testid="dept-create-name"
              />
            </div>

            <Button
              onClick={async () => {
                try {
                  await create.mutateAsync({ code: code.trim(), name: name.trim() });
                  setCreateOpen(false);
                  toast({ title: "Department created", description: "Structure updated successfully." });
                } catch (e: any) {
                  toast({ title: "Create failed", description: e?.message ?? "Unknown error", variant: "destructive" });
                }
              }}
              disabled={create.isPending || !code.trim() || !name.trim()}
              data-testid="dept-create-submit"
              className="rounded-2xl py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              {create.isPending ? "Creating…" : "Create Department"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!edit} onOpenChange={(v) => !v && setEdit(null)}>
        <DialogContent className="rounded-3xl" data-testid="dept-edit-dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Edit Department</DialogTitle>
          </DialogHeader>

          <div className="mt-2 grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="dept-edit-code">Code</Label>
              <Input
                id="dept-edit-code"
                value={editCode}
                onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                className="rounded-2xl mt-2"
                data-testid="dept-edit-code"
              />
            </div>
            <div>
              <Label htmlFor="dept-edit-name">Name</Label>
              <Input
                id="dept-edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="rounded-2xl mt-2"
                data-testid="dept-edit-name"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="secondary"
                onClick={() => setEdit(null)}
                className="rounded-2xl py-6"
                data-testid="dept-edit-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!edit) return;
                  try {
                    await update.mutateAsync({
                      id: edit.id,
                      updates: { code: editCode.trim(), name: editName.trim() },
                    });
                    setEdit(null);
                    toast({ title: "Updated", description: "Department updated successfully." });
                  } catch (e: any) {
                    toast({ title: "Update failed", description: e?.message ?? "Unknown error", variant: "destructive" });
                  }
                }}
                disabled={update.isPending || !editCode.trim() || !editName.trim()}
                className="rounded-2xl py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
                data-testid="dept-edit-submit"
              >
                {update.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Delete department?"
        description="This action cannot be undone. If courses reference this department, deletion may fail."
        confirmLabel={del.isPending ? "Deleting…" : "Delete"}
        destructive
        testid="dept-delete-confirm"
        onConfirm={async () => {
          if (deleteId === null) return;
          try {
            await del.mutateAsync(deleteId);
            toast({ title: "Deleted", description: "Department removed." });
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
