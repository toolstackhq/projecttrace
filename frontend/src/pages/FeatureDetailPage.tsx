import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { request, queryString } from "../api/client";
import { useResource } from "../hooks/useResource";
import type { FeatureDetail, RequirementRead, Page } from "../types/api";
import { DataTable } from "../components/DataTable";
import { PageFrame, Panel } from "../components/PageFrame";
import { StatusBadge } from "../components/StatusBadge";
import { CrudDialog } from "../components/CrudDialog";
import { Button, Spinner } from "../components/ui";
import { useSession } from "../session";

export function FeatureDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = Number(params.featureId);
  const [reload, setReload] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const { isAdmin } = useSession();
  const feature = useResource(() => request<FeatureDetail>(`/features/${id}`), [id, reload]);
  const requirements = useResource(() => request<Page<RequirementRead>>(`/requirements${queryString({ feature_id: id, page_size: 100 })}`), [id, reload]);

  if (feature.loading || !feature.data) return <Spinner />;

  return (
    <PageFrame
      title={feature.data.title}
      description={feature.data.description ?? "No feature description provided."}
      action={
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setEditOpen(true)}>Edit feature</Button>
          {isAdmin ? (
            <Button
              variant="danger"
              onClick={async () => {
                if (!window.confirm("Delete this feature?")) return;
                await request(`/features/${id}`, { method: "DELETE" });
                navigate("/features");
              }}
            >
              Delete
            </Button>
          ) : null}
        </div>
      }
    >
      <Panel className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div><div className="text-xs uppercase tracking-wide text-ink-500">Project</div><div className="mt-2 text-sm font-medium text-ink-900">{feature.data.project?.name ?? `#${feature.data.project_id}`}</div></div>
          <div><div className="text-xs uppercase tracking-wide text-ink-500">Epic</div><div className="mt-2 text-sm font-medium text-ink-900">{feature.data.epic?.title ?? `#${feature.data.epic_id}`}</div></div>
          <div><div className="text-xs uppercase tracking-wide text-ink-500">Status</div><div className="mt-2"><StatusBadge value={feature.data.status} /></div></div>
        </div>
      </Panel>
      <Panel className="space-y-4">
        <h2 className="text-base font-semibold text-ink-900">Requirements</h2>
        <DataTable rows={feature.data.requirements ?? requirements.data?.items ?? []} loading={requirements.loading} emptyTitle="No requirements linked" emptyDescription="Create requirements beneath this feature." columns={[
          { key: "title", label: "Requirement", render: (row: RequirementRead) => <Link className="text-brand-700 hover:underline" to={`/requirements/${row.id}`}>{row.title}</Link> },
          { key: "status", label: "Status", render: (row: RequirementRead) => <StatusBadge value={row.status} /> },
        ]} />
      </Panel>

      <CrudDialog
        open={editOpen}
        title="Edit feature"
        fields={[
          { name: "title", label: "Title", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "status", label: "Status", type: "select", required: true, options: [{ label: "Planned", value: "PLANNED" }, { label: "In progress", value: "IN_PROGRESS" }, { label: "Done", value: "DONE" }, { label: "Blocked", value: "BLOCKED" }] },
        ]}
        initialValues={{ title: feature.data.title, description: feature.data.description ?? "", status: feature.data.status }}
        submitLabel="Save feature"
        onClose={() => setEditOpen(false)}
        onSubmit={async (values) => { await request(`/features/${id}`, { method: "PUT", body: JSON.stringify(values) }); setReload((count) => count + 1); }}
      />
    </PageFrame>
  );
}
