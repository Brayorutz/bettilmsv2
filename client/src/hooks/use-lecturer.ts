import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type EnrollmentCreateInput, type MaterialInput, type UnitInput } from "@shared/routes";
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

// My courses
export function useLecturerMyCourses() {
  return useQuery({
    queryKey: [api.lecturer.myCourses.list.path],
    queryFn: async () => {
      const res = await fetch(api.lecturer.myCourses.list.path, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.lecturer.myCourses.list.responses[200], await res.json(), "lecturer.myCourses.list");
    },
  });
}

// Units
export function useLecturerUnits(courseId?: number) {
  return useQuery({
    queryKey: [api.lecturer.units.list.path, courseId ?? "all"],
    queryFn: async () => {
      const url = new URL(api.lecturer.units.list.path, window.location.origin);
      if (courseId) url.searchParams.set("courseId", String(courseId));
      const res = await fetch(url.toString().replace(window.location.origin, ""), { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.lecturer.units.list.responses[200], await res.json(), "lecturer.units.list");
    },
  });
}

export function useCreateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UnitInput) => {
      const validated = api.lecturer.units.create.input.parse(input);
      const res = await fetch(api.lecturer.units.create.path, {
        method: api.lecturer.units.create.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(validated),
      });
      if (res.status === 400) {
        const err = parseWithLogging(api.lecturer.units.create.responses[400], await res.json(), "unit.create.400");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.lecturer.units.create.responses[201], await res.json(), "unit.create.201");
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.lecturer.units.list.path] });
    },
  });
}

export function useUpdateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<UnitInput> }) => {
      const validated = api.lecturer.units.update.input.parse(updates);
      const url = buildUrl(api.lecturer.units.update.path, { id });
      const res = await fetch(url, {
        method: api.lecturer.units.update.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(validated),
      });
      if (res.status === 400) {
        const err = parseWithLogging(api.lecturer.units.update.responses[400], await res.json(), "unit.update.400");
        throw new Error(err.message);
      }
      if (res.status === 404) {
        const err = parseWithLogging(api.lecturer.units.update.responses[404], await res.json(), "unit.update.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.lecturer.units.update.responses[200], await res.json(), "unit.update.200");
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.lecturer.units.list.path] });
    },
  });
}

export function useDeleteUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.lecturer.units.delete.path, { id });
      const res = await fetch(url, { method: api.lecturer.units.delete.method, credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.lecturer.units.delete.responses[404], await res.json(), "unit.delete.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.lecturer.units.list.path] });
    },
  });
}

// Enrollments
export function useUnitEnrollments(unitId: number) {
  return useQuery({
    queryKey: [api.lecturer.enrollments.list.path, unitId],
    enabled: Number.isFinite(unitId),
    queryFn: async () => {
      const url = buildUrl(api.lecturer.enrollments.list.path, { unitId });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.lecturer.enrollments.list.responses[404], await res.json(), "enroll.list.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.lecturer.enrollments.list.responses[200], await res.json(), "enroll.list.200");
    },
  });
}

export function useCreateEnrollment(unitId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: EnrollmentCreateInput) => {
      const validated = api.lecturer.enrollments.create.input.parse(input);
      const url = buildUrl(api.lecturer.enrollments.create.path, { unitId });
      const res = await fetch(url, {
        method: api.lecturer.enrollments.create.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(validated),
      });

      if (res.status === 200) {
        return parseWithLogging(api.lecturer.enrollments.create.responses[200], await res.json(), "enroll.create.200");
      }
      if (res.status === 201) {
        return parseWithLogging(api.lecturer.enrollments.create.responses[201], await res.json(), "enroll.create.201");
      }
      if (res.status === 400) {
        const err = parseWithLogging(api.lecturer.enrollments.create.responses[400], await res.json(), "enroll.create.400");
        throw new Error(err.message);
      }
      if (res.status === 404) {
        const err = parseWithLogging(api.lecturer.enrollments.create.responses[404], await res.json(), "enroll.create.404");
        throw new Error(err.message);
      }
      throw new Error(`${res.status}: ${await readError(res)}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.lecturer.enrollments.list.path, unitId] });
      await qc.invalidateQueries({ queryKey: [api.lecturer.units.list.path] });
    },
  });
}

export function useConfirmAddEnrollment(unitId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (admissionNumber: string) => {
      const validated = api.lecturer.enrollments.confirmAdd.input.parse({ admissionNumber });
      const url = buildUrl(api.lecturer.enrollments.confirmAdd.path, { unitId });
      const res = await fetch(url, {
        method: api.lecturer.enrollments.confirmAdd.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(validated),
      });

      if (res.status === 201) {
        return parseWithLogging(api.lecturer.enrollments.confirmAdd.responses[201], await res.json(), "enroll.confirm.201");
      }
      if (res.status === 400) {
        const err = parseWithLogging(api.lecturer.enrollments.confirmAdd.responses[400], await res.json(), "enroll.confirm.400");
        throw new Error(err.message);
      }
      if (res.status === 404) {
        const err = parseWithLogging(api.lecturer.enrollments.confirmAdd.responses[404], await res.json(), "enroll.confirm.404");
        throw new Error(err.message);
      }
      throw new Error(`${res.status}: ${await readError(res)}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.lecturer.enrollments.list.path, unitId] });
      await qc.invalidateQueries({ queryKey: [api.lecturer.units.list.path] });
    },
  });
}

// Materials
export function useLecturerUnitMaterials(unitId: number) {
  return useQuery({
    queryKey: [api.lecturer.materials.list.path, unitId],
    enabled: Number.isFinite(unitId),
    queryFn: async () => {
      const url = buildUrl(api.lecturer.materials.list.path, { unitId });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.lecturer.materials.list.responses[404], await res.json(), "materials.list.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.lecturer.materials.list.responses[200], await res.json(), "materials.list.200");
    },
  });
}

export function useCreateMaterial(unitId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: MaterialInput) => {
      const validated = api.lecturer.materials.create.input.parse(input);
      const url = buildUrl(api.lecturer.materials.create.path, { unitId });
      const res = await fetch(url, {
        method: api.lecturer.materials.create.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...validated,
          // Dates are serialized; backend uses z.coerce.date()
          deadlineAt: validated.deadlineAt ? new Date(validated.deadlineAt).toISOString() : validated.deadlineAt,
        }),
      });

      if (res.status === 400) {
        const err = parseWithLogging(api.lecturer.materials.create.responses[400], await res.json(), "materials.create.400");
        throw new Error(err.message);
      }
      if (res.status === 404) {
        const err = parseWithLogging(api.lecturer.materials.create.responses[404], await res.json(), "materials.create.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.lecturer.materials.create.responses[201], await res.json(), "materials.create.201");
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.lecturer.materials.list.path, unitId] });
    },
  });
}

export function useUpdateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<MaterialInput> }) => {
      const validated = api.lecturer.materials.update.input.parse(updates);
      const url = buildUrl(api.lecturer.materials.update.path, { id });
      const res = await fetch(url, {
        method: api.lecturer.materials.update.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...validated,
          deadlineAt:
            validated.deadlineAt === null
              ? null
              : validated.deadlineAt
                ? new Date(validated.deadlineAt).toISOString()
                : undefined,
        }),
      });

      if (res.status === 400) {
        const err = parseWithLogging(api.lecturer.materials.update.responses[400], await res.json(), "materials.update.400");
        throw new Error(err.message);
      }
      if (res.status === 404) {
        const err = parseWithLogging(api.lecturer.materials.update.responses[404], await res.json(), "materials.update.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      const data = await res.json();
      return parseWithLogging(api.lecturer.materials.update.responses[200], data, "materials.update.200");
    },
    onSuccess: async (_data, vars) => {
      // We don't know unitId here; safest: invalidate all lecturer materials lists
      await qc.invalidateQueries({ queryKey: [api.lecturer.materials.list.path] });
      await qc.invalidateQueries({ queryKey: [api.lecturer.units.list.path] });
      await qc.invalidateQueries({ queryKey: [api.student.materials.listForUnit.path] });
      // also refetch specific material list pages that might be open
      await qc.invalidateQueries({ queryKey: [api.lecturer.materials.update.path, vars.id] });
    },
  });
}

export function useDeleteMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.lecturer.materials.delete.path, { id });
      const res = await fetch(url, { method: api.lecturer.materials.delete.method, credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.lecturer.materials.delete.responses[404], await res.json(), "materials.delete.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.lecturer.materials.list.path] });
      await qc.invalidateQueries({ queryKey: [api.student.materials.listForUnit.path] });
    },
  });
}
