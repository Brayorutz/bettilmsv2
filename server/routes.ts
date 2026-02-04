import type { Express } from "express";
import type { Server } from "http";
import { z } from "zod";
import { api } from "@shared/routes";
import { storage } from "./storage";
import { isAuthenticated, registerAuthRoutes, setupAuth } from "./replit_integrations/auth";
import { authStorage } from "./replit_integrations/auth/storage";

function getUserId(req: any): string {
  return req.user?.claims?.sub;
}

async function getRoleForUser(userId: string): Promise<"admin" | "lecturer" | "student" | null> {
  const user = await authStorage.getUser(userId);
  if (!user) return null;
  return user.role as any;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  await storage.seed();

  app.get(api.me.get.path, isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const role = await getRoleForUser(userId);
    const user = await authStorage.getUser(userId);
    res.json({ user: user ?? null, role });
  });

  // Admin: departments
  app.get(api.admin.departments.list.path, isAuthenticated, async (_req, res) => {
    const rows = await storage.listDepartments();
    res.json(rows);
  });

  app.post(api.admin.departments.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.admin.departments.create.input.parse(req.body);
      const row = await storage.createDepartment(input);
      res.status(201).json(row);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid input",
          field: err.errors[0]?.path?.join("."),
        });
      }
      throw err;
    }
  });

  app.put(api.admin.departments.update.path, isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updates = api.admin.departments.update.input.parse(req.body);
      const row = await storage.updateDepartment(id, updates);
      if (!row) return res.status(404).json({ message: "Not found" });
      res.json(row);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid input",
          field: err.errors[0]?.path?.join("."),
        });
      }
      throw err;
    }
  });

  app.delete(api.admin.departments.delete.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    const ok = await storage.deleteDepartment(id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    res.status(204).end();
  });

  // Admin: courses
  app.get(api.admin.courses.list.path, isAuthenticated, async (_req, res) => {
    const rows = await storage.listCourses();
    res.json(rows);
  });

  app.post(api.admin.courses.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.admin.courses.create.input.parse(req.body);
      const row = await storage.createCourse(input);
      res.status(201).json(row);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid input",
          field: err.errors[0]?.path?.join("."),
        });
      }
      throw err;
    }
  });

  app.put(api.admin.courses.update.path, isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updates = api.admin.courses.update.input.parse(req.body);
      const row = await storage.updateCourse(id, updates);
      if (!row) return res.status(404).json({ message: "Not found" });
      res.json(row);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid input",
          field: err.errors[0]?.path?.join("."),
        });
      }
      throw err;
    }
  });

  app.delete(api.admin.courses.delete.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    const ok = await storage.deleteCourse(id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    res.status(204).end();
  });

  // Admin: lecturers
  app.get(api.admin.lecturers.list.path, isAuthenticated, async (_req, res) => {
    const rows = await storage.listLecturers();
    res.json(rows);
  });

  app.post(api.admin.lecturers.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.admin.lecturers.create.input.parse(req.body);
      const row = await storage.createLecturer(input);

      const courseIdsRaw = typeof req.query.courseIds === "string" ? req.query.courseIds : "";
      const courseIds = courseIdsRaw
        .split(",")
        .map((s: string) => Number(s.trim()))
        .filter((n: number) => Number.isFinite(n));
      if (courseIds.length > 0) {
        await storage.setLecturerCourseAssignments(row.id, courseIds);
      }

      res.status(201).json(row);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid input",
          field: err.errors[0]?.path?.join("."),
        });
      }
      throw err;
    }
  });

  app.put(api.admin.lecturers.update.path, isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updates = api.admin.lecturers.update.input.parse(req.body);
      const row = await storage.updateLecturer(id, updates);
      if (!row) return res.status(404).json({ message: "Not found" });
      res.json(row);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid input",
          field: err.errors[0]?.path?.join("."),
        });
      }
      throw err;
    }
  });

  app.delete(api.admin.lecturers.delete.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    const ok = await storage.deleteLecturer(id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    res.status(204).end();
  });

  app.get(api.admin.students.list.path, isAuthenticated, async (req: any, res) => {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const rows = await storage.listStudents({ q });
    res.json(rows);
  });

  // Lecturer: my courses
  app.get(api.lecturer.myCourses.list.path, isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const rows = await storage.listLecturerCourses(userId);
    res.json(rows);
  });

  // Lecturer: units
  app.get(api.lecturer.units.list.path, isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const input = api.lecturer.units.list.input?.parse(req.query);
    const rows = await storage.listLecturerUnits(userId, { courseId: input?.courseId });
    res.json(rows);
  });

  app.post(api.lecturer.units.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const input = api.lecturer.units.create.input.parse(req.body);
      const row = await storage.createUnit({ lecturerUserId: userId, ...input });
      res.status(201).json(row);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid input",
          field: err.errors[0]?.path?.join("."),
        });
      }
      throw err;
    }
  });

  app.put(api.lecturer.units.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const id = Number(req.params.id);
      const updates = api.lecturer.units.update.input.parse(req.body);
      const row = await storage.updateUnit(userId, id, updates);
      if (!row) return res.status(404).json({ message: "Not found" });
      res.json(row);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid input",
          field: err.errors[0]?.path?.join("."),
        });
      }
      throw err;
    }
  });

  app.delete(api.lecturer.units.delete.path, isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    const ok = await storage.deleteUnit(userId, id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    res.status(204).end();
  });

  // Lecturer: enrollments
  app.get(api.lecturer.enrollments.list.path, isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const unitId = Number(req.params.unitId);
    const rows = await storage.listUnitEnrollments(userId, unitId);
    res.json(rows);
  });

  app.post(api.lecturer.enrollments.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const unitId = Number(req.params.unitId);
      const input = api.lecturer.enrollments.create.input.parse(req.body);
      const result = await storage.enrollStudentToUnit(userId, unitId, input, "normal");
      if (result.kind === "needs_confirmation") {
        return res.status(200).json({
          requiresConfirmation: true,
          existingUnits: result.existingUnits,
          student: result.student,
        });
      }
      res.status(201).json(result.enrollment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid input",
          field: err.errors[0]?.path?.join("."),
        });
      }
      if (err instanceof Error && /not found/i.test(err.message)) {
        return res.status(404).json({ message: err.message });
      }
      throw err;
    }
  });

  app.post(api.lecturer.enrollments.confirmAdd.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const unitId = Number(req.params.unitId);
      const input = api.lecturer.enrollments.confirmAdd.input.parse(req.body);

      const student = await storage.getStudentByAdmissionNumber(input.admissionNumber);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const result = await storage.enrollStudentToUnit(
        userId,
        unitId,
        { admissionNumber: input.admissionNumber, fullName: student.fullName },
        "confirm"
      );
      if (result.kind === "needs_confirmation") {
        return res.status(400).json({ message: "Confirmation required" });
      }
      res.status(201).json(result.enrollment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid input",
          field: err.errors[0]?.path?.join("."),
        });
      }
      if (err instanceof Error && /not found/i.test(err.message)) {
        return res.status(404).json({ message: err.message });
      }
      throw err;
    }
  });

  // Lecturer: materials
  app.get(api.lecturer.materials.list.path, isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const unitId = Number(req.params.unitId);
    const rows = await storage.listLecturerMaterials(userId, unitId);
    res.json(rows);
  });

  app.post(api.lecturer.materials.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const unitId = Number(req.params.unitId);
      const input = api.lecturer.materials.create.input.parse(req.body);
      const row = await storage.createMaterial(userId, unitId, {
        ...input,
        deadlineAt: input.deadlineAt ? new Date(input.deadlineAt as any) : null,
      } as any);
      res.status(201).json(row);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid input",
          field: err.errors[0]?.path?.join("."),
        });
      }
      if (err instanceof Error && /not found/i.test(err.message)) {
        return res.status(404).json({ message: err.message });
      }
      throw err;
    }
  });

  app.put(api.lecturer.materials.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const id = Number(req.params.id);
      const updates = api.lecturer.materials.update.input.parse(req.body);
      const row = await storage.updateMaterial(userId, id, updates as any);
      if (!row) return res.status(404).json({ message: "Not found" });
      res.json(row);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid input",
          field: err.errors[0]?.path?.join("."),
        });
      }
      throw err;
    }
  });

  app.delete(api.lecturer.materials.delete.path, isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    const ok = await storage.deleteMaterial(userId, id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    res.status(204).end();
  });

  // Student: dashboard
  app.get(api.student.dashboard.get.path, isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const dash = await storage.getStudentDashboard(userId);
    if (!dash) return res.status(404).json({ message: "Student not found" });
    res.json(dash);
  });

  // Student: notifications
  app.get(api.student.notifications.list.path, isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const query = api.student.notifications.list.input?.parse(req.query);
    const rows = await storage.listStudentNotifications(userId, { unreadOnly: query?.unreadOnly });
    res.json(rows);
  });

  app.post(api.student.notifications.markRead.path, isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    const row = await storage.markNotificationRead(userId, id);
    if (!row) return res.status(404).json({ message: "Not found" });
    res.json(row);
  });

  // Student: materials for a unit
  app.get(api.student.materials.listForUnit.path, isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const unitId = Number(req.params.unitId);
    const rows = await storage.listStudentUnitMaterials(userId, unitId);
    res.json(rows);
  });

  // Student: change password (MVP flag only)
  app.post(api.student.password.change.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      api.student.password.change.input.parse(req.body);

      const student = await storage.getStudentByUserId(userId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      await storage.updateStudent(student.id, { mustChangePassword: false });
      res.json({ ok: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid input",
          field: err.errors[0]?.path?.join("."),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
