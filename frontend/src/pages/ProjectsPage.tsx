import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { request, queryString } from "../api/client";
import { useResource } from "../hooks/useResource";
import type { Page, ProjectRead, UserRead } from "../types/api";
import { DataTable } from "../components/DataTable";
import { FilterBar } from "../components/FilterBar";
import { PageFrame, Panel } from "../components/PageFrame";
import { Pagination } from "../components/Pagination";
import { CrudDialog, FieldConfig } from "../components/CrudDialog";
import { Button } from "../components/ui";

export function ProjectsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [reload, setReload] = useState(0);
  const search = params.get("search") ?? "";
  const page = Number(params.get("page") ?? "1");

  const users = useResource(() => request<Page<UserRead>>(`/users${queryString({ page_size: 100 })}`), []);
  const projects = useResource(
    () => request<Page<ProjectRead>>(`/projects${queryString({ search, page, page_size: 20, sort: "updated_at", order: "desc" })}`),
    [search, page, reload],
  );

  const ownerOptions = useMemo(
    () => (users.data?.items ?? []).map((user) => ({ label: user.name, value: String(user.id) })),
    [users.data],
  );

  const fields: FieldConfig[] = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "owner_id", label: "Owner", type: "select", required: true, options: ownerOptions },
  ];

  return (
    <PageFrame
      title="Projects"
      description="Track delivery streams, program ownership, and the work flowing through epics, requirements, tests, and bugs."
      action={
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create project
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
            placeholder="Search projects"
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </label>
      </FilterBar>

      <Panel className="space-y-4">
        <DataTable
          rows={projects.data?.items ?? []}
          loading={projects.loading}
          emptyTitle="No projects found"
          emptyDescription="Create the first project to start the traceability chain."
          onRowClick={(row) => navigate(`/projects/${row.id}`)}
          columns={[
            {
              key: "name",
              label: "Project",
              render: (row) => (
                <div>
                  <Link to={`/projects/${row.id}`} className="font-medium text-brand-700 hover:underline">
                    {row.name}
                  </Link>
                  <div className="text-xs text-ink-500">{row.description ?? "No description"}</div>
                </div>
              ),
            },
            { key: "owner", label: "Owner", render: (row) => row.owner?.name ?? `#${row.owner_id}` },
            { key: "created", label: "Created", render: (row) => new Date(row.created_at).toLocaleDateString() },
            {
              key: "updated",
              label: "Updated",
              render: (row) => new Date(row.updated_at).toLocaleDateString(),
            },
          ]}
        />
        <Pagination
          page={projects.data?.page ?? 1}
          pages={projects.data?.pages ?? 1}
          onChange={(nextPage) => {
            const next = new URLSearchParams(params);
            next.set("page", String(nextPage));
            setParams(next);
          }}
        />
      </Panel>

      <CrudDialog
        open={createOpen}
        title="Create project"
        fields={fields}
        submitLabel="Create project"
        note={
          ownerOptions.length === 0 ? (
            <span>
              No users exist yet.{" "}
              <Link to="/users" className="font-medium underline underline-offset-2">
                Create a user
              </Link>{" "}
              first so you can assign a project owner.
            </span>
          ) : undefined
        }
        onClose={() => setCreateOpen(false)}
        onSubmit={async (values) => {
          await request("/projects", {
            method: "POST",
            body: JSON.stringify({
              name: values.name,
              description: values.description || null,
              owner_id: Number(values.owner_id),
            }),
          });
          setReload((count) => count + 1);
        }}
      />
    </PageFrame>
  );
}
