import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CourseInput, type DepartmentInput, type LecturerInput } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

async function readError(res: Response) {
  const text = await res.text().catch(() => "");
  return text || res.statusText;
}

// ============ Departments ============
export function useAdminDepartments() {
  return useQuery({
    queryKey: [api.admin.departments.list.path],
    queryFn: async () => {
      const res = await fetch(api.admin.departments.list.path, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(
        api.admin.departments.list.responses[200],
        await res.json(),
        "admin.departments.list"
      );
    },
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: DepartmentInput) => {
      const validated = api.admin.departments.create.input.parse(input);
      const res = await fetch(api.admin.departments.create.path, {
        method: api.admin.departments.create.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(validated),
      });

      if (res.status === 400) {
        const err = parseWithLogging(api.admin.departments.create.responses[400], await res.json(), "dept.create.400");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.admin.departments.create.responses[201], await res.json(), "dept.create.201");
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.admin.departments.list.path] });
      await qc.invalidateQueries({ queryKey: [api.admin.courses.list.path] });
      await qc.invalidateQueries({ queryKey: [api.lecturer.myCourses.list.path] });
    },
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<DepartmentInput> }) => {
      const validated = api.admin.departments.update.input.parse(updates);
      const url = buildUrl(api.admin.departments.update.path, { id });
      const res = await fetch(url, {
        method: api.admin.departments.update.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(validated),
      });

      if (res.status === 400) {
        const err = parseWithLogging(api.admin.departments.update.responses[400], await res.json(), "dept.update.400");
        throw new Error(err.message);
      }
      if (res.status === 404) {
        const err = parseWithLogging(api.admin.departments.update.responses[404], await res.json(), "dept.update.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.admin.departments.update.responses[200], await res.json(), "dept.update.200");
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.admin.departments.list.path] });
      await qc.invalidateQueries({ queryKey: [api.admin.courses.list.path] });
    },
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.admin.departments.delete.path, { id });
      const res = await fetch(url, {
        method: api.admin.departments.delete.method,
        credentials: "include",
      });
      if (res.status === 404) {
        const err = parseWithLogging(api.admin.departments.delete.responses[404], await res.json(), "dept.delete.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.admin.departments.list.path] });
      await qc.invalidateQueries({ queryKey: [api.admin.courses.list.path] });
    },
  });
}

// ============ Courses ============
export function useAdminCourses() {
  return useQuery({
    queryKey: [api.admin.courses.list.path],
    queryFn: async () => {
      const res = await fetch(api.admin.courses.list.path, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.admin.courses.list.responses[200], await res.json(), "admin.courses.list");
    },
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CourseInput) => {
      const validated = api.admin.courses.create.input.parse(input);
      const res = await fetch(api.admin.courses.create.path, {
        method: api.admin.courses.create.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(validated),
      });
      if (res.status === 400) {
        const err = parseWithLogging(api.admin.courses.create.responses[400], await res.json(), "course.create.400");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.admin.courses.create.responses[201], await res.json(), "course.create.201");
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.admin.courses.list.path] });
      await qc.invalidateQueries({ queryKey: [api.lecturer.myCourses.list.path] });
      await qc.invalidateQueries({ queryKey: [api.lecturer.units.list.path] });
    },
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<CourseInput> }) => {
      const validated = api.admin.courses.update.input.parse(updates);
      const url = buildUrl(api.admin.courses.update.path, { id });
      const res = await fetch(url, {
        method: api.admin.courses.update.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(validated),
      });
      if (res.status === 400) {
        const err = parseWithLogging(api.admin.courses.update.responses[400], await res.json(), "course.update.400");
        throw new Error(err.message);
      }
      if (res.status === 404) {
        const err = parseWithLogging(api.admin.courses.update.responses[404], await res.json(), "course.update.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.admin.courses.update.responses[200], await res.json(), "course.update.200");
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.admin.courses.list.path] });
      await qc.invalidateQueries({ queryKey: [api.lecturer.myCourses.list.path] });
    },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.admin.courses.delete.path, { id });
      const res = await fetch(url, {
        method: api.admin.courses.delete.method,
        credentials: "include",
      });
      if (res.status === 404) {
        const err = parseWithLogging(api.admin.courses.delete.responses[404], await res.json(), "course.delete.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.admin.courses.list.path] });
      await qc.invalidateQueries({ queryKey: [api.lecturer.myCourses.list.path] });
    },
  });
}

// ============ Lecturers ============
export function useAdminLecturers() {
  return useQuery({
    queryKey: [api.admin.lecturers.list.path],
    queryFn: async () => {
      const res = await fetch(api.admin.lecturers.list.path, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.admin.lecturers.list.responses[200], await res.json(), "admin.lecturers.list");
    },
  });
}

export function useCreateLecturer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: LecturerInput) => {
      const validated = api.admin.lecturers.create.input.parse(input);
      const res = await fetch(api.admin.lecturers.create.path, {
        method: api.admin.lecturers.create.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(validated),
      });
      if (res.status === 400) {
        const err = parseWithLogging(api.admin.lecturers.create.responses[400], await res.json(), "lect.create.400");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.admin.lecturers.create.responses[201], await res.json(), "lect.create.201");
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.admin.lecturers.list.path] });
      await qc.invalidateQueries({ queryKey: [api.lecturer.myCourses.list.path] });
      await qc.invalidateQueries({ queryKey: [api.lecturer.units.list.path] });
    },
  });
}

export function useUpdateLecturer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<LecturerInput> }) => {
      const validated = api.admin.lecturers.update.input.parse(updates);
      const url = buildUrl(api.admin.lecturers.update.path, { id });
      const res = await fetch(url, {
        method: api.admin.lecturers.update.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(validated),
      });
      if (res.status === 400) {
        const err = parseWithLogging(api.admin.lecturers.update.responses[400], await res.json(), "lect.update.400");
        throw new Error(err.message);
      }
      if (res.status === 404) {
        const err = parseWithLogging(api.admin.lecturers.update.responses[404], await res.json(), "lect.update.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.admin.lecturers.update.responses[200], await res.json(), "lect.update.200");
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.admin.lecturers.list.path] });
    },
  });
}

export function useDeleteLecturer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.admin.lecturers.delete.path, { id });
      const res = await fetch(url, {
        method: api.admin.lecturers.delete.method,
        credentials: "include",
      });
      if (res.status === 404) {
        const err = parseWithLogging(api.admin.lecturers.delete.responses[404], await res.json(), "lect.delete.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.admin.lecturers.list.path] });
    },
  });
}

// ============ Students list ============
export function useAdminStudents() {
  return useQuery({
    queryKey: [api.admin.students.list.path],
    queryFn: async () => {
      const res = await fetch(api.admin.students.list.path, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.admin.students.list.responses[200], await res.json(), "admin.students.list");
    },
  });
}
