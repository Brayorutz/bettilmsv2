import { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Landing from "@/pages/Landing";
import Onboarding from "@/pages/Onboarding";
import AdminOverview from "@/pages/AdminOverview";
import LecturerDashboard from "@/pages/LecturerDashboard";
import StudentDashboard from "@/pages/StudentDashboard";
import { useMe } from "@/hooks/use-me";
import { useAuth } from "@/hooks/use-auth";

export default function HomeRouter() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const auth = useAuth();
  const me = useMe();

  // If /api/me fails with 401, send to login
  useEffect(() => {
    if (me.error) {
      const msg = (me.error as Error).message || "";
      if (msg.startsWith("401:")) {
        toast({
          title: "Unauthorized",
          description: "Logging in again…",
          variant: "destructive",
        });
        setTimeout(() => (window.location.href = "/api/login"), 500);
      }
    }
  }, [me.error, toast]);

  // If not authenticated, show landing
  if (auth.isLoading) {
    return <Landing />;
  }

  if (!auth.isAuthenticated) {
    return <Landing />;
  }

  if (me.isLoading) {
    return <Landing />;
  }

  const role = me.data?.role ?? null;

  if (!role) {
    return <Onboarding />;
  }

  if (role === "admin") return <AdminOverview />;
  if (role === "lecturer") return <LecturerDashboard />;
  if (role === "student") return <StudentDashboard />;

  // unknown fallback
  return <Onboarding />;
}
