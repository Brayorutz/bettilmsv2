import { useMemo, useState } from "react";
import Seo from "@/components/Seo";
import AppShell from "@/components/AppShell";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMarkNotificationRead, useStudentNotifications } from "@/hooks/use-student";
import { Bell, CheckCircle2, Dot, MailOpen } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

export default function StudentNotifications() {
  const { toast } = useToast();
  const [unreadOnly, setUnreadOnly] = useState(false);

  const list = useStudentNotifications(unreadOnly);
  const markRead = useMarkNotificationRead();

  const sorted = useMemo(() => {
    const arr = [...(list.data ?? [])];
    arr.sort((a, b) => (new Date(b.createdAt as any).getTime() || 0) - (new Date(a.createdAt as any).getTime() || 0));
    return arr;
  }, [list.data]);

  return (
    <AppShell
      role="student"
      title="Notifications"
      subtitle="Real-time signals for new materials, deadlines and unit updates."
      unreadCount={sorted.filter((n) => !n.isRead).length}
      right={
        <div className="flex items-center gap-3 rounded-2xl bg-secondary/70 ring-1 ring-border/60 px-4 py-2">
          <div className="text-sm font-semibold">Unread only</div>
          <Switch
            checked={unreadOnly}
            onCheckedChange={setUnreadOnly}
            data-testid="notifications-unread-toggle"
          />
        </div>
      }
    >
      <Seo title="BeTTI LMS — Notifications" description="Student notifications and mark-as-read actions." />

      {list.isLoading ? (
        <div className="glass shadow-premium rounded-3xl p-8 animate-pulse" data-testid="notifications-loading">
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="mt-6 h-10 w-full bg-muted rounded-2xl" />
          <div className="mt-4 h-48 w-full bg-muted rounded-3xl" />
        </div>
      ) : list.error ? (
        <div className="glass shadow-premium rounded-3xl p-6 text-sm text-destructive" data-testid="notifications-error">
          {(list.error as Error).message}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={unreadOnly ? "No unread notifications" : "No notifications yet"}
          description="When lecturers upload materials or set deadlines, notifications will appear here."
          testid="notifications-empty"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3" data-testid="notifications-list">
          {sorted.map((n) => {
            const severity = (n.severity ?? "info") as string;
            const tone =
              severity === "warning"
                ? "bg-[hsl(var(--accent))]/10 ring-[hsl(var(--accent))]/20"
                : severity === "success"
                  ? "bg-[hsl(var(--success))]/10 ring-[hsl(var(--success))]/20"
                  : "bg-secondary/70 ring-border/60";

            return (
              <div
                key={n.id}
                className={`glass shadow-premium rounded-3xl p-5 sm:p-6 ring-1 ${tone} transition-all duration-300 hover:-translate-y-0.5`}
                data-testid={`notification-card-${n.id}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {n.isRead ? (
                        <MailOpen className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Dot className="h-7 w-7 text-primary" />
                      )}
                      <div className="font-semibold text-foreground" data-testid={`notification-message-${n.id}`}>
                        {n.message}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {n.createdAt
                        ? formatDistanceToNowStrict(new Date(n.createdAt as any), { addSuffix: true })
                        : "—"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    {n.isRead ? (
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-white/55 ring-1 ring-border/60 px-3 py-2 text-xs font-semibold text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
                        Read
                      </div>
                    ) : (
                      <Button
                        onClick={async () => {
                          try {
                            await markRead.mutateAsync(n.id);
                            toast({ title: "Marked as read", description: "Notification updated." });
                          } catch (e: any) {
                            toast({ title: "Action failed", description: e?.message ?? "Unknown error", variant: "destructive" });
                          }
                        }}
                        disabled={markRead.isPending}
                        className="rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
                        data-testid={`notification-markread-${n.id}`}
                      >
                        {markRead.isPending ? "Updating…" : "Mark read"}
                      </Button>
                    )}
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
