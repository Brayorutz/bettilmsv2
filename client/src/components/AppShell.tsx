import { PropsWithChildren, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Bell, BookOpen, GraduationCap, LayoutGrid, LogOut, Shield, University, Users, WandSparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import bettiLogo from "@assets/logo1_1770205562697.jpg";

type ShellRole = "admin" | "lecturer" | "student" | "unknown";

function initials(name?: string | null) {
  const t = (name || "").trim();
  if (!t) return "U";
  const parts = t.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function NavItem({
  href,
  icon: Icon,
  label,
  badge,
  testid,
}: {
  href: string;
  icon: any;
  label: string;
  badge?: string;
  testid: string;
}) {
  const [loc] = useLocation();
  const active = loc === href || (href !== "/" && loc.startsWith(href));

  return (
    <Link
      href={href}
      data-testid={testid}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sidebar-ring/20",
        active
          ? "bg-white/10 text-white shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
          : "text-white/85 hover:text-white hover:bg-white/8"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300",
          active ? "bg-white/12" : "bg-white/8 group-hover:bg-white/10"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="font-medium tracking-tight">{label}</span>
      {badge ? (
        <span className="ml-auto">
          <Badge className="rounded-full bg-sidebar-accent text-sidebar-accent-foreground shadow-sm">
            {badge}
          </Badge>
        </span>
      ) : null}

      {active ? (
        <span className="pointer-events-none absolute inset-y-2 left-2 w-1 rounded-full bg-sidebar-accent/90" />
      ) : null}
    </Link>
  );
}

export default function AppShell({
  children,
  role,
  title,
  subtitle,
  right,
  unreadCount,
}: PropsWithChildren<{
  role: ShellRole;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  unreadCount?: number;
}>) {
  const { user, logout, isLoggingOut } = useAuth();

  const displayName = useMemo(() => {
    const parts = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
    return parts || user?.email || "BeTTI User";
  }, [user?.firstName, user?.lastName, user?.email]);

  const nav = useMemo(() => {
    if (role === "admin") {
      return [
        { href: "/admin", icon: Shield, label: "Admin Overview", testid: "nav-admin" },
        { href: "/admin/departments", icon: University, label: "Departments", testid: "nav-departments" },
        { href: "/admin/courses", icon: BookOpen, label: "Courses", testid: "nav-courses" },
        { href: "/admin/lecturers", icon: Users, label: "Lecturers", testid: "nav-lecturers" },
        { href: "/admin/students", icon: GraduationCap, label: "Students", testid: "nav-students" },
      ] as const;
    }
    if (role === "lecturer") {
      return [
        { href: "/lecturer", icon: LayoutGrid, label: "Dashboard", testid: "nav-lecturer" },
        { href: "/lecturer/units", icon: BookOpen, label: "Units", testid: "nav-units" },
      ] as const;
    }
    if (role === "student") {
      return [
        { href: "/student", icon: LayoutGrid, label: "My Dashboard", testid: "nav-student" },
        {
          href: "/student/notifications",
          icon: Bell,
          label: "Notifications",
          badge: unreadCount && unreadCount > 0 ? String(unreadCount) : undefined,
          testid: "nav-notifications",
        },
      ] as const;
    }
    return [{ href: "/", icon: WandSparkles, label: "Home", testid: "nav-home" }] as const;
  }, [role, unreadCount]);

  return (
    <div className="min-h-dvh mesh-bg">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8 lg:py-8">
        {/* Sidebar */}
        <aside className="glass shadow-premium relative overflow-hidden rounded-3xl bg-sidebar text-sidebar-foreground">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sidebar-primary/25 blur-3xl" />
            <div className="absolute -right-28 -bottom-32 h-80 w-80 rounded-full bg-sidebar-accent/18 blur-3xl" />
          </div>

          <div className="relative p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11 overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
                <img
                  src={bettiLogo}
                  alt="BeTTI Logo"
                  className="h-full w-full object-cover"
                  data-testid="bett-logo"
                />
              </div>
              <div className="min-w-0">
                <div className="font-display text-lg leading-none text-white">BeTTI LMS</div>
                <div className="mt-1 text-xs text-white/70">
                  Belgut Technical Training Institute
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-sm font-semibold text-white">
                  {initials(displayName)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white" data-testid="user-display-name">
                    {displayName}
                  </div>
                  <div className="truncate text-xs text-white/70" data-testid="user-email">
                    {user?.email || "Authenticated"}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge
                  className={cn(
                    "rounded-full border border-white/10 bg-white/8 text-white/85",
                    role === "admin" && "bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-accent/30",
                    role === "student" && "bg-white/10",
                    role === "lecturer" && "bg-white/10"
                  )}
                  data-testid="role-badge"
                >
                  {role.toUpperCase()}
                </Badge>
                <Badge className="rounded-full bg-white/6 text-white/80 border border-white/10" data-testid="trust-badge">
                  Secure Access
                </Badge>
              </div>
            </div>

            <Separator className="my-5 bg-white/10" />

            <nav className="flex flex-col gap-1.5">
              {nav.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </nav>

            <Separator className="my-5 bg-white/10" />

            <Button
              variant="secondary"
              onClick={() => logout()}
              disabled={isLoggingOut}
              data-testid="logout-button"
              className={cn(
                "w-full justify-start rounded-2xl bg-white/10 text-white hover:bg-white/14 border border-white/10",
                "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
              )}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? "Signing out…" : "Logout"}
            </Button>

            <div className="mt-5 flex items-center gap-2 text-xs text-white/60">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-white/8 ring-1 ring-white/10">
                <GraduationCap className="h-4 w-4" />
              </span>
              <span>Modern, role-based learning workspace</span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0">
          <header className="glass shadow-premium rounded-3xl p-5 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <div className="fade-up font-display text-2xl sm:text-3xl text-foreground" data-testid="page-title">
                  {title}
                </div>
                {subtitle ? (
                  <div className="fade-up stagger-1 mt-1 text-sm text-muted-foreground" data-testid="page-subtitle">
                    {subtitle}
                  </div>
                ) : null}
              </div>

              <div className="fade-up stagger-2 flex items-center justify-between gap-3 md:justify-end">
                <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-secondary/70 px-3 py-2 ring-1 ring-border/60">
                  <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--success))] shadow-[0_0_0_4px_hsl(var(--success)/0.14)]" />
                  <span className="text-xs font-medium text-secondary-foreground">
                    System Online
                  </span>
                </div>
                {right}
              </div>
            </div>
          </header>

          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
