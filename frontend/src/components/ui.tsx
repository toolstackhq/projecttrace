import { ReactNode, useEffect } from "react";
import { cn } from "../lib/cn";

export function Button({
  children,
  className,
  variant = "primary",
  type = "button",
  disabled,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const styles: Record<string, string> = {
    primary: "bg-brand-700 text-white hover:bg-brand-800 shadow-sm",
    secondary: "bg-white text-ink-800 border border-ink-200 hover:bg-ink-50",
    ghost: "bg-transparent text-ink-700 hover:bg-ink-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        styles[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-ink-200 bg-white shadow-panel", className)}>{children}</div>;
}

export function SectionTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-b border-ink-200 pb-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm text-ink-500">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-ink-900">{value}</div>
      {hint ? <div className="mt-2 text-xs text-ink-500">{hint}</div> : null}
    </Card>
  );
}

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "blue" | "green" | "amber" | "red" | "purple" }) {
  const classes: Record<string, string> = {
    slate: "bg-ink-100 text-ink-700 ring-1 ring-inset ring-ink-200",
    blue: "bg-brand-50 text-brand-800 ring-1 ring-inset ring-brand-100",
    green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100",
    amber: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-100",
    red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
    purple: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", classes[tone])}>{children}</span>;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-ink-200 bg-white p-10 text-center">
      <div className="text-sm font-medium text-ink-900">{title}</div>
      <div className="mt-2 text-sm text-ink-500">{description}</div>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-ink-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-300 border-t-brand-600" />
      {label}
    </div>
  );
}

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl border border-ink-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
          <button className="text-sm text-ink-500 hover:text-ink-800" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

