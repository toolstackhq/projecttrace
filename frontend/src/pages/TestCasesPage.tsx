import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { request, queryString } from "../api/client";
import { useResource } from "../hooks/useResource";
import type { Page, ProjectRead, TestCaseRead } from "../types/api";
import { DataTable } from "../components/DataTable";
import { FilterBar } from "../components/FilterBar";
import { PageFrame, Panel } from "../components/PageFrame";
import { Pagination } from "../components/Pagination";
import { CrudDialog, FieldConfig } from "../components/CrudDialog";
import { Button } from "../components/ui";
import { StatusBadge } from "../components/StatusBadge";

const automationOptions = [
  { label: "Not automated", value: "NOT_AUTOMATED" },
  { label: "Planned", value: "PLANNED" },
  { label: "Automated", value: "AUTOMATED" },
  { label: "Broken", value: "BROKEN" },
];

export function TestCasesPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [reload, setReload] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const search = params.get("search") ?? "";
  const page = Number(params.get("page") ?? "1");
  const projectId = params.get("project_id") ?? "";
  const priority = params.get("priority") ?? "";
  const automationStatus = params.get("automation_status") ?? "";

  const projects = useResource(() => request<Page<ProjectRead>>(`/projects${queryString({ page_size: 100 })}`), []);
  const testCases = useResource(() => request<Page<TestCaseRead>>(`/test-cases${queryString({ search, page, page_size: 20, project_id: projectId || undefined, priority: priority || undefined, automation_status: automationStatus || undefined })}`), [search, page, projectId, priority, automationStatus, reload]);

  const options = useMemo(() => ({ projects: (projects.data?.items ?? []).map((item) => ({ label: item.name, value: String(item.id) })) }), [projects.data]);
  const fields: FieldConfig[] = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "priority", label: "Priority", type: "select", required: true, options: [{ label: "Low", value: "LOW" }, { label: "Medium", value: "MEDIUM" }, { label: "High", value: "HIGH" }, { label: "Critical", value: "CRITICAL" }] },
    { name: "project_id", label: "Project", type: "select", required: true, options: options.projects },
    { name: "automation_status", label: "Automation status", type: "select", required: true, options: automationOptions },
    { name: "automated_test_name", label: "Automated test name", type: "text", placeholder: "tests/auth/login.spec.ts" },
  ];

  return (
    <PageFrame title="Test Cases" description="Define test cases with priority and project ownership." action={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />Create test case</Button>}>
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
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Priority</span>
          <select value={priority} onChange={(event) => { const next = new URLSearchParams(params); next.set("priority", event.target.value); next.set("page", "1"); setParams(next); }} className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500">
            <option value="">All</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Automation</span>
          <select value={automationStatus} onChange={(event) => { const next = new URLSearchParams(params); next.set("automation_status", event.target.value); next.set("page", "1"); setParams(next); }} className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500">
            <option value="">All</option>
            {automationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </FilterBar>

      <Panel className="space-y-4">
        <DataTable rows={testCases.data?.items ?? []} loading={testCases.loading} emptyTitle="No test cases found" emptyDescription="Define a test case to validate the application." onRowClick={(row) => navigate(`/test-cases/${row.id}`)} columns={[
          { key: "title", label: "Test case", render: (row) => <Link to={`/test-cases/${row.id}`} className="font-medium text-brand-700 hover:underline">{row.title}</Link> },
          { key: "project", label: "Project", render: (row) => row.project?.name ?? `#${row.project_id}` },
          { key: "priority", label: "Priority", render: (row) => <StatusBadge value={row.priority} /> },
          { key: "automation", label: "Automation", render: (row) => <div className="space-y-1"><StatusBadge value={row.automation_status} /><div className="text-xs text-ink-500">{row.automated_test_name ?? "Not linked"}</div></div> },
        ]} />
        <Pagination page={testCases.data?.page ?? 1} pages={testCases.data?.pages ?? 1} onChange={(nextPage) => { const next = new URLSearchParams(params); next.set("page", String(nextPage)); setParams(next); }} />
      </Panel>

      <CrudDialog
        open={createOpen}
        title="Create test case"
        fields={fields}
        initialValues={{ automation_status: "NOT_AUTOMATED" }}
        submitLabel="Create test case"
        onClose={() => setCreateOpen(false)}
        onSubmit={async (values) => {
          await request("/test-cases", {
            method: "POST",
            body: JSON.stringify({
              title: values.title,
              description: values.description || null,
              priority: values.priority,
              project_id: Number(values.project_id),
              automation_status: values.automation_status,
              automated_test_name: values.automated_test_name || null,
            }),
          });
          setReload((count) => count + 1);
        }}
      />
    </PageFrame>
  );
}
