import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { request } from "../api/client";
import { useResource } from "../hooks/useResource";
import type { TestCaseDetail, TestRunRead, RequirementRead } from "../types/api";
import { DataTable } from "../components/DataTable";
import { PageFrame, Panel } from "../components/PageFrame";
import { StatusBadge } from "../components/StatusBadge";
import { CrudDialog } from "../components/CrudDialog";
import { Button, Spinner } from "../components/ui";
import { useSession } from "../session";

const automationOptions = [
  { label: "Not automated", value: "NOT_AUTOMATED" },
  { label: "Planned", value: "PLANNED" },
  { label: "Automated", value: "AUTOMATED" },
  { label: "Broken", value: "BROKEN" },
];

export function TestCaseDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = Number(params.testCaseId);
  const [reload, setReload] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const { isAdmin } = useSession();
  const testCase = useResource(() => request<TestCaseDetail>(`/test-cases/${id}`), [id, reload]);

  if (testCase.loading || !testCase.data) return <Spinner />;

  return (
    <PageFrame
      title={testCase.data.title}
      description={testCase.data.description ?? "No test case description provided."}
      action={
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setEditOpen(true)}>Edit test case</Button>
          {isAdmin ? (
            <Button
              variant="danger"
              onClick={async () => {
                if (!window.confirm("Delete this test case?")) return;
                await request(`/test-cases/${id}`, { method: "DELETE" });
                navigate("/test-cases");
              }}
            >
              Delete
            </Button>
          ) : null}
        </div>
      }
    >
      <Panel className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div><div className="text-xs uppercase tracking-wide text-ink-500">Project</div><div className="mt-2 text-sm font-medium text-ink-900">{testCase.data.project?.name ?? `#${testCase.data.project_id}`}</div></div>
          <div><div className="text-xs uppercase tracking-wide text-ink-500">Priority</div><div className="mt-2"><StatusBadge value={testCase.data.priority} /></div></div>
          <div><div className="text-xs uppercase tracking-wide text-ink-500">Automation</div><div className="mt-2"><StatusBadge value={testCase.data.automation_status} /></div></div>
          <div><div className="text-xs uppercase tracking-wide text-ink-500">Linked</div><div className="mt-2 text-sm font-medium text-ink-900">{testCase.data.automation_linked_at ? new Date(testCase.data.automation_linked_at).toLocaleString() : "Not linked"}</div></div>
          <div><div className="text-xs uppercase tracking-wide text-ink-500">Created</div><div className="mt-2 text-sm font-medium text-ink-900">{new Date(testCase.data.created_at).toLocaleString()}</div></div>
        </div>
        <div className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm text-ink-700">
          Automation name: <span className="font-medium text-ink-900">{testCase.data.automated_test_name ?? "Not linked"}</span>
        </div>
      </Panel>
      <Panel className="space-y-4">
        <h2 className="text-base font-semibold text-ink-900">Requirements</h2>
        <DataTable rows={testCase.data.requirements ?? []} loading={false} emptyTitle="No linked requirements" emptyDescription="Link requirements from the requirement detail page." columns={[
          { key: "title", label: "Requirement", render: (row: RequirementRead) => <Link className="text-brand-700 hover:underline" to={`/requirements/${row.id}`}>{row.title}</Link> },
          { key: "status", label: "Status", render: (row: RequirementRead) => <StatusBadge value={row.status} /> },
        ]} />
      </Panel>
      <Panel className="space-y-4">
        <h2 className="text-base font-semibold text-ink-900">Test runs</h2>
        <DataTable rows={testCase.data.test_runs ?? []} loading={false} emptyTitle="No test runs" emptyDescription="Execute this test case to create runs." columns={[
          { key: "status", label: "Status", render: (row: TestRunRead) => <StatusBadge value={row.status} /> },
          { key: "executed", label: "Executed", render: (row: TestRunRead) => new Date(row.executed_at).toLocaleString() },
        ]} />
      </Panel>

      <CrudDialog
        open={editOpen}
        title="Edit test case"
        fields={[
          { name: "title", label: "Title", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "priority", label: "Priority", type: "select", required: true, options: [{ label: "Low", value: "LOW" }, { label: "Medium", value: "MEDIUM" }, { label: "High", value: "HIGH" }, { label: "Critical", value: "CRITICAL" }] },
          { name: "automation_status", label: "Automation status", type: "select", required: true, options: automationOptions },
          { name: "automated_test_name", label: "Automated test name", type: "text", placeholder: "tests/auth/login.spec.ts" },
        ]}
        initialValues={{ title: testCase.data.title, description: testCase.data.description ?? "", priority: testCase.data.priority, automation_status: testCase.data.automation_status, automated_test_name: testCase.data.automated_test_name ?? "" }}
        submitLabel="Save test case"
        onClose={() => setEditOpen(false)}
        onSubmit={async (values) => {
          await request(`/test-cases/${id}`, {
            method: "PUT",
            body: JSON.stringify({
              ...values,
              automated_test_name: values.automated_test_name || null,
            }),
          });
          setReload((count) => count + 1);
        }}
      />
    </PageFrame>
  );
}
