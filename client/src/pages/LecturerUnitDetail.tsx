import { useMemo, useState } from "react";
import { useParams } from "wouter";
import Seo from "@/components/Seo";
import AppShell from "@/components/AppShell";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  useConfirmAddEnrollment,
  useCreateEnrollment,
  useCreateMaterial,
  useDeleteMaterial,
  useLecturerUnitMaterials,
  useUnitEnrollments,
  useUpdateMaterial,
} from "@/hooks/use-lecturer";
import { AlertCircle, CalendarClock, FileText, Link2, Trash2, Users2, Video, ClipboardList, MessagesSquare } from "lucide-react";
import type { MaterialResponse } from "@shared/routes";
import { format } from "date-fns";

type MaterialType = "pdf" | "video" | "scanned_notes" | "assignment" | "qa_task";

function typeIcon(t: MaterialType) {
  if (t === "video") return Video;
  if (t === "assignment") return ClipboardList;
  if (t === "qa_task") return MessagesSquare;
  return FileText;
}

export default function LecturerUnitDetail() {
  const params = useParams<{ id: string }>();
  const unitId = Number(params?.id);

  const { toast } = useToast();

  const enrollments = useUnitEnrollments(unitId);
  const createEnrollment = useCreateEnrollment(unitId);
  const confirmAdd = useConfirmAddEnrollment(unitId);

  const materials = useLecturerUnitMaterials(unitId);
  const createMaterial = useCreateMaterial(unitId);
  const updateMaterial = useUpdateMaterial();
  const deleteMaterial = useDeleteMaterial();

  // Enrollment form
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [studentName, setStudentName] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAdmission, setConfirmAdmission] = useState<string>("");
  const [existingUnits, setExistingUnits] = useState<
    Array<{ unit: any; course: any; department: any }>
  >([]);

  // Material form
  const [createOpen, setCreateOpen] = useState(false);
  const [mTitle, setMTitle] = useState("");
  const [mType, setMType] = useState<MaterialType>("pdf");
  const [mInstruction, setMInstruction] = useState("");
  const [mUrl, setMUrl] = useState("");
  const [mDeadline, setMDeadline] = useState<string>("");

  const [edit, setEdit] = useState<MaterialResponse | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eType, setEType] = useState<MaterialType>("pdf");
  const [eInstruction, setEInstruction] = useState("");
  const [eUrl, setEUrl] = useState("");
  const [eDeadline, setEDeadline] = useState<string>("");

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loading = enrollments.isLoading || materials.isLoading;
  const error = enrollments.error || materials.error;

  const materialsSorted = useMemo(() => {
    const arr = [...(materials.data ?? [])];
    arr.sort((a, b) => (new Date(b.createdAt as any).getTime() || 0) - (new Date(a.createdAt as any).getTime() || 0));
    return arr;
  }, [materials.data]);

  return (
    <AppShell
      role="lecturer"
      title={`Unit Workspace`}
      subtitle="Enroll students, upload materials, and set deadlines with clarity."
      right={
        <Button
          onClick={() => {
            setMTitle("");
            setMType("pdf");
            setMInstruction("");
            setMUrl("");
            setMDeadline("");
            setCreateOpen(true);
          }}
          data-testid="material-open-create"
          className="rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
        >
          Upload Material
        </Button>
      }
    >
      <Seo title="BeTTI LMS — Unit Detail" description="Manage unit enrollments and materials." />

      {loading ? (
        <div className="glass shadow-premium rounded-3xl p-8 animate-pulse" data-testid="unitdetail-loading">
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="mt-6 h-10 w-full bg-muted rounded-2xl" />
          <div className="mt-4 h-48 w-full bg-muted rounded-3xl" />
        </div>
      ) : error ? (
        <div className="glass shadow-premium rounded-3xl p-6 text-sm text-destructive" data-testid="unitdetail-error">
          {(error as Error).message}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <Tabs defaultValue="materials" className="w-full" data-testid="unitdetail-tabs">
              <TabsList className="rounded-2xl bg-secondary/70 ring-1 ring-border/60 p-1" data-testid="unitdetail-tabslist">
                <TabsTrigger value="materials" className="rounded-xl" data-testid="tab-materials">
                  Materials
                </TabsTrigger>
                <TabsTrigger value="enrollments" className="rounded-xl" data-testid="tab-enrollments">
                  Enrollments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="materials" className="mt-4">
                {(materialsSorted.length ?? 0) === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No materials uploaded"
                    description="Upload PDFs, videos, scanned notes, assignments, or Q&A tasks. Add a clear instruction box for students."
                    actionLabel="Upload first material"
                    onAction={() => setCreateOpen(true)}
                    testid="materials-empty"
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-4" data-testid="materials-list">
                    {materialsSorted.map((m) => {
                      const Icon = typeIcon(m.type as any);
                      const hasDeadline = !!m.deadlineAt;
                      const deadlineLabel = hasDeadline
                        ? format(new Date(m.deadlineAt as any), "EEE, dd MMM yyyy • HH:mm")
                        : "No deadline";
                      return (
                        <div
                          key={m.id}
                          className="glass shadow-premium rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-0.5"
                          data-testid={`material-card-${m.id}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-2xl bg-secondary/70 ring-1 ring-border/60 grid place-items-center">
                                  <Icon className="h-5 w-5 text-foreground/80" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-foreground truncate">{m.title}</div>
                                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span className="font-mono rounded-xl bg-secondary/70 ring-1 ring-border/60 px-2 py-1 inline-flex">
                                      {String(m.type).replaceAll("_", " ")}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 ring-1 ring-border/60 bg-white/50">
                                      <CalendarClock className="h-3.5 w-3.5" />
                                      {deadlineLabel}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {m.instruction ? (
                                <div className="mt-4 rounded-3xl bg-[hsl(var(--accent))]/10 ring-1 ring-[hsl(var(--accent))]/20 p-4">
                                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--accent-foreground))]">
                                    Instruction
                                  </div>
                                  <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap" data-testid={`material-instruction-${m.id}`}>
                                    {m.instruction}
                                  </div>
                                </div>
                              ) : null}

                              {m.url ? (
                                <div className="mt-4 flex items-center gap-2 text-sm" data-testid={`material-url-${m.id}`}>
                                  <Link2 className="h-4 w-4 text-primary" />
                                  <a
                                    href={m.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary hover:underline break-all"
                                  >
                                    {m.url}
                                  </a>
                                </div>
                              ) : (
                                <div className="mt-4 text-sm text-muted-foreground">
                                  No URL provided.
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="secondary"
                                className="rounded-2xl"
                                onClick={() => {
                                  setEdit(m);
                                  setETitle(m.title);
                                  setEType(m.type as any);
                                  setEInstruction(m.instruction ?? "");
                                  setEUrl(m.url ?? "");
                                  setEDeadline(m.deadlineAt ? new Date(m.deadlineAt as any).toISOString().slice(0, 16) : "");
                                }}
                                data-testid={`material-edit-${m.id}`}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                className="rounded-2xl"
                                onClick={() => setDeleteId(m.id)}
                                data-testid={`material-delete-${m.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="enrollments" className="mt-4">
                <div className="glass shadow-premium rounded-3xl p-6 sm:p-8" data-testid="enrollments-panel">
                  <div className="flex items-start gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/12 ring-1 ring-primary/20">
                      <Users2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-2xl">Enroll a student</div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Admission number must match the format <span className="font-mono">SCM/6155/25S</span>.
                        If the student already exists in another unit, you’ll be asked to confirm adding them here.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Admission Number</Label>
                      <Input
                        value={admissionNumber}
                        onChange={(e) => setAdmissionNumber(e.target.value.toUpperCase())}
                        placeholder="SCM/6155/25S"
                        className="rounded-2xl mt-2"
                        data-testid="enroll-admission"
                      />
                    </div>
                    <div>
                      <Label>Student Full Name</Label>
                      <Input
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. Mercy Chebet"
                        className="rounded-2xl mt-2"
                        data-testid="enroll-fullName"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={async () => {
                        try {
                          const result: any = await createEnrollment.mutateAsync({
                            admissionNumber: admissionNumber.trim(),
                            fullName: studentName.trim(),
                          });
                          // result can be Enrollment (201) or confirmation payload (200)
                          if (result?.requiresConfirmation) {
                            setConfirmAdmission(admissionNumber.trim());
                            setExistingUnits(result.existingUnits ?? []);
                            setConfirmOpen(true);
                            return;
                          }
                          setAdmissionNumber("");
                          setStudentName("");
                          toast({ title: "Enrolled", description: "Student added to unit." });
                        } catch (e: any) {
                          toast({ title: "Enrollment failed", description: e?.message ?? "Unknown error", variant: "destructive" });
                        }
                      }}
                      disabled={createEnrollment.isPending || !admissionNumber.trim() || !studentName.trim()}
                      data-testid="enroll-submit"
                      className="rounded-2xl py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      {createEnrollment.isPending ? "Enrolling…" : "Enroll student"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setAdmissionNumber("");
                        setStudentName("");
                      }}
                      data-testid="enroll-clear"
                      className="rounded-2xl py-6"
                    >
                      Clear
                    </Button>
                  </div>

                  <div className="mt-6">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Current enrollments
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-2" data-testid="enrollments-list">
                      {(enrollments.data ?? []).length === 0 ? (
                        <div className="text-sm text-muted-foreground">No enrollments yet.</div>
                      ) : (
                        (enrollments.data ?? []).map((r) => (
                          <div
                            key={r.enrollment.id}
                            className="rounded-2xl bg-white/55 ring-1 ring-border/60 px-4 py-3 flex items-center justify-between"
                            data-testid={`enrollment-row-${r.enrollment.id}`}
                          >
                            <div className="min-w-0">
                              <div className="font-semibold text-foreground truncate">{r.student.fullName}</div>
                              <div className="mt-1 text-xs text-muted-foreground font-mono">
                                {r.student.admissionNumber}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              #{r.student.id}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-4">
            <div className="glass shadow-premium rounded-3xl p-6 sm:p-8" data-testid="unitdetail-side">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Upload guidance
              </div>
              <div className="mt-2 font-display text-2xl">Instruction box matters.</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Students see a clearly styled instruction box per material. Use it for expectations,
                references, and what to submit. Deadlines are emphasized in <span className="font-semibold">Gold</span>.
              </p>

              <div className="mt-5 rounded-3xl bg-[hsl(var(--accent))]/10 ring-1 ring-[hsl(var(--accent))]/20 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-[hsl(var(--accent-foreground))] mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-foreground">Deadline behavior</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Once a deadline passes, students can still <span className="font-semibold">view</span> the item, but access actions should be disabled.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-3xl bg-secondary/70 ring-1 ring-border/60 p-4">
                <div className="text-sm font-semibold">Unit ID</div>
                <div className="mt-1 font-mono text-xs text-muted-foreground" data-testid="unitdetail-unitid">
                  {unitId}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate confirm */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Student already registered"
        description={`This student is already registered in: ${existingUnits
          .map((x) => `${x.unit?.code || "UNIT"} (${x.course?.code || "COURSE"})`)
          .join(", ")}. Do you want to add them to this unit as well?`}
        confirmLabel={confirmAdd.isPending ? "Adding…" : "Yes, add to this unit"}
        cancelLabel="Cancel"
        testid="enroll-duplicate-confirm"
        onConfirm={async () => {
          try {
            await confirmAdd.mutateAsync(confirmAdmission);
            toast({ title: "Added", description: "Student added to this unit." });
            setAdmissionNumber("");
            setStudentName("");
          } catch (e: any) {
            toast({ title: "Confirm failed", description: e?.message ?? "Unknown error", variant: "destructive" });
          } finally {
            setConfirmOpen(false);
            setExistingUnits([]);
            setConfirmAdmission("");
          }
        }}
      />

      {/* Create material */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-3xl" data-testid="material-create-dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Upload Material</DialogTitle>
          </DialogHeader>

          <div className="mt-2 grid grid-cols-1 gap-4">
            <div className="rounded-3xl bg-[hsl(var(--success))]/10 ring-1 ring-[hsl(var(--success))]/20 p-4">
              <div className="text-sm font-semibold text-foreground">Instruction (visible to students)</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Make it explicit: what to read, watch, submit, and how it will be graded.
              </div>
            </div>

            <div>
              <Label>Title</Label>
              <Input
                value={mTitle}
                onChange={(e) => setMTitle(e.target.value)}
                className="rounded-2xl mt-2"
                placeholder="e.g. Week 3 — Procurement Cycle"
                data-testid="material-create-title"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={mType} onValueChange={(v: any) => setMType(v)}>
                  <SelectTrigger className="rounded-2xl mt-2" data-testid="material-create-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="scanned_notes">Scanned Notes</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="qa_task">Q&A Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Deadline (optional)</Label>
                <Input
                  type="datetime-local"
                  value={mDeadline}
                  onChange={(e) => setMDeadline(e.target.value)}
                  className="rounded-2xl mt-2"
                  data-testid="material-create-deadline"
                />
              </div>
            </div>

            <div>
              <Label>Instruction</Label>
              <Textarea
                value={mInstruction}
                onChange={(e) => setMInstruction(e.target.value)}
                className="rounded-2xl mt-2 min-h-[120px]"
                placeholder="Instructions for students…"
                data-testid="material-create-instruction"
              />
            </div>

            <div>
              <Label>URL (optional)</Label>
              <Input
                value={mUrl}
                onChange={(e) => setMUrl(e.target.value)}
                className="rounded-2xl mt-2"
                placeholder="https://…"
                data-testid="material-create-url"
              />
            </div>

            <Button
              onClick={async () => {
                try {
                  await createMaterial.mutateAsync({
                    unitId,
                    title: mTitle.trim(),
                    type: mType,
                    instruction: mInstruction.trim() ? mInstruction.trim() : null,
                    url: mUrl.trim() ? mUrl.trim() : null,
                    deadlineAt: mDeadline ? new Date(mDeadline) : null,
                  } as any);
                  setCreateOpen(false);
                  toast({ title: "Uploaded", description: "Material created and students will be notified." });
                } catch (e: any) {
                  toast({ title: "Upload failed", description: e?.message ?? "Unknown error", variant: "destructive" });
                }
              }}
              disabled={createMaterial.isPending || !mTitle.trim() || !mType}
              data-testid="material-create-submit"
              className="rounded-2xl py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              {createMaterial.isPending ? "Uploading…" : "Create material"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit material */}
      <Dialog open={!!edit} onOpenChange={(v) => !v && setEdit(null)}>
        <DialogContent className="rounded-3xl" data-testid="material-edit-dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Edit Material</DialogTitle>
          </DialogHeader>

          <div className="mt-2 grid grid-cols-1 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={eTitle} onChange={(e) => setETitle(e.target.value)} className="rounded-2xl mt-2" data-testid="material-edit-title" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={eType} onValueChange={(v: any) => setEType(v)}>
                  <SelectTrigger className="rounded-2xl mt-2" data-testid="material-edit-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="scanned_notes">Scanned Notes</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="qa_task">Q&A Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Deadline (optional)</Label>
                <Input type="datetime-local" value={eDeadline} onChange={(e) => setEDeadline(e.target.value)} className="rounded-2xl mt-2" data-testid="material-edit-deadline" />
              </div>
            </div>

            <div>
              <Label>Instruction</Label>
              <Textarea value={eInstruction} onChange={(e) => setEInstruction(e.target.value)} className="rounded-2xl mt-2 min-h-[120px]" data-testid="material-edit-instruction" />
            </div>

            <div>
              <Label>URL</Label>
              <Input value={eUrl} onChange={(e) => setEUrl(e.target.value)} className="rounded-2xl mt-2" data-testid="material-edit-url" />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="secondary" onClick={() => setEdit(null)} className="rounded-2xl py-6" data-testid="material-edit-cancel">
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!edit) return;
                  try {
                    await updateMaterial.mutateAsync({
                      id: edit.id,
                      updates: {
                        title: eTitle.trim(),
                        type: eType,
                        instruction: eInstruction.trim() ? eInstruction.trim() : null,
                        url: eUrl.trim() ? eUrl.trim() : null,
                        deadlineAt: eDeadline ? new Date(eDeadline) : null,
                      } as any,
                    });
                    setEdit(null);
                    toast({ title: "Saved", description: "Material updated." });
                  } catch (e: any) {
                    toast({ title: "Save failed", description: e?.message ?? "Unknown error", variant: "destructive" });
                  }
                }}
                disabled={updateMaterial.isPending || !eTitle.trim()}
                className="rounded-2xl py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
                data-testid="material-edit-submit"
              >
                {updateMaterial.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete material */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Delete material?"
        description="This action cannot be undone. Students may lose access to this material."
        confirmLabel={deleteMaterial.isPending ? "Deleting…" : "Delete"}
        destructive
        testid="material-delete-confirm"
        onConfirm={async () => {
          if (deleteId === null) return;
          try {
            await deleteMaterial.mutateAsync(deleteId);
            toast({ title: "Deleted", description: "Material removed." });
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
