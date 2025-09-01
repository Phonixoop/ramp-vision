// loader anim component
import { Loader2Icon } from "lucide-react";
import { cn } from "~/lib/utils";

export default function LoaderAnim({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center">
      <Loader2Icon
        className={cn("size-4 animate-spin stroke-primary", className)}
      />
    </div>
  );
}
