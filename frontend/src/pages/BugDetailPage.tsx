import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { request, queryString } from "../api/client";
import { useResource } from "../hooks/useResource";
import type { BugDetail, CommentRead, Page, RequirementRead, UserRead } from "../types/api";
import { DataTable } from "../components/DataTable";
import { PageFrame, Panel } from "../components/PageFrame";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui";
import { CrudDialog } from "../components/CrudDialog";
import { Spinner } from "../components/ui";
import { useSession } from "../session";

export function BugDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = Number(params.bugId);
  const [reload, setReload] = useState(0);
  const [commentOpen, setCommentOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { currentUser, isAdmin } = useSession();

  const bug = useResource(() => request<BugDetail>(`/bugs/${id}`), [id, reload]);
  const users = useResource(() => request<Page<UserRead>>(`/users${queryString({ page_size: 100 })}`), []);

  const linkedRequirements = bug.data?.requirements ?? [];
  const comments = bug.data?.comments ?? [];

  const userOptions = useMemo(() => (users.data?.items ?? []).map((user) => ({ label: user.name, value: String(user.id) })), [users.data]);

  if (bug.loading || !bug.data) return <Spinner />;

  const item = bug.data;

  return (
    <PageFrame
      title={item.title}
      description={item.description ?? "No bug description provided."}
      action={
        <div className="flex items-center gap-2">
          <StatusBadge value={item.severity} />
          <StatusBadge value={item.status} />
          <Button variant="secondary" onClick={() => setEditOpen(true)}>Edit bug</Button>
          {isAdmin ? (
            <Button
              variant="danger"
              onClick={async () => {
                if (!window.confirm("Delete this bug?")) return;
                await request(`/bugs/${id}`, { method: "DELETE" });
                navigate("/bugs");
              }}
            >
              Delete
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-500">Project</div>
              <Link className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-brand-700" to={`/projects/${item.project_id}`}>
                {item.project?.name ?? `Project #${item.project_id}`}
              </Link>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-500">Assignee</div>
              <div className="mt-2 text-sm font-medium text-ink-900">{item.assignee?.name ?? "Unassigned"}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-500">Reporter</div>
              <div className="mt-2 text-sm font-medium text-ink-900">{item.reporter?.name ?? `#${item.reporter_id}`}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-500">Updated</div>
              <div className="mt-2 text-sm font-medium text-ink-900">{new Date(item.updated_at).toLocaleString()}</div>
            </div>
          </div>
        </Panel>

        <Panel className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">Add comment</h2>
            <Button variant="secondary" onClick={() => setCommentOpen(true)} disabled={!currentUser}>
              <Plus className="h-4 w-4" />
              Comment
            </Button>
          </div>
          {currentUser ? <div className="text-xs text-ink-500">Comments will be recorded as {currentUser.name}.</div> : null}
          <DataTable
            rows={comments}
            loading={false}
            emptyTitle="No comments yet"
            emptyDescription="Add the first comment to capture triage details."
            columns={[
              { key: "user", label: "User", render: (row: CommentRead) => row.user?.name ?? `#${row.user_id}` },
              { key: "content", label: "Comment", render: (row: CommentRead) => row.content },
              { key: "time", label: "Time", render: (row: CommentRead) => new Date(row.created_at).toLocaleString() },
            ]}
          />
        </Panel>
      </div>

      <Panel className="space-y-4">
        <h2 className="text-base font-semibold text-ink-900">Linked requirements</h2>
        <DataTable
          rows={linkedRequirements}
          loading={false}
          emptyTitle="No linked requirements"
          emptyDescription="Link requirements to verify the defect coverage."
          columns={[
            {
              key: "title",
              label: "Requirement",
              render: (row: RequirementRead) => <Link className="text-brand-700 hover:underline" to={`/requirements/${row.id}`}>{row.title}</Link>,
            },
            { key: "status", label: "Status", render: (row: RequirementRead) => <StatusBadge value={row.status} /> },
            { key: "priority", label: "Priority", render: (row: RequirementRead) => <StatusBadge value={row.priority} /> },
          ]}
        />
      </Panel>

      <Panel className="space-y-4">
        <h2 className="text-base font-semibold text-ink-900">Activity</h2>
        <DataTable
          rows={item.activity}
          loading={false}
          emptyTitle="No activity yet"
          emptyDescription="Bugs create their own audit trail here."
          columns={[
            { key: "action", label: "Action", render: (row) => row.action },
            { key: "entity", label: "Entity", render: (row) => row.entity_type },
            { key: "time", label: "Timestamp", render: (row) => new Date(row.timestamp).toLocaleString() },
          ]}
        />
      </Panel>

      <CrudDialog
        open={commentOpen}
        title="Add comment"
        fields={[
          { name: "content", label: "Comment", type: "textarea", required: true },
        ]}
        initialValues={{}}
        submitLabel="Add comment"
        onClose={() => setCommentOpen(false)}
        onSubmit={async (values) => {
          if (!currentUser) {
            throw new Error("No active user selected");
          }
          await request(`/bugs/${id}/comments`, {
            method: "POST",
            body: JSON.stringify({ bug_id: id, content: values.content }),
          });
          setReload((value) => value + 1);
        }}
      />

      <CrudDialog
        open={editOpen}
        title="Edit bug"
        fields={[
          { name: "title", label: "Title", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
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
          { name: "assignee_id", label: "Assignee", type: "select", options: userOptions },
        ]}
        initialValues={{
          title: item.title,
          description: item.description ?? "",
          severity: item.severity,
          status: item.status,
          assignee_id: item.assignee_id ?? "",
        }}
        submitLabel="Save bug"
        onClose={() => setEditOpen(false)}
        onSubmit={async (values) => {
          await request(`/bugs/${id}`, {
            method: "PUT",
            body: JSON.stringify({
              title: values.title,
              description: values.description || null,
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
