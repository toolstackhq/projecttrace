import { useState } from "react";
import { Plus } from "lucide-react";
import { request, queryString } from "../api/client";
import { useResource } from "../hooks/useResource";
import type { Page, UserRead } from "../types/api";
import { DataTable } from "../components/DataTable";
import { PageFrame, Panel } from "../components/PageFrame";
import { Pagination } from "../components/Pagination";
import { CrudDialog, FieldConfig } from "../components/CrudDialog";
import { Button } from "../components/ui";
import { useSession } from "../session";

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const { isAdmin } = useSession();
  const users = useResource(() => request<Page<UserRead>>(`/users${queryString({ page, page_size: 20, sort: "created_at", order: "desc" })}`), [page, reload]);

  const fields: FieldConfig[] = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Password", type: "password", required: true, placeholder: "Set a login password" },
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      options: [
        { label: "Admin", value: "ADMIN" },
        { label: "Editor", value: "EDITOR" },
      ],
    },
  ];

  const canProvisionUsers = isAdmin;

  return (
    <PageFrame
      title="Users"
      description="Keep the ownership model visible so projects, defects, and test runs stay accountable."
      action={
        canProvisionUsers ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create user
          </Button>
        ) : null
      }
    >
      {!canProvisionUsers ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Only admins can provision users.
        </div>
      ) : null}
      <Panel className="space-y-4">
        <DataTable
          rows={users.data?.items ?? []}
          loading={users.loading}
          emptyTitle="No users yet"
          emptyDescription="Create the first user to assign ownership."
          columns={[
            { key: "name", label: "Name", render: (row) => row.name },
            { key: "email", label: "Email", render: (row) => row.email },
            { key: "role", label: "Role", render: (row) => row.role },
            { key: "created", label: "Created", render: (row) => new Date(row.created_at).toLocaleDateString() },
          ]}
        />
        <Pagination page={users.data?.page ?? 1} pages={users.data?.pages ?? 1} onChange={setPage} />
      </Panel>

      <CrudDialog
        open={createOpen}
        title="Create user"
        fields={fields}
        submitLabel="Create user"
        onClose={() => setCreateOpen(false)}
        onSubmit={async (values) => {
          await request("/users", { method: "POST", body: JSON.stringify(values) });
          setReload((count) => count + 1);
        }}
      />
    </PageFrame>
  );
}
