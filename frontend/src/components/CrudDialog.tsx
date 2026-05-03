import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { ApiError } from "../api/client";
import { Modal, Button } from "./ui";

export type FieldType = "text" | "textarea" | "number" | "email" | "password" | "select";

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: FieldOption[];
  placeholder?: string;
}

export function CrudDialog({
  open,
  title,
  fields,
  initialValues,
  submitLabel,
  onClose,
  onSubmit,
  note,
}: {
  open: boolean;
  title: string;
  fields: FieldConfig[];
  initialValues?: Record<string, string | number | null | undefined>;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  note?: ReactNode;
}) {
  const seed = useMemo(() => {
    const values: Record<string, string> = {};
    for (const field of fields) values[field.name] = String(initialValues?.[field.name] ?? "");
    return values;
  }, [fields, initialValues]);

  const [values, setValues] = useState<Record<string, string>>(seed);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(seed);
    setError(null);
  }, [seed, open]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const missing = fields.find((field) => field.required && !values[field.name]?.trim());
    if (missing) {
      setError(`${missing.label} is required`);
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await onSubmit(values);
      onClose();
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {note ? <div className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-900">{note}</div> : null}
        {fields.map((field) => (
          <label key={field.name} className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">{field.label}</span>
            {field.type === "textarea" ? (
              <textarea
                value={values[field.name]}
                onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                rows={4}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none ring-0 focus:border-brand-500"
              />
            ) : field.type === "select" ? (
              <select
                value={values[field.name]}
                onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="">Select...</option>
                {field.options?.map((option) => (
                  <option key={String(option.value)} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={values[field.name]}
                onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            )}
          </label>
        ))}

        {error ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

        <div className="flex justify-end gap-2 border-t border-ink-200 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
