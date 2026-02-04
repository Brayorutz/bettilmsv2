import { ReactNode, useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type SortDir = "asc" | "desc";
export type Column<T> = {
  key: string;
  header: string;
  className?: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | null | undefined;
};

export default function DataTable<T>({
  rows,
  columns,
  searchPlaceholder = "Search…",
  searchKeys,
  right,
  testid,
  empty,
}: {
  rows: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKeys?: Array<(row: T) => string>;
  right?: ReactNode;
  testid: string;
  empty?: ReactNode;
}) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    if (!searchKeys?.length) return rows;
    return rows.filter((r) => searchKeys.some((fn) => (fn(r) || "").toLowerCase().includes(query)));
  }, [q, rows, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = col.sortValue?.(a);
      const bv = col.sortValue?.(b);
      const aa = av ?? "";
      const bb = bv ?? "";
      if (aa < bb) return sortDir === "asc" ? -1 : 1;
      if (aa > bb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortDir, columns]);

  return (
    <div className="glass shadow-premium rounded-3xl overflow-hidden" data-testid={testid}>
      <div className="flex flex-col gap-3 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-[340px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
              data-testid={`${testid}-search`}
              className={cn(
                "w-full rounded-2xl pl-9 bg-white/60 border-border/70",
                "focus-visible:ring-4 focus-visible:ring-ring/15"
              )}
              type="search"
            />
          </div>
          <Badge className="rounded-full bg-secondary/70 text-secondary-foreground border border-border/60" data-testid={`${testid}-count`}>
            {sorted.length} shown
          </Badge>
        </div>
        <div className="flex items-center gap-2 justify-between md:justify-end">{right}</div>
      </div>

      <div className="overflow-auto no-scrollbar">
        <table className="w-full">
          <thead className="bg-secondary/60">
            <tr>
              {columns.map((c) => {
                const active = sortKey === c.key;
                return (
                  <th
                    key={c.key}
                    className={cn(
                      "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground",
                      c.className
                    )}
                  >
                    <button
                      type="button"
                      data-testid={`${testid}-sort-${c.key}`}
                      onClick={() => {
                        if (!c.sortValue) return;
                        if (sortKey !== c.key) {
                          setSortKey(c.key);
                          setSortDir("asc");
                        } else {
                          setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                        }
                      }}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-lg transition-colors",
                        c.sortValue ? "hover:text-foreground" : "cursor-default"
                      )}
                    >
                      <span>{c.header}</span>
                      {c.sortValue ? (
                        active ? (
                          sortDir === "asc" ? (
                            <ArrowDownAZ className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpAZ className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <span className="h-3.5 w-3.5" />
                        )
                      ) : null}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8">
                  {empty ?? (
                    <div className="text-center text-sm text-muted-foreground">
                      No results.
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              sorted.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-white/40 transition-colors"
                  data-testid={`${testid}-row-${idx}`}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-4 py-3 text-sm", c.className)}>
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
