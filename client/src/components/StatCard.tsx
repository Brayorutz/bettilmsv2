import { cn } from "@/lib/utils";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Link } from "wouter";

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "blue",
  href,
  testid,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  tone?: "blue" | "green" | "gold";
  href?: string;
  testid: string;
}) {
  const toneClasses =
    tone === "green"
      ? "from-[hsl(var(--success))]/18 to-[hsl(var(--success))]/0 ring-[hsl(var(--success))]/20"
      : tone === "gold"
        ? "from-[hsl(var(--accent))]/22 to-[hsl(var(--accent))]/0 ring-[hsl(var(--accent))]/20"
        : "from-primary/18 to-primary/0 ring-primary/15";

  const content = (
    <div
      data-testid={testid}
      className={cn(
        "group glass shadow-premium relative overflow-hidden rounded-3xl p-5 sm:p-6",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_hsl(222_60%_10%_/_0.12)]"
      )}
    >
      <div className={cn("absolute inset-0 pointer-events-none bg-gradient-to-br", toneClasses)} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {title}
          </div>
          <div className="mt-2 font-display text-3xl text-foreground tracking-tight">
            {value}
          </div>
          {description ? (
            <div className="mt-1 text-sm text-muted-foreground">{description}</div>
          ) : null}
        </div>

        <div
          className={cn(
            "grid h-12 w-12 place-items-center rounded-2xl ring-1 ring-border/60 bg-white/60",
            "shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
          )}
        >
          <Icon className="h-6 w-6 text-foreground/80" />
        </div>
      </div>

      {href ? (
        <div className="relative mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <span className="opacity-85 group-hover:opacity-100 transition-opacity">Open</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
