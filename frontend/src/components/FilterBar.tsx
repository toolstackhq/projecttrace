import { ReactNode } from "react";
import { Button } from "./ui";
import { cn } from "../lib/cn";

export function FilterBar({
  children,
  onClear,
  className,
}: {
  children: ReactNode;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-ink-200 bg-white p-4 shadow-panel", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">{children}</div>
        {onClear ? (
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClear}>
              Clear filters
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

