import { ReactNode } from "react";
import { EmptyState, Spinner } from "./ui";
import { cn } from "../lib/cn";

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T>({
  rows,
  columns,
  loading,
  emptyTitle,
  emptyDescription,
  onRowClick,
}: {
  rows: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  onRowClick?: (row: T) => void;
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-ink-200 bg-white p-6">
        <Spinner />
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-panel">
      <table className="min-w-full divide-y divide-ink-200">
        <thead className="bg-ink-50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-500", column.className)}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.map((row, index) => (
            <tr
              key={index}
              className={cn(onRowClick ? "cursor-pointer hover:bg-ink-50" : "", "transition")}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <td key={column.key} className={cn("px-4 py-3 text-sm text-ink-700", column.className)}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

