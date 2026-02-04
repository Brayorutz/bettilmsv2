import { useMemo } from "react";
import { useParams } from "wouter";
import Seo from "@/components/Seo";
import AppShell from "@/components/AppShell";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStudentUnitMaterials } from "@/hooks/use-student";
import { AlertTriangle, CalendarClock, FileText, Link2, Lock, Video, ClipboardList, MessagesSquare, ArrowLeft } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

type MaterialType = "pdf" | "video" | "scanned_notes" | "assignment" | "qa_task";

function typeIcon(t: MaterialType) {
  if (t === "video") return Video;
  if (t === "assignment") return ClipboardList;
  if (t === "qa_task") return MessagesSquare;
  return FileText;
}

export default function StudentUnitMaterials() {
  const params = useParams<{ unitId: string }>();
  const unitId = Number(params?.unitId);

  const list = useStudentUnitMaterials(unitId);

  const sorted = useMemo(() => {
    const arr = [...(list.data ?? [])];
    arr.sort((a, b) => (new Date(b.material.createdAt as any).getTime() || 0) - (new Date(a.material.createdAt as any).getTime() || 0));
    return arr;
  }, [list.data]);

  return (
    <AppShell
      role="student"
      title="Unit Materials"
      subtitle="View resources, deadlines, and lock states clearly."
      right={
        <Button
          variant="secondary"
          onClick={() => window.history.back()}
          className="rounded-2xl"
          data-testid="student-materials-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      }
    >
      <Seo title="BeTTI LMS — Unit Materials" description="Student unit materials with deadline lock states." />

      {list.isLoading ? (
        <div className="glass shadow-premium rounded-3xl p-8 animate-pulse" data-testid="student-materials-loading">
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="mt-6 h-10 w-full bg-muted rounded-2xl" />
          <div className="mt-4 h-48 w-full bg-muted rounded-3xl" />
        </div>
      ) : list.error ? (
        <div className="glass shadow-premium rounded-3xl p-6 text-sm text-destructive" data-testid="student-materials-error">
          {(list.error as Error).message}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No materials yet"
          description="Your lecturer hasn’t uploaded materials for this unit yet. Check back soon."
          testid="student-materials-empty"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4" data-testid="student-materials-list">
          {sorted.map((item) => {
            const m = item.material;
            const Icon = typeIcon(m.type as any);

            const timeTo = item.timeToDeadlineSeconds;
            const deadlineSoon =
              typeof timeTo === "number" && timeTo > 0 && timeTo <= 48 * 3600;

            return (
              <div
                key={m.id}
                className="glass shadow-premium rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-0.5"
                data-testid={`student-material-card-${m.id}`}
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

                          {m.deadlineAt ? (
                            <Badge
                              className={[
                                "rounded-full border",
                                item.isLocked
                                  ? "bg-[hsl(var(--accent))]/18 text-[hsl(var(--accent-foreground))] border-[hsl(var(--accent))]/30"
                                  : deadlineSoon
                                    ? "bg-[hsl(var(--accent))]/14 text-[hsl(var(--accent-foreground))] border-[hsl(var(--accent))]/25"
                                    : "bg-secondary/70 text-secondary-foreground border-border/60",
                              ].join(" ")}
                              data-testid={`student-material-deadline-badge-${m.id}`}
                            >
                              <CalendarClock className="mr-1 h-3.5 w-3.5" />
                              Deadline in{" "}
                              {formatDistanceToNowStrict(new Date(m.deadlineAt as any), {
                                addSuffix: true,
                              })}
                            </Badge>
                          ) : (
                            <Badge className="rounded-full bg-secondary/70 text-secondary-foreground border border-border/60">
                              No deadline
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {m.instruction ? (
                      <div
                        className="mt-4 rounded-3xl bg-[hsl(var(--success))]/10 ring-1 ring-[hsl(var(--success))]/20 p-4"
                        data-testid={`student-material-instruction-${m.id}`}
                      >
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--success))]">
                          Instruction
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                          {m.instruction}
                        </div>
                      </div>
                    ) : null}

                    {item.isLocked ? (
                      <div
                        className="mt-4 rounded-3xl bg-[hsl(var(--accent))]/10 ring-1 ring-[hsl(var(--accent))]/20 p-4"
                        data-testid={`student-material-locked-${m.id}`}
                      >
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-5 w-5 text-[hsl(var(--accent-foreground))] mt-0.5" />
                          <div>
                            <div className="text-sm font-semibold text-foreground">Locked</div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              {item.lockReason ?? "Deadline passed. You can view details, but access is disabled."}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    {m.url ? (
                      <Button
                        onClick={() => window.open(m.url as any, "_blank")}
                        disabled={item.isLocked}
                        className="rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                        data-testid={`student-material-open-${m.id}`}
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        Open
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        disabled
                        className="rounded-2xl"
                        data-testid={`student-material-no-url-${m.id}`}
                      >
                        No URL
                      </Button>
                    )}

                    {item.isLocked ? (
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-secondary/70 ring-1 ring-border/60 px-3 py-2 text-xs font-semibold text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        Access disabled
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
