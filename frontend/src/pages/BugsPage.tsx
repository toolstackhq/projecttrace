import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { request, queryString } from "../api/client";
import { useResource } from "../hooks/useResource";
import type { BugRead, Page, ProjectRead, UserRead } from "../types/api";
import { DataTable } from "../components/DataTable";
import { FilterBar } from "../components/FilterBar";
import { PageFrame, Panel } from "../components/PageFrame";
import { Pagination } from "../components/Pagination";
import { CrudDialog, FieldConfig } from "../components/CrudDialog";
import { Button } from "../components/ui";
import { StatusBadge } from "../components/StatusBadge";

export function BugsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [reload, setReload] = useState(0);

  const search = params.get("search") ?? "";
  const page = Number(params.get("page") ?? "1");
  const projectId = params.get("project_id") ?? "";
  const status = params.get("status") ?? "";
  const severity = params.get("severity") ?? "";
  const assigneeId = params.get("assignee_id") ?? "";

  const projects = useResource(() => request<Page<ProjectRead>>(`/projects${queryString({ page_size: 100 })}`), []);
  const users = useResource(() => request<Page<UserRead>>(`/users${queryString({ page_size: 100 })}`), []);
  const bugs = useResource(
    () =>
      request<Page<BugRead>>(
        `/bugs${queryString({
          search,
          page,
          page_size: 20,
          project_id: projectId || undefined,
          status: status || undefined,
          severity: severity || undefined,
          assignee_id: assigneeId || undefined,
          sort: "updated_at",
          order: "desc",
        })}`,
      ),
    [search, page, projectId, status, severity, assigneeId, reload],
  );

  const options = useMemo(
    () => ({
      projects: (projects.data?.items ?? []).map((item) => ({ label: item.name, value: String(item.id) })),
      users: (users.data?.items ?? []).map((item) => ({ label: item.name, value: String(item.id) })),
    }),
    [projects.data, users.data],
  );

  const fields: FieldConfig[] = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "project_id", label: "Project", type: "select", required: true, options: options.projects },
    {
      name: "severity",
      label: "Severity",
      type: "select",
      required: true,
      options: [
        { label: "Low", value: "LOW" },
        { label: "Medium", value: "MEDIUM" },
        { label: "High", value: "HIGH" },
        { label: "Critical", value: "CRITICAL" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { label: "Open", value: "OPEN" },
        { label: "In progress", value: "IN_PROGRESS" },
        { label: "Resolved", value: "RESOLVED" },
        { label: "Closed", value: "CLOSED" },
      ],
    },
    { name: "assignee_id", label: "Assignee", type: "select", options: options.users },
  ];

  return (
    <PageFrame
      title="Bugs"
      description="Track defects, severity, and ownership across projects."
      action={
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create bug
        </Button>
      }
    >
      <FilterBar onClear={() => setParams({})}>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Search</span>
          <input
            value={search}
            onChange={(event) => {
              const next = new URLSearchParams(params);
              next.set("search", event.target.value);
              next.set("page", "1");
              setParams(next);
            }}
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Project</span>
          <select
            value={projectId}
            onChange={(event) => {
              const next = new URLSearchParams(params);
              next.set("project_id", event.target.value);
              next.set("page", "1");
              setParams(next);
            }}
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            <option value="">All</option>
            {options.projects.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Status</span>
          <select
            value={status}
            onChange={(event) => {
              const next = new URLSearchParams(params);
              next.set("status", event.target.value);
              next.set("page", "1");
              setParams(next);
            }}
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            <option value="">All</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Severity</span>
          <select
            value={severity}
            onChange={(event) => {
              const next = new URLSearchParams(params);
              next.set("severity", event.target.value);
              next.set("page", "1");
              setParams(next);
            }}
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            <option value="">All</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </label>
      </FilterBar>

      <Panel className="space-y-4">
        <DataTable
          rows={bugs.data?.items ?? []}
          loading={bugs.loading}
          emptyTitle="No bugs found"
          emptyDescription="Bugs will appear here once defects are reported."
          onRowClick={(row) => navigate(`/bugs/${row.id}`)}
          columns={[
            {
              key: "title",
              label: "Bug",
              render: (row) => (
                <div>
                  <Link to={`/bugs/${row.id}`} className="font-medium text-brand-700 hover:underline">
                    {row.title}
                  </Link>
                  <div className="text-xs text-ink-500">{row.project?.name ?? `Project #${row.project_id}`}</div>
                </div>
              ),
            },
            { key: "severity", label: "Severity", render: (row) => <StatusBadge value={row.severity} /> },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
            { key: "assignee", label: "Assignee", render: (row) => row.assignee?.name ?? "Unassigned" },
          ]}
        />
        <Pagination
          page={bugs.data?.page ?? 1}
          pages={bugs.data?.pages ?? 1}
          onChange={(nextPage) => {
            const next = new URLSearchParams(params);
            next.set("page", String(nextPage));
            setParams(next);
          }}
        />
      </Panel>

      <CrudDialog
        open={createOpen}
        title="Create bug"
        fields={fields}
        submitLabel="Create bug"
        onClose={() => setCreateOpen(false)}
        onSubmit={async (values) => {
          await request("/bugs", {
            method: "POST",
            body: JSON.stringify({
              title: values.title,
              description: values.description || null,
              project_id: Number(values.project_id),
              severity: values.severity,
              status: values.status,
              assignee_id: values.assignee_id ? Number(values.assignee_id) : null,
            }),
          });
          setReload((value) => value + 1);
        }}
      />
    </PageFrame>
  );
}
