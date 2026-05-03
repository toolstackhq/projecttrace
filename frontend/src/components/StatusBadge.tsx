import { Badge } from "./ui";

export function StatusBadge({ value }: { value: string }) {
  const tone =
    /not_automated|planned/i.test(value)
      ? "slate"
      : /broken|critical/i.test(value) || /failed|blocked|open|in_progress/i.test(value)
      ? "red"
      : /automated/i.test(value) || /resolved|closed|passed|done|verified/i.test(value)
        ? "green"
      : /active|in_progress|ready/i.test(value)
          ? "blue"
          : /draft/i.test(value)
            ? "slate"
            : /medium|skipped/i.test(value)
              ? "amber"
              : "slate";
  return <Badge tone={tone}>{value.replaceAll("_", " ")}</Badge>;
}
