import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type EmptyStateTone = "default" | "danger";

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  tone?: EmptyStateTone;
  className?: string;
}

const toneStyles: Record<EmptyStateTone, string> = {
  default: "border-border bg-background text-foreground",
  danger: "border-red-200 bg-red-50 text-red-700",
};

const toneMutedStyles: Record<EmptyStateTone, string> = {
  default: "text-muted-foreground",
  danger: "text-red-700",
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  tone = "default",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center",
        toneStyles[tone],
        className
      )}
    >
      {icon ? <div className={toneMutedStyles[tone]}>{icon}</div> : null}
      <p className="text-sm font-medium">{title}</p>
      {description ? (
        <p className={cn("max-w-xl text-sm", toneMutedStyles[tone])}>
          {description}
        </p>
      ) : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
