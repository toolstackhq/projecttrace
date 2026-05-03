import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { request, queryString } from "../api/client";
import { useResource } from "../hooks/useResource";
import type { EpicDetail, FeatureRead, Page } from "../types/api";
import { DataTable } from "../components/DataTable";
import { PageFrame, Panel } from "../components/PageFrame";
import { StatusBadge } from "../components/StatusBadge";
import { CrudDialog } from "../components/CrudDialog";
import { Button, Spinner } from "../components/ui";
import { useSession } from "../session";

export function EpicDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = Number(params.epicId);
  const [reload, setReload] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const { isAdmin } = useSession();
  const epic = useResource(() => request<EpicDetail>(`/epics/${id}`), [id, reload]);
  const features = useResource(() => request<Page<FeatureRead>>(`/features${queryString({ epic_id: id, page_size: 100 })}`), [id, reload]);

  if (epic.loading || !epic.data) return <Spinner />;

  return (
    <PageFrame
      title={epic.data.title}
      description={epic.data.description ?? "No epic description provided."}
      action={
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setEditOpen(true)}>Edit epic</Button>
          {isAdmin ? (
            <Button
              variant="danger"
              onClick={async () => {
                if (!window.confirm("Delete this epic?")) return;
                await request(`/epics/${id}`, { method: "DELETE" });
                navigate("/epics");
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
          <div><div className="text-xs uppercase tracking-wide text-ink-500">Project</div><div className="mt-2 text-sm font-medium text-ink-900">{epic.data.project?.name ?? `#${epic.data.project_id}`}</div></div>
          <div><div className="text-xs uppercase tracking-wide text-ink-500">Owner</div><div className="mt-2 text-sm font-medium text-ink-900">{epic.data.owner?.name ?? `#${epic.data.owner_id}`}</div></div>
          <div><div className="text-xs uppercase tracking-wide text-ink-500">Status</div><div className="mt-2"><StatusBadge value={epic.data.status} /></div></div>
        </div>
      </Panel>
      <Panel className="space-y-4">
        <h2 className="text-base font-semibold text-ink-900">Features</h2>
        <DataTable rows={epic.data.features ?? features.data?.items ?? []} loading={features.loading} emptyTitle="No features linked" emptyDescription="Create features under this epic." columns={[
          { key: "title", label: "Feature", render: (row: FeatureRead) => <Link className="text-brand-700 hover:underline" to={`/features/${row.id}`}>{row.title}</Link> },
          { key: "status", label: "Status", render: (row: FeatureRead) => <StatusBadge value={row.status} /> },
        ]} />
      </Panel>

      <CrudDialog
        open={editOpen}
        title="Edit epic"
        fields={[
          { name: "title", label: "Title", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "status", label: "Status", type: "select", required: true, options: [{ label: "Planned", value: "PLANNED" }, { label: "Active", value: "ACTIVE" }, { label: "Done", value: "DONE" }, { label: "Blocked", value: "BLOCKED" }] },
        ]}
        initialValues={{ title: epic.data.title, description: epic.data.description ?? "", status: epic.data.status }}
        submitLabel="Save epic"
        onClose={() => setEditOpen(false)}
        onSubmit={async (values) => { await request(`/epics/${id}`, { method: "PUT", body: JSON.stringify(values) }); setReload((count) => count + 1); }}
      />
    </PageFrame>
  );
}
