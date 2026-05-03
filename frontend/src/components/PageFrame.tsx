import { ReactNode } from "react";
import { Card, SectionTitle } from "./ui";

export function PageFrame({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle title={title} description={description} action={action} />
      {children}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <Card className={`p-4 md:p-5 ${className}`}>{children}</Card>;
}

