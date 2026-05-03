import { ReactNode, useMemo } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Activity, Bug, CheckSquare, FolderKanban, Gauge, ListChecks, LogOut, Search, SquareTerminal, Users } from "lucide-react";
import { useSession } from "../session";
import { cn } from "../lib/cn";
import { Badge, Button } from "./ui";

const navGroups = [
  {
    title: "Planning",
    items: [
      { label: "Projects", to: "/projects", icon: FolderKanban },
      { label: "Epics", to: "/epics", icon: ListChecks },
      { label: "Features", to: "/features", icon: SquareTerminal },
      { label: "Requirements", to: "/requirements", icon: CheckSquare },
    ],
  },
  {
    title: "Testing",
    items: [
      { label: "Test Cases", to: "/test-cases", icon: CheckSquare },
      { label: "Test Runs", to: "/test-runs", icon: Gauge },
    ],
  },
  {
    title: "Defects",
    items: [{ label: "Bugs", to: "/bugs", icon: Bug }],
  },
  {
    title: "System",
    items: [
      { label: "Activity Logs", to: "/activity", icon: Activity },
      { label: "Users", to: "/users", icon: Users },
    ],
  },
];

export function AppShell({
  children,
  search,
  onSearchChange,
  onSearchSubmit,
}: {
  children: ReactNode;
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
}) {
  const location = useLocation();
  const current = useMemo(() => location.pathname, [location.pathname]);
  const { currentUser, isAdmin, logout } = useSession();

  return (
    <div className="flex min-h-full">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-ink-200 bg-white/90 backdrop-blur md:flex md:flex-col">
        <div className="flex items-center gap-3 border-b border-ink-200 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white">
            <FolderKanban className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-ink-900">ProjectTrace</div>
            <div className="text-xs text-ink-500">QA tracking workspace</div>
          </div>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {navGroups.map((group) => (
            <section key={group.title}>
              <div className="px-3 text-xs font-semibold uppercase tracking-wide text-ink-400">{group.title}</div>
              <div className="mt-2 space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = current === item.to;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                        active ? "bg-brand-50 text-brand-800" : "text-ink-700 hover:bg-ink-100 hover:text-ink-900",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/90 backdrop-blur">
          <div className="flex items-center gap-4 px-4 py-3 md:px-6">
            <Link to="/dashboard" className="flex items-center gap-2 md:hidden">
              <FolderKanban className="h-5 w-5 text-brand-700" />
              <span className="text-sm font-semibold">ProjectTrace</span>
            </Link>
            <div className="ml-auto flex w-full max-w-2xl items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 shadow-sm md:ml-0">
              <Search className="h-4 w-4 text-ink-400" />
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onSearchSubmit();
                }}
                placeholder="Search projects, requirements, bugs, test cases"
                className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-ink-400"
              />
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Signed in</span>
                <div className="text-sm font-medium text-ink-900">{currentUser?.name}</div>
              </div>
              <Badge tone={isAdmin ? "green" : "slate"}>{currentUser?.role}</Badge>
              <Button variant="secondary" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
