// loader anim component
import { Loader2Icon } from "lucide-react";

export default function LoaderAnim() {
  return (
    <div className="flex items-center justify-center">
      <Loader2Icon className="h-4 w-4 animate-spin" />
    </div>
  );
}
