import { Column } from "react-table";
import { SelectColumnFilterOptimized } from "~/features/checkbox-list";
import { CustomColumnDef } from "~/types/table";

interface PerformanceTextFilterProps {
  column: any;
  data: any[];
}

export function PerformanceTextFilter({
  column,
  data,
}: PerformanceTextFilterProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">عملکرد</span>
      <SelectColumnFilterOptimized
        column={column}
        values={data?.filter((item) => item)}
      />
    </div>
  );
}
