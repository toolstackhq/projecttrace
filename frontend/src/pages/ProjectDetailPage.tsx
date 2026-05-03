import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { request, queryString } from "../api/client";
import { useResource } from "../hooks/useResource";
import type { ActivityLogRead, BugRead, EpicRead, FeatureRead, Page, ProjectRead, RequirementRead, TestCaseRead } from "../types/api";
import { DataTable } from "../components/DataTable";
import { PageFrame, Panel } from "../components/PageFrame";
import { StatusBadge } from "../components/StatusBadge";
import { Spinner } from "../components/ui";
import { CrudDialog } from "../components/CrudDialog";
import { useSession } from "../session";

function linkedTable<T extends { id: number }>(title: string, rows: T[], loading: boolean, emptyTitle: string, emptyDescription: string, renderColumns: any[]) {
  return (
    <Panel className="space-y-4">
      <h2 className="text-base font-semibold text-ink-900">{title}</h2>
      <DataTable rows={rows} loading={loading} emptyTitle={emptyTitle} emptyDescription={emptyDescription} columns={renderColumns} />
    </Panel>
  );
}

export function ProjectDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = Number(params.projectId);
  const [reload, setReload] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const { isAdmin } = useSession();

  const project = useResource(() => request<ProjectRead>(`/projects/${id}`), [id, reload]);
  const epics = useResource(() => request<Page<EpicRead>>(`/epics${queryString({ project_id: id, page_size: 10 })}`), [id]);
  const features = useResource(() => request<Page<FeatureRead>>(`/features${queryString({ project_id: id, page_size: 10 })}`), [id]);
  const requirements = useResource(() => request<Page<RequirementRead>>(`/requirements${queryString({ project_id: id, page_size: 10 })}`), [id]);
  const bugs = useResource(() => request<Page<BugRead>>(`/bugs${queryString({ project_id: id, page_size: 10 })}`), [id]);
  const activity = useResource(() => request<Page<ActivityLogRead>>(`/projects/${id}/activity${queryString({ page_size: 10 })}`), [id]);
  const testCases = useResource(() => request<Page<TestCaseRead>>(`/test-cases${queryString({ project_id: id, page_size: 10 })}`), [id]);

  if (project.loading || !project.data) {
    return <Spinner />;
  }

  return (
    <PageFrame
      title={project.data.name}
      description={project.data.description ?? "No project description provided."}
      action={
        <div className="flex items-center gap-3 text-sm text-ink-500">
          <div>Owner: {project.data.owner?.name ?? `#${project.data.owner_id}`}</div>
          <button
            className="rounded-md border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
            onClick={() => setEditOpen(true)}
          >
            Edit
          </button>
          {isAdmin ? (
            <button
              className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              onClick={async () => {
                if (!window.confirm("Delete this project?")) return;
                await request(`/projects/${id}`, { method: "DELETE" });
                navigate("/projects");
              }}
            >
              Delete
            </button>
          ) : null}
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel>
          <div className="text-xs uppercase tracking-wide text-ink-500">Owner</div>
          <div className="mt-2 text-lg font-semibold text-ink-900">{project.data.owner?.name ?? `#${project.data.owner_id}`}</div>
          <div className="text-sm text-ink-500">{project.data.owner?.email ?? "Unknown owner"}</div>
        </Panel>
        <Panel>
          <div className="text-xs uppercase tracking-wide text-ink-500">Created</div>
          <div className="mt-2 text-lg font-semibold text-ink-900">{new Date(project.data.created_at).toLocaleDateString()}</div>
        </Panel>
        <Panel>
          <div className="text-xs uppercase tracking-wide text-ink-500">Updated</div>
          <div className="mt-2 text-lg font-semibold text-ink-900">{new Date(project.data.updated_at).toLocaleDateString()}</div>
        </Panel>
        <Panel>
          <div className="text-xs uppercase tracking-wide text-ink-500">Traceability</div>
          <div className="mt-2 text-lg font-semibold text-ink-900">Project → Bug</div>
          <div className="text-sm text-ink-500">Epics, features, requirements, test cases, runs, and bugs all link here.</div>
        </Panel>
      </div>

      {linkedTable("Epics", epics.data?.items ?? [], epics.loading, "No epics linked", "Create epics for this project.", [
        { key: "title", label: "Title", render: (row: EpicRead) => <Link className="text-brand-700 hover:underline" to={`/epics/${row.id}`}>{row.title}</Link> },
        { key: "status", label: "Status", render: (row: EpicRead) => <StatusBadge value={row.status} /> },
      ])}

      {linkedTable("Features", features.data?.items ?? [], features.loading, "No features linked", "Create features for this project.", [
        { key: "title", label: "Title", render: (row: FeatureRead) => <Link className="text-brand-700 hover:underline" to={`/features/${row.id}`}>{row.title}</Link> },
        { key: "status", label: "Status", render: (row: FeatureRead) => <StatusBadge value={row.status} /> },
      ])}

      {linkedTable("Requirements", requirements.data?.items ?? [], requirements.loading, "No requirements linked", "Create requirements for this project.", [
        { key: "title", label: "Requirement", render: (row: RequirementRead) => <Link className="text-brand-700 hover:underline" to={`/requirements/${row.id}`}>{row.title}</Link> },
        { key: "status", label: "Status", render: (row: RequirementRead) => <StatusBadge value={row.status} /> },
        { key: "priority", label: "Priority", render: (row: RequirementRead) => <StatusBadge value={row.priority} /> },
      ])}

      {linkedTable("Test cases", testCases.data?.items ?? [], testCases.loading, "No test cases linked", "Create test cases for this project.", [
        { key: "title", label: "Test case", render: (row: TestCaseRead) => <Link className="text-brand-700 hover:underline" to={`/test-cases/${row.id}`}>{row.title}</Link> },
        { key: "priority", label: "Priority", render: (row: TestCaseRead) => <StatusBadge value={row.priority} /> },
      ])}

      {linkedTable("Bugs", bugs.data?.items ?? [], bugs.loading, "No bugs linked", "Bug tracking will surface here as soon as defects are logged.", [
        { key: "title", label: "Bug", render: (row: BugRead) => <Link className="text-brand-700 hover:underline" to={`/bugs/${row.id}`}>{row.title}</Link> },
        { key: "severity", label: "Severity", render: (row: BugRead) => <StatusBadge value={row.severity} /> },
        { key: "status", label: "Status", render: (row: BugRead) => <StatusBadge value={row.status} /> },
      ])}

      {linkedTable("Activity", activity.data?.items ?? [], activity.loading, "No activity yet", "Project events will be shown here.", [
        { key: "action", label: "Action", render: (row: ActivityLogRead) => row.action },
        { key: "entity", label: "Entity", render: (row: ActivityLogRead) => row.entity_type },
        { key: "time", label: "Timestamp", render: (row: ActivityLogRead) => new Date(row.timestamp).toLocaleString() },
      ])}

      <CrudDialog
        open={editOpen}
        title="Edit project"
        fields={[
          { name: "name", label: "Name", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "owner_id", label: "Owner ID", type: "number", required: true },
        ]}
        initialValues={{ name: project.data.name, description: project.data.description ?? "", owner_id: project.data.owner_id }}
        submitLabel="Save project"
        onClose={() => setEditOpen(false)}
        onSubmit={async (values) => {
          await request(`/projects/${id}`, {
            method: "PUT",
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
