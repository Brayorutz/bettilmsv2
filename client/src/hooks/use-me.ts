import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useMe() {
  return useQuery({
    queryKey: [api.me.get.path],
    queryFn: async () => {
      const res = await fetch(api.me.get.path, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return parseWithLogging(api.me.get.responses[200], await res.json(), "me.get");
    },
  });
}
