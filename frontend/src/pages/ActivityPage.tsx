import { useSearchParams } from "react-router-dom";
import { request, queryString } from "../api/client";
import { useResource } from "../hooks/useResource";
import type { ActivityLogRead, Page } from "../types/api";
import { DataTable } from "../components/DataTable";
import { FilterBar } from "../components/FilterBar";
import { PageFrame, Panel } from "../components/PageFrame";
import { Pagination } from "../components/Pagination";

export function ActivityPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") ?? "1");
  const projectId = params.get("project_id") ?? "";
  const entityType = params.get("entity_type") ?? "";
  const action = params.get("action") ?? "";

  const activity = useResource(
    () =>
      request<Page<ActivityLogRead>>(
        `/activity${queryString({
          page,
          page_size: 20,
          project_id: projectId || undefined,
          entity_type: entityType || undefined,
          action: action || undefined,
        })}`,
      ),
    [page, projectId, entityType, action],
  );

  return (
    <PageFrame title="Activity Logs" description="Use the audit trail to understand what changed and when.">
      <FilterBar onClear={() => setParams({})}>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Project ID</span>
          <input
            value={projectId}
            onChange={(event) => {
              const next = new URLSearchParams(params);
              next.set("project_id", event.target.value);
              next.set("page", "1");
              setParams(next);
            }}
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Entity type</span>
          <input
            value={entityType}
            onChange={(event) => {
              const next = new URLSearchParams(params);
              next.set("entity_type", event.target.value);
              next.set("page", "1");
              setParams(next);
            }}
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Action</span>
          <input
            value={action}
            onChange={(event) => {
              const next = new URLSearchParams(params);
              next.set("action", event.target.value);
              next.set("page", "1");
              setParams(next);
            }}
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </label>
      </FilterBar>

      <Panel className="space-y-4">
        <DataTable
          rows={activity.data?.items ?? []}
          loading={activity.loading}
          emptyTitle="No activity"
          emptyDescription="Changes will appear here as the workspace is used."
          columns={[
            { key: "entity", label: "Entity", render: (row) => `${row.entity_type} #${row.entity_id}` },
            { key: "action", label: "Action", render: (row) => row.action },
            { key: "user", label: "User", render: (row) => row.user?.name ?? "System" },
            { key: "time", label: "Timestamp", render: (row) => new Date(row.timestamp).toLocaleString() },
          ]}
        />
        <Pagination
          page={activity.data?.page ?? 1}
          pages={activity.data?.pages ?? 1}
          onChange={(nextPage) => {
            const next = new URLSearchParams(params);
            next.set("page", String(nextPage));
            setParams(next);
          }}
        />
      </Panel>
    </PageFrame>
  );
}

