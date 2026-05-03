import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Link2 } from "lucide-react";
import { request, queryString } from "../api/client";
import { useResource } from "../hooks/useResource";
import type { BugRead, Page, RequirementDetail, TestCaseRead, ActivityLogRead } from "../types/api";
import { DataTable } from "../components/DataTable";
import { PageFrame, Panel } from "../components/PageFrame";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui";
import { CrudDialog } from "../components/CrudDialog";
import { Spinner } from "../components/ui";
import { useSession } from "../session";

export function RequirementDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = Number(params.requirementId);
  const [reload, setReload] = useState(0);
  const [linkTestCaseOpen, setLinkTestCaseOpen] = useState(false);
  const [linkBugOpen, setLinkBugOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { isAdmin } = useSession();

  const requirement = useResource(() => request<RequirementDetail>(`/requirements/${id}`), [id, reload]);
  const project = requirement.data?.project;
  const testCases = useResource(
    () => (project?.id ? request<Page<TestCaseRead>>(`/test-cases${queryString({ project_id: project.id, page_size: 100 })}`) : Promise.resolve({ items: [], total: 0, page: 1, page_size: 100, pages: 0 })),
    [project?.id],
  );
  const bugs = useResource(
    () => (project?.id ? request<Page<BugRead>>(`/bugs${queryString({ project_id: project.id, page_size: 100 })}`) : Promise.resolve({ items: [], total: 0, page: 1, page_size: 100, pages: 0 })),
    [project?.id],
  );
  const activity = useResource(() => request<Page<ActivityLogRead>>(`/activity${queryString({ entity_type: "Requirement", entity_id: id, page_size: 20 })}`), [id, reload]);

  const testCaseOptions = useMemo(
    () => (testCases.data?.items ?? []).map((item) => ({ label: item.title, value: String(item.id) })),
    [testCases.data],
  );
  const bugOptions = useMemo(() => (bugs.data?.items ?? []).map((item) => ({ label: item.title, value: String(item.id) })), [bugs.data]);

  if (requirement.loading || !requirement.data) {
    return <Spinner />;
  }

  const item = requirement.data;

  return (
    <PageFrame
      title={item.title}
      description={item.description ?? "No requirement description provided."}
      action={
        <div className="flex items-center gap-2">
          <StatusBadge value={item.priority} />
          <StatusBadge value={item.status} />
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          {isAdmin ? (
            <Button
              variant="danger"
              onClick={async () => {
                if (!window.confirm("Delete this requirement?")) return;
                await request(`/requirements/${id}`, { method: "DELETE" });
                navigate("/requirements");
              }}
            >
              Delete
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-500">Project</div>
              <Link className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-brand-700" to={`/projects/${item.project_id}`}>
                {item.project?.name ?? `Project #${item.project_id}`}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-500">Parent feature</div>
              <Link className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-brand-700" to={`/features/${item.feature_id}`}>
                {item.feature?.title ?? `Feature #${item.feature_id}`}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-500">Creator</div>
              <div className="mt-2 text-sm font-medium text-ink-900">{item.creator?.name ?? `#${item.created_by}`}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-500">Created</div>
              <div className="mt-2 text-sm font-medium text-ink-900">{new Date(item.created_at).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-500">Updated</div>
              <div className="mt-2 text-sm font-medium text-ink-900">{new Date(item.updated_at).toLocaleString()}</div>
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-900">Link test case</h2>
              <Button variant="secondary" onClick={() => setLinkTestCaseOpen(true)}>
                <Link2 className="h-4 w-4" />
                Link
              </Button>
            </div>
            <DataTable
              rows={item.test_cases ?? []}
              loading={false}
              emptyTitle="No linked test cases"
              emptyDescription="Link relevant test cases to maintain traceability."
              columns={[
                {
                  key: "title",
                  label: "Test case",
                  render: (row: TestCaseRead) => <Link className="text-brand-700 hover:underline" to={`/test-cases/${row.id}`}>{row.title}</Link>,
                },
                { key: "priority", label: "Priority", render: (row: TestCaseRead) => <StatusBadge value={row.priority} /> },
                ...(isAdmin
                  ? [
                      {
                        key: "unlink",
                        label: "",
                        render: (row: TestCaseRead) => (
                          <Button
                            variant="ghost"
                            onClick={async () => {
                              await request(`/requirements/${id}/test-cases/${row.id}`, { method: "DELETE" });
                              setReload((value) => value + 1);
                            }}
                          >
                            Unlink
                          </Button>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          </Panel>

          <Panel className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-900">Link bug</h2>
              <Button variant="secondary" onClick={() => setLinkBugOpen(true)}>
                <Link2 className="h-4 w-4" />
                Link
              </Button>
            </div>
            <DataTable
              rows={item.bugs ?? []}
              loading={false}
              emptyTitle="No linked bugs"
              emptyDescription="Link bugs that verify or invalidate this requirement."
              columns={[
                {
                  key: "title",
                  label: "Bug",
                  render: (row: BugRead) => <Link className="text-brand-700 hover:underline" to={`/bugs/${row.id}`}>{row.title}</Link>,
                },
                { key: "severity", label: "Severity", render: (row: BugRead) => <StatusBadge value={row.severity} /> },
                ...(isAdmin
                  ? [
                      {
                        key: "unlink",
                        label: "",
                        render: (row: BugRead) => (
                          <Button
                            variant="ghost"
                            onClick={async () => {
                              await request(`/requirements/${id}/bugs/${row.id}`, { method: "DELETE" });
                              setReload((value) => value + 1);
                            }}
                          >
                            Unlink
                          </Button>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          </Panel>
        </div>
      </div>

      <Panel className="space-y-4">
        <h2 className="text-base font-semibold text-ink-900">Activity</h2>
        <DataTable
          rows={activity.data?.items ?? []}
          loading={activity.loading}
          emptyTitle="No activity yet"
          emptyDescription="Actions against this requirement will appear here."
          columns={[
            { key: "action", label: "Action", render: (row) => row.action },
            { key: "entity", label: "Entity", render: (row) => row.entity_type },
            { key: "time", label: "Timestamp", render: (row) => new Date(row.timestamp).toLocaleString() },
          ]}
        />
      </Panel>

      <CrudDialog
        open={linkTestCaseOpen}
        title="Link test case"
        fields={[{ name: "test_case_id", label: "Test case", type: "select", required: true, options: testCaseOptions }]}
        submitLabel="Link test case"
        onClose={() => setLinkTestCaseOpen(false)}
        onSubmit={async (values) => {
          await request(`/requirements/${id}/test-cases/${values.test_case_id}`, { method: "POST" });
          setReload((value) => value + 1);
        }}
      />

      <CrudDialog
        open={linkBugOpen}
        title="Link bug"
        fields={[{ name: "bug_id", label: "Bug", type: "select", required: true, options: bugOptions }]}
        submitLabel="Link bug"
        onClose={() => setLinkBugOpen(false)}
        onSubmit={async (values) => {
          await request(`/requirements/${id}/bugs/${values.bug_id}`, { method: "POST" });
          setReload((value) => value + 1);
        }}
      />

      <CrudDialog
        open={editOpen}
        title="Edit requirement"
        fields={[
          { name: "title", label: "Title", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
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
        ]}
        initialValues={{ title: item.title, description: item.description ?? "", priority: item.priority, status: item.status }}
        submitLabel="Save requirement"
        onClose={() => setEditOpen(false)}
        onSubmit={async (values) => {
          await request(`/requirements/${id}`, {
            method: "PUT",
            body: JSON.stringify({
              title: values.title,
              description: values.description || null,
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
