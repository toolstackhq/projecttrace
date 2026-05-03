import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { request, queryString } from "../api/client";
import { useResource } from "../hooks/useResource";
import type { Page, ProjectRead, FeatureRead, RequirementRead } from "../types/api";
import { DataTable } from "../components/DataTable";
import { FilterBar } from "../components/FilterBar";
import { PageFrame, Panel } from "../components/PageFrame";
import { Pagination } from "../components/Pagination";
import { CrudDialog, FieldConfig } from "../components/CrudDialog";
import { Button } from "../components/ui";
import { StatusBadge } from "../components/StatusBadge";

export function RequirementsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [reload, setReload] = useState(0);

  const search = params.get("search") ?? "";
  const page = Number(params.get("page") ?? "1");
  const projectId = params.get("project_id") ?? "";
  const featureId = params.get("feature_id") ?? "";
  const status = params.get("status") ?? "";
  const priority = params.get("priority") ?? "";

  const projects = useResource(() => request<Page<ProjectRead>>(`/projects${queryString({ page_size: 100 })}`), []);
  const features = useResource(() => request<Page<FeatureRead>>(`/features${queryString({ page_size: 100 })}`), []);
  const requirements = useResource(
    () =>
      request<Page<RequirementRead>>(
        `/requirements${queryString({
          search,
          page,
          page_size: 20,
          project_id: projectId || undefined,
          feature_id: featureId || undefined,
          status: status || undefined,
          priority: priority || undefined,
          sort: "updated_at",
          order: "desc",
        })}`,
      ),
    [search, page, projectId, featureId, status, priority, reload],
  );

  const fieldOptions = useMemo(() => ({
    projects: (projects.data?.items ?? []).map((item) => ({ label: item.name, value: String(item.id) })),
    features: (features.data?.items ?? []).map((item) => ({ label: item.title, value: String(item.id) })),
  }), [projects.data, features.data]);

  const fields: FieldConfig[] = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "project_id", label: "Project", type: "select", required: true, options: fieldOptions.projects },
    { name: "feature_id", label: "Feature", type: "select", required: true, options: fieldOptions.features },
    {
      name: "priority",
      label: "Priority",
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
        { label: "Draft", value: "DRAFT" },
        { label: "Ready", value: "READY" },
        { label: "In progress", value: "IN_PROGRESS" },
        { label: "Verified", value: "VERIFIED" },
        { label: "Blocked", value: "BLOCKED" },
      ],
    },
  ];

  return (
    <PageFrame
      title="Requirements"
      description="Capture executable requirements and link them to test cases and defects."
      action={
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create requirement
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
            {fieldOptions.projects.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Feature</span>
          <select
            value={featureId}
            onChange={(event) => {
              const next = new URLSearchParams(params);
              next.set("feature_id", event.target.value);
              next.set("page", "1");
              setParams(next);
            }}
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            <option value="">All</option>
            {fieldOptions.features.map((option) => (
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
            <option value="DRAFT">Draft</option>
            <option value="READY">Ready</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="VERIFIED">Verified</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Priority</span>
          <select
            value={priority}
            onChange={(event) => {
              const next = new URLSearchParams(params);
              next.set("priority", event.target.value);
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
          rows={requirements.data?.items ?? []}
          loading={requirements.loading}
          emptyTitle="No requirements found"
          emptyDescription="Requirements appear here once planning work starts."
          onRowClick={(row) => navigate(`/requirements/${row.id}`)}
          columns={[
            {
              key: "title",
              label: "Requirement",
              render: (row) => (
                <div>
                  <Link to={`/requirements/${row.id}`} className="font-medium text-brand-700 hover:underline">
                    {row.title}
                  </Link>
                  <div className="text-xs text-ink-500">{row.feature?.title ?? `Feature #${row.feature_id}`}</div>
                </div>
              ),
            },
            { key: "priority", label: "Priority", render: (row) => <StatusBadge value={row.priority} /> },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
            { key: "created", label: "Created by", render: (row) => row.creator?.name ?? `#${row.created_by}` },
          ]}
        />
        <Pagination
          page={requirements.data?.page ?? 1}
          pages={requirements.data?.pages ?? 1}
          onChange={(nextPage) => {
            const next = new URLSearchParams(params);
            next.set("page", String(nextPage));
            setParams(next);
          }}
        />
      </Panel>

      <CrudDialog
        open={createOpen}
        title="Create requirement"
        fields={fields}
        submitLabel="Create requirement"
        onClose={() => setCreateOpen(false)}
        onSubmit={async (values) => {
          await request("/requirements", {
            method: "POST",
            body: JSON.stringify({
              title: values.title,
              description: values.description || null,
              project_id: Number(values.project_id),
              feature_id: Number(values.feature_id),
              priority: values.priority,
              status: values.status,
            }),
          });
          setReload((value) => value + 1);
        }}
      />
    </PageFrame>
  );
}
