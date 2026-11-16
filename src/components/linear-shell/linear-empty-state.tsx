import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

type LinearEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function LinearEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: LinearEmptyStateProps) {
  return (
    <div
      dir="rtl"
      role="status"
      className={cn(
        "flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-primary/55",
        className,
      )}
    >
      <div className="flex size-20 items-center justify-center rounded-2xl border border-border-color/10 bg-fourth/80">
        <Icon
          className="size-10 text-primary/35"
          strokeWidth={1.25}
          aria-hidden
        />
      </div>
      <div className="flex max-w-sm flex-col items-center gap-1.5 text-center">
        <p className="text-sm font-medium text-primary/70">{title}</p>
        {description ? (
          <p className="text-xs leading-5 text-primary/45">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
