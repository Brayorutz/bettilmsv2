import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  testid,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  testid: string;
}) {
  return (
    <div
      className="glass shadow-premium rounded-3xl p-8 sm:p-10 text-center"
      data-testid={testid}
    >
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary/70 ring-1 ring-border/60">
        <Icon className="h-7 w-7 text-foreground/70" />
      </div>
      <div className="mt-5 font-display text-2xl text-foreground">{title}</div>
      <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">{description}</p>
      {actionLabel && onAction ? (
        <div className="mt-6">
          <Button
            onClick={onAction}
            data-testid={`${testid}-action`}
            className="rounded-2xl px-5 py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
