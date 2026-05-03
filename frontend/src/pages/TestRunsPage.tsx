import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { request, queryString } from "../api/client";
import { useResource } from "../hooks/useResource";
import type { Page, ProjectRead, TestCaseRead, TestRunRead } from "../types/api";
import { DataTable } from "../components/DataTable";
import { FilterBar } from "../components/FilterBar";
import { PageFrame, Panel } from "../components/PageFrame";
import { Pagination } from "../components/Pagination";
import { CrudDialog, FieldConfig } from "../components/CrudDialog";
import { Button } from "../components/ui";
import { StatusBadge } from "../components/StatusBadge";
import { useSession } from "../session";

export function TestRunsPage() {
  const [reload, setReload] = useState(0);
  const [params, setParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const { currentUser } = useSession();
  const page = Number(params.get("page") ?? "1");
  const projectId = params.get("project_id") ?? "";
  const status = params.get("status") ?? "";
  const executedBy = params.get("executed_by") ?? "";

  const projects = useResource(() => request<Page<ProjectRead>>(`/projects${queryString({ page_size: 100 })}`), []);
  const testCases = useResource(() => request<Page<TestCaseRead>>(`/test-cases${queryString({ page_size: 100 })}`), []);
  const runs = useResource(() => request<Page<TestRunRead>>(`/test-runs${queryString({ page, page_size: 20, project_id: projectId || undefined, status: status || undefined, executed_by: executedBy || undefined })}`), [page, projectId, status, executedBy, reload]);

  const options = useMemo(() => ({
    projects: (projects.data?.items ?? []).map((item) => ({ label: item.name, value: String(item.id) })),
    testCases: (testCases.data?.items ?? []).map((item) => ({ label: item.title, value: String(item.id) })),
  }), [projects.data, testCases.data]);

  const fields: FieldConfig[] = [
    { name: "project_id", label: "Project", type: "select", required: true, options: options.projects },
    { name: "test_case_id", label: "Test case", type: "select", required: true, options: options.testCases },
    { name: "status", label: "Status", type: "select", required: true, options: [{ label: "Passed", value: "PASSED" }, { label: "Failed", value: "FAILED" }, { label: "Blocked", value: "BLOCKED" }, { label: "Skipped", value: "SKIPPED" }] },
  ];

  return (
    <PageFrame
      title="Test Runs"
      description="A test run is the execution record for a test case. Use it to log a PASSED, FAILED, BLOCKED, or SKIPPED outcome."
      action={
        <Button onClick={() => setCreateOpen(true)} disabled={!currentUser}>
          <Plus className="h-4 w-4" />
          Record test run
        </Button>
      }
    >
      <FilterBar onClear={() => setParams({})}>
        <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Project ID</span><input value={projectId} onChange={(event) => { const next = new URLSearchParams(params); next.set("project_id", event.target.value); next.set("page", "1"); setParams(next); }} className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500" /></label>
        <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Status</span><input value={status} onChange={(event) => { const next = new URLSearchParams(params); next.set("status", event.target.value); next.set("page", "1"); setParams(next); }} className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500" /></label>
        <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Executed by</span><input value={executedBy} onChange={(event) => { const next = new URLSearchParams(params); next.set("executed_by", event.target.value); next.set("page", "1"); setParams(next); }} className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500" /></label>
      </FilterBar>
      <Panel className="space-y-4">
        <DataTable rows={runs.data?.items ?? []} loading={runs.loading} emptyTitle="No test runs" emptyDescription="Execute a test case to generate runs." columns={[
          { key: "project", label: "Project", render: (row) => row.project?.name ?? `#${row.project_id}` },
          { key: "case", label: "Test case", render: (row) => row.test_case?.title ?? `#${row.test_case_id}` },
          { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          { key: "executed", label: "Executed by", render: (row) => row.executed_by_user?.name ?? `#${row.executed_by}` },
        ]} />
        <Pagination page={runs.data?.page ?? 1} pages={runs.data?.pages ?? 1} onChange={(nextPage) => { const next = new URLSearchParams(params); next.set("page", String(nextPage)); setParams(next); }} />
      </Panel>

        <CrudDialog
        open={createOpen}
        title="Record test run"
        fields={fields}
        note={currentUser ? <span>This will be saved as a test execution record for {currentUser.name}.</span> : undefined}
        submitLabel="Record test run"
        onClose={() => setCreateOpen(false)}
        onSubmit={async (values) => {
          if (!currentUser) {
            throw new Error("No active user selected");
          }
          await request("/test-runs", {
            method: "POST",
            body: JSON.stringify({
              project_id: Number(values.project_id),
              test_case_id: Number(values.test_case_id),
              status: values.status,
            }),
          });
          setReload((count) => count + 1);
        }}
      />
    </PageFrame>
  );
}
