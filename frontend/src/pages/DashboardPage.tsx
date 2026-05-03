import { Link } from "react-router-dom";
import { request, queryString } from "../api/client";
import { useResource } from "../hooks/useResource";
import type { ActivityLogRead, Page, SummaryResponse } from "../types/api";
import { Badge, Spinner, StatCard } from "../components/ui";
import { DataTable } from "../components/DataTable";
import { PageFrame, Panel } from "../components/PageFrame";
import { cn } from "../lib/cn";

function statusBarColor(index: number) {
  const palette = ["bg-brand-600", "bg-amber-500", "bg-emerald-500", "bg-red-500", "bg-slate-500"];
  return palette[index % palette.length];
}

export function DashboardPage() {
  const summary = useResource(() => request<SummaryResponse>("/stats/summary"), []);
  const activity = useResource(() => request<Page<ActivityLogRead>>(`/activity${queryString({ page_size: 8 })}`), []);

  const totals = summary.data?.totals;
  const bugTotal = summary.data?.bug_status.reduce((sum, bucket) => sum + bucket.count, 0) ?? 0;
  const requirementTotal = summary.data?.requirement_status.reduce((sum, bucket) => sum + bucket.count, 0) ?? 0;

  return (
    <PageFrame
      title="Dashboard"
      description="ProjectTrace keeps planning, testing, and defects in one dense operating view."
      action={
        <Link to="/projects" className="text-sm font-medium text-brand-700 hover:text-brand-800">
          View projects
        </Link>
      }
    >
      {summary.loading ? (
        <Spinner />
      ) : summary.error ? (
        <Panel>{summary.error}</Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <StatCard label="Total projects" value={totals?.projects ?? 0} />
          <StatCard label="Requirements" value={totals?.requirements ?? 0} />
          <StatCard label="Test cases" value={totals?.test_cases ?? 0} />
          <StatCard label="Total bugs" value={totals?.bugs ?? 0} />
          <StatCard label="Open bugs" value={totals?.open_bugs ?? 0} />
          <StatCard label="Failed runs" value={totals?.failed_test_runs ?? 0} />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Panel className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-ink-900">Recent activity</h2>
              <p className="text-sm text-ink-500">Latest workflow events across the workspace.</p>
            </div>
            <Link to="/activity" className="text-sm font-medium text-brand-700">
              Open log
            </Link>
          </div>
          <DataTable
            rows={activity.data?.items ?? []}
            loading={activity.loading}
            emptyTitle="No recent activity"
            emptyDescription="Activity records will appear here once items are created or updated."
            columns={[
              {
                key: "entity",
                label: "Entity",
                render: (row) => (
                  <div>
                    <div className="font-medium text-ink-900">{row.entity_type}</div>
                    <div className="text-xs text-ink-500">#{row.entity_id}</div>
                  </div>
                ),
              },
              {
                key: "action",
                label: "Action",
                render: (row) => <Badge tone="blue">{row.action}</Badge>,
              },
              {
                key: "timestamp",
                label: "Time",
                render: (row) => new Date(row.timestamp).toLocaleString(),
              },
            ]}
          />
        </Panel>

        <div className="space-y-6">
          <Panel className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-ink-900">Bug status summary</h2>
              <p className="text-sm text-ink-500">Distribution of the current defect backlog.</p>
            </div>
            <div className="space-y-3">
              {summary.data?.bug_status.map((bucket, index) => (
                <div key={bucket.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-ink-700">{bucket.label}</span>
                    <span className="text-ink-500">{bucket.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className={cn("h-full rounded-full", statusBarColor(index))}
                      style={{ width: `${bugTotal ? Math.max(8, (bucket.count / bugTotal) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-ink-900">Requirement status summary</h2>
              <p className="text-sm text-ink-500">Current flow of requirements through the pipeline.</p>
            </div>
            <div className="space-y-3">
              {summary.data?.requirement_status.map((bucket, index) => (
                <div key={bucket.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-ink-700">{bucket.label}</span>
                    <span className="text-ink-500">{bucket.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className={cn("h-full rounded-full", statusBarColor(index + 1))}
                      style={{ width: `${requirementTotal ? Math.max(8, (bucket.count / requirementTotal) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </PageFrame>
  );
}
