import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import HomeRouter from "@/pages/HomeRouter";
import Onboarding from "@/pages/Onboarding";

import AdminOverview from "@/pages/AdminOverview";
import AdminDepartments from "@/pages/AdminDepartments";
import AdminCourses from "@/pages/AdminCourses";
import AdminLecturers from "@/pages/AdminLecturers";
import AdminStudents from "@/pages/AdminStudents";

import LecturerDashboard from "@/pages/LecturerDashboard";
import LecturerUnits from "@/pages/LecturerUnits";
import LecturerUnitDetail from "@/pages/LecturerUnitDetail";

import StudentDashboard from "@/pages/StudentDashboard";
import StudentUnitMaterials from "@/pages/StudentUnitMaterials";
import StudentNotifications from "@/pages/StudentNotifications";

function Router() {
  return (
    <Switch>
      {/* Root resolves landing vs role dashboards */}
      <Route path="/" component={HomeRouter} />

      {/* Onboarding (role=null) */}
      <Route path="/onboarding" component={Onboarding} />

      {/* Admin */}
      <Route path="/admin" component={AdminOverview} />
      <Route path="/admin/departments" component={AdminDepartments} />
      <Route path="/admin/courses" component={AdminCourses} />
      <Route path="/admin/lecturers" component={AdminLecturers} />
      <Route path="/admin/students" component={AdminStudents} />

      {/* Lecturer */}
      <Route path="/lecturer" component={LecturerDashboard} />
      <Route path="/lecturer/units" component={LecturerUnits} />
      <Route path="/lecturer/units/:id" component={LecturerUnitDetail} />

      {/* Student */}
      <Route path="/student" component={StudentDashboard} />
      <Route path="/student/units/:unitId" component={StudentUnitMaterials} />
      <Route path="/student/notifications" component={StudentNotifications} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
