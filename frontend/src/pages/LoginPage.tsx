import { FormEvent, useState } from "react";
import { Shield, Sparkles } from "lucide-react";
import { request } from "../api/client";
import { useSession } from "../session";
import { Button, Card } from "../components/ui";

export function LoginPage() {
  const { bootstrapRequired, login } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (bootstrapRequired) {
        await request("/users", {
          method: "POST",
          body: JSON.stringify({
            name,
            email,
            password,
            role: "ADMIN",
          }),
        });
      }
      await login(email, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to authenticate");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_36%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-10">
      <Card className="w-full max-w-md border-ink-200 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-700 text-white">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-ink-900">ProjectTrace</div>
            <div className="text-xs text-ink-500">Enterprise QA workspace</div>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-ink-900">
            {bootstrapRequired ? "Create the first admin" : "Sign in"}
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {bootstrapRequired
              ? "No users exist yet. Create the initial admin account to start provisioning the workspace."
              : "Use your ProjectTrace account to access planning, testing, defects, and activity data."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {bootstrapRequired ? (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink-700">Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                required
              />
            </label>
          ) : null}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
              required
            />
          </label>

          {error ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Working..." : bootstrapRequired ? (
              <>
                <Sparkles className="h-4 w-4" />
                Create admin
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Sign in
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
