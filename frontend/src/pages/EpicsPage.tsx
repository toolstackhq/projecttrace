import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { request, queryString } from "../api/client";
import { useResource } from "../hooks/useResource";
import type { EpicRead, Page, ProjectRead, UserRead } from "../types/api";
import { DataTable } from "../components/DataTable";
import { FilterBar } from "../components/FilterBar";
import { PageFrame, Panel } from "../components/PageFrame";
import { Pagination } from "../components/Pagination";
import { CrudDialog, FieldConfig } from "../components/CrudDialog";
import { Button } from "../components/ui";
import { StatusBadge } from "../components/StatusBadge";

export function EpicsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [reload, setReload] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const search = params.get("search") ?? "";
  const page = Number(params.get("page") ?? "1");
  const projectId = params.get("project_id") ?? "";
  const status = params.get("status") ?? "";

  const projects = useResource(() => request<Page<ProjectRead>>(`/projects${queryString({ page_size: 100 })}`), []);
  const users = useResource(() => request<Page<UserRead>>(`/users${queryString({ page_size: 100 })}`), []);
  const epics = useResource(
    () =>
      request<Page<EpicRead>>(
        `/epics${queryString({ search, page, page_size: 20, project_id: projectId || undefined, status: status || undefined })}`,
      ),
    [search, page, projectId, status, reload],
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
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { label: "Planned", value: "PLANNED" },
        { label: "Active", value: "ACTIVE" },
        { label: "Done", value: "DONE" },
        { label: "Blocked", value: "BLOCKED" },
      ],
    },
    { name: "owner_id", label: "Owner", type: "select", required: true, options: options.users },
  ];

  return (
    <PageFrame
      title="Epics"
      description="Organize large program increments under each project."
      action={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />Create epic</Button>}
    >
      <FilterBar onClear={() => setParams({})}>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Search</span>
          <input value={search} onChange={(event) => { const next = new URLSearchParams(params); next.set("search", event.target.value); next.set("page", "1"); setParams(next); }} className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Project</span>
          <select value={projectId} onChange={(event) => { const next = new URLSearchParams(params); next.set("project_id", event.target.value); next.set("page", "1"); setParams(next); }} className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500">
            <option value="">All</option>
            {options.projects.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Status</span>
          <select value={status} onChange={(event) => { const next = new URLSearchParams(params); next.set("status", event.target.value); next.set("page", "1"); setParams(next); }} className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500">
            <option value="">All</option>
            <option value="PLANNED">Planned</option>
            <option value="ACTIVE">Active</option>
            <option value="DONE">Done</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </label>
      </FilterBar>

      <Panel className="space-y-4">
        <DataTable
          rows={epics.data?.items ?? []}
          loading={epics.loading}
          emptyTitle="No epics found"
          emptyDescription="Create an epic to start organizing work."
          onRowClick={(row) => navigate(`/epics/${row.id}`)}
          columns={[
            { key: "title", label: "Epic", render: (row) => <Link to={`/epics/${row.id}`} className="font-medium text-brand-700 hover:underline">{row.title}</Link> },
            { key: "project", label: "Project", render: (row) => row.project?.name ?? `#${row.project_id}` },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
        />
        <Pagination page={epics.data?.page ?? 1} pages={epics.data?.pages ?? 1} onChange={(nextPage) => { const next = new URLSearchParams(params); next.set("page", String(nextPage)); setParams(next); }} />
      </Panel>

      <CrudDialog
        open={createOpen}
        title="Create epic"
        fields={fields}
        submitLabel="Create epic"
        onClose={() => setCreateOpen(false)}
        onSubmit={async (values) => {
          await request("/epics", { method: "POST", body: JSON.stringify({ title: values.title, description: values.description || null, project_id: Number(values.project_id), status: values.status, owner_id: Number(values.owner_id) }) });
          setReload((count) => count + 1);
        }}
      />
    </PageFrame>
  );
}

