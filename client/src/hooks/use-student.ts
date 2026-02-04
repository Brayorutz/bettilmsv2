import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
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

export function useStudentDashboard() {
  return useQuery({
    queryKey: [api.student.dashboard.get.path],
    queryFn: async () => {
      const res = await fetch(api.student.dashboard.get.path, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.student.dashboard.get.responses[200], await res.json(), "student.dashboard.get");
    },
  });
}

export function useStudentUnitMaterials(unitId: number) {
  return useQuery({
    queryKey: [api.student.materials.listForUnit.path, unitId],
    enabled: Number.isFinite(unitId),
    queryFn: async () => {
      const url = buildUrl(api.student.materials.listForUnit.path, { unitId });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.student.materials.listForUnit.responses[404], await res.json(), "student.materials.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.student.materials.listForUnit.responses[200], await res.json(), "student.materials.200");
    },
  });
}

export function useStudentNotifications(unreadOnly?: boolean) {
  return useQuery({
    queryKey: [api.student.notifications.list.path, unreadOnly ? "unread" : "all"],
    queryFn: async () => {
      const url = new URL(api.student.notifications.list.path, window.location.origin);
      if (typeof unreadOnly === "boolean") url.searchParams.set("unreadOnly", String(unreadOnly));
      const res = await fetch(url.toString().replace(window.location.origin, ""), { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.student.notifications.list.responses[200], await res.json(), "student.notifications.list");
    },
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.student.notifications.markRead.path, { id });
      const res = await fetch(url, { method: api.student.notifications.markRead.method, credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.student.notifications.markRead.responses[404], await res.json(), "notif.read.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.student.notifications.markRead.responses[200], await res.json(), "notif.read.200");
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.student.notifications.list.path] });
      await qc.invalidateQueries({ queryKey: [api.student.dashboard.get.path] });
    },
  });
}

export function useChangeStudentPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (newPassword: string) => {
      const validated = api.student.password.change.input.parse({ newPassword });
      const res = await fetch(api.student.password.change.path, {
        method: api.student.password.change.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(validated),
      });

      if (res.status === 400) {
        const err = parseWithLogging(api.student.password.change.responses[400], await res.json(), "student.password.400");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error(`${res.status}: ${await readError(res)}`);
      return parseWithLogging(api.student.password.change.responses[200], await res.json(), "student.password.200");
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.student.dashboard.get.path] });
    },
  });
}
