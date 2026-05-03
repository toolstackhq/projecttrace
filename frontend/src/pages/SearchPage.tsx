import { Link, useSearchParams } from "react-router-dom";
import { request, queryString } from "../api/client";
import { useResource } from "../hooks/useResource";
import type { BugRead, Page, ProjectRead, RequirementRead, TestCaseRead } from "../types/api";
import { DataTable } from "../components/DataTable";
import { PageFrame, Panel } from "../components/PageFrame";
import { StatusBadge } from "../components/StatusBadge";

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";

  const projects = useResource(
    () => request<Page<ProjectRead>>(`/projects${queryString({ search: q, page_size: 5 })}`),
    [q],
  );
  const requirements = useResource(
    () => request<Page<RequirementRead>>(`/requirements${queryString({ search: q, page_size: 5 })}`),
    [q],
  );
  const bugs = useResource(() => request<Page<BugRead>>(`/bugs${queryString({ search: q, page_size: 5 })}`), [q]);
  const testCases = useResource(
    () => request<Page<TestCaseRead>>(`/test-cases${queryString({ search: q, page_size: 5 })}`),
    [q],
  );

  return (
    <PageFrame
      title={`Search results${q ? ` for “${q}”` : ""}`}
      description="Cross-resource search across projects, requirements, test cases, and bugs."
    >
      {!q ? (
        <Panel>Type a query in the global search bar to search across the workspace.</Panel>
      ) : (
        <div className="space-y-6">
          <Panel className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-900">Projects</h2>
              <Link className="text-sm font-medium text-brand-700" to={`/projects?search=${encodeURIComponent(q)}`}>
                View all
              </Link>
            </div>
            <DataTable
              rows={projects.data?.items ?? []}
              loading={projects.loading}
              emptyTitle="No matching projects"
              emptyDescription="Try a different search term."
              columns={[
                {
                  key: "name",
                  label: "Project",
                  render: (row) => (
                    <Link to={`/projects/${row.id}`} className="font-medium text-brand-700 hover:underline">
                      {row.name}
                    </Link>
                  ),
                },
                { key: "owner", label: "Owner", render: (row) => row.owner?.name ?? `#${row.owner_id}` },
              ]}
            />
          </Panel>

          <Panel className="space-y-3">
            <h2 className="text-base font-semibold text-ink-900">Requirements</h2>
            <DataTable
              rows={requirements.data?.items ?? []}
              loading={requirements.loading}
              emptyTitle="No matching requirements"
              emptyDescription="Try a different search term."
              columns={[
                {
                  key: "title",
                  label: "Requirement",
                  render: (row) => (
                    <Link to={`/requirements/${row.id}`} className="font-medium text-brand-700 hover:underline">
                      {row.title}
                    </Link>
                  ),
                },
                { key: "priority", label: "Priority", render: (row) => <StatusBadge value={row.priority} /> },
                { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
              ]}
            />
          </Panel>

          <Panel className="space-y-3">
            <h2 className="text-base font-semibold text-ink-900">Bugs</h2>
            <DataTable
              rows={bugs.data?.items ?? []}
              loading={bugs.loading}
              emptyTitle="No matching bugs"
              emptyDescription="Try a different search term."
              columns={[
                {
                  key: "title",
                  label: "Bug",
                  render: (row) => (
                    <Link to={`/bugs/${row.id}`} className="font-medium text-brand-700 hover:underline">
                      {row.title}
                    </Link>
                  ),
                },
                { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
                { key: "severity", label: "Severity", render: (row) => <StatusBadge value={row.severity} /> },
              ]}
            />
          </Panel>

          <Panel className="space-y-3">
            <h2 className="text-base font-semibold text-ink-900">Test cases</h2>
            <DataTable
              rows={testCases.data?.items ?? []}
              loading={testCases.loading}
              emptyTitle="No matching test cases"
              emptyDescription="Try a different search term."
              columns={[
                {
                  key: "title",
                  label: "Test case",
                  render: (row) => (
                    <Link to={`/test-cases/${row.id}`} className="font-medium text-brand-700 hover:underline">
                      {row.title}
                    </Link>
                  ),
                },
                { key: "priority", label: "Priority", render: (row) => <StatusBadge value={row.priority} /> },
              ]}
            />
          </Panel>
        </div>
      )}
    </PageFrame>
  );
}
