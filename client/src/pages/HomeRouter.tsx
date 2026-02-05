import { useEffect, useState } from "react";
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

  const isAuthLoading = auth.isLoading;
  const isMeLoading = me.isLoading;
  const isAuthenticated = auth.isAuthenticated;
  const meError = me.error;
  const meData = me.data;

  useEffect(() => {
    if (meError) {
      const msg = (meError as Error).message || "";
      if (msg.startsWith("401:")) {
        toast({
          title: "Unauthorized",
          description: "Logging in again…",
          variant: "destructive",
        });
        setTimeout(() => (window.location.href = "/api/login"), 500);
      }
    }
  }, [meError, toast]);

  // Handle redirects based on role once data is loaded
  useEffect(() => {
    if (!isAuthLoading && !isMeLoading && isAuthenticated && meData?.role) {
      const role = meData.role;
      if (role === "admin") setLocation("/admin");
      else if (role === "lecturer") setLocation("/lecturer");
      else if (role === "student") setLocation("/student");
    }
  }, [isAuthLoading, isMeLoading, isAuthenticated, meData, setLocation]);

  if (isAuthLoading) {
    return <Landing />;
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  if (isMeLoading) {
    return <Landing />;
  }

  const role = meData?.role ?? null;

  if (!role) {
    return <Onboarding />;
  }

  // Show the appropriate dashboard directly on the root path as well
  if (role === "admin") return <AdminOverview />;
  if (role === "lecturer") return <LecturerDashboard />;
  if (role === "student") return <StudentDashboard />;

  return <Onboarding />;
}
