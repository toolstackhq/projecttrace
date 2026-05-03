import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { request, queryString } from "../api/client";
import { useResource } from "../hooks/useResource";
import type { EpicRead, FeatureRead, Page, ProjectRead, UserRead } from "../types/api";
import { DataTable } from "../components/DataTable";
import { FilterBar } from "../components/FilterBar";
import { PageFrame, Panel } from "../components/PageFrame";
import { Pagination } from "../components/Pagination";
import { CrudDialog, FieldConfig } from "../components/CrudDialog";
import { Button } from "../components/ui";
import { StatusBadge } from "../components/StatusBadge";

export function FeaturesPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [reload, setReload] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const search = params.get("search") ?? "";
  const page = Number(params.get("page") ?? "1");
  const projectId = params.get("project_id") ?? "";
  const epicId = params.get("epic_id") ?? "";
  const status = params.get("status") ?? "";

  const projects = useResource(() => request<Page<ProjectRead>>(`/projects${queryString({ page_size: 100 })}`), []);
  const epics = useResource(() => request<Page<EpicRead>>(`/epics${queryString({ page_size: 100 })}`), []);
  const users = useResource(() => request<Page<UserRead>>(`/users${queryString({ page_size: 100 })}`), []);
  const features = useResource(
    () => request<Page<FeatureRead>>(`/features${queryString({ search, page, page_size: 20, project_id: projectId || undefined, epic_id: epicId || undefined, status: status || undefined })}`),
    [search, page, projectId, epicId, status, reload],
  );

  const options = useMemo(() => ({
    projects: (projects.data?.items ?? []).map((item) => ({ label: item.name, value: String(item.id) })),
    epics: (epics.data?.items ?? []).map((item) => ({ label: item.title, value: String(item.id) })),
    users: (users.data?.items ?? []).map((item) => ({ label: item.name, value: String(item.id) })),
  }), [projects.data, epics.data, users.data]);

  const fields: FieldConfig[] = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "epic_id", label: "Epic", type: "select", required: true, options: options.epics },
    { name: "project_id", label: "Project", type: "select", required: true, options: options.projects },
    { name: "status", label: "Status", type: "select", required: true, options: [{ label: "Planned", value: "PLANNED" }, { label: "In progress", value: "IN_PROGRESS" }, { label: "Done", value: "DONE" }, { label: "Blocked", value: "BLOCKED" }] },
    { name: "owner_id", label: "Owner", type: "select", required: true, options: options.users },
  ];

  return (
    <PageFrame title="Features" description="Track product slices nested under epics." action={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />Create feature</Button>}>
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
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Epic</span>
          <select value={epicId} onChange={(event) => { const next = new URLSearchParams(params); next.set("epic_id", event.target.value); next.set("page", "1"); setParams(next); }} className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500">
            <option value="">All</option>
            {options.epics.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Status</span>
          <select value={status} onChange={(event) => { const next = new URLSearchParams(params); next.set("status", event.target.value); next.set("page", "1"); setParams(next); }} className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500">
            <option value="">All</option>
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="DONE">Done</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </label>
      </FilterBar>

      <Panel className="space-y-4">
        <DataTable rows={features.data?.items ?? []} loading={features.loading} emptyTitle="No features found" emptyDescription="Create a feature to slice work within an epic." onRowClick={(row) => navigate(`/features/${row.id}`)} columns={[
          { key: "title", label: "Feature", render: (row) => <Link to={`/features/${row.id}`} className="font-medium text-brand-700 hover:underline">{row.title}</Link> },
          { key: "epic", label: "Epic", render: (row) => row.epic?.title ?? `#${row.epic_id}` },
          { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]} />
        <Pagination page={features.data?.page ?? 1} pages={features.data?.pages ?? 1} onChange={(nextPage) => { const next = new URLSearchParams(params); next.set("page", String(nextPage)); setParams(next); }} />
      </Panel>

      <CrudDialog
        open={createOpen}
        title="Create feature"
        fields={fields}
        submitLabel="Create feature"
        onClose={() => setCreateOpen(false)}
        onSubmit={async (values) => {
          await request("/features", { method: "POST", body: JSON.stringify({ title: values.title, description: values.description || null, epic_id: Number(values.epic_id), project_id: Number(values.project_id), status: values.status, owner_id: Number(values.owner_id) }) });
          setReload((count) => count + 1);
        }}
      />
    </PageFrame>
  );
}

