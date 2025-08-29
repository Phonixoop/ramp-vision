"use client";

import TrashIcon from "~/ui/icons/trash";
import PlusIcon from "~/ui/icons/plus";

import Button from "~/ui/buttons";

interface MultiRowItem {
  id: number;
  [key: string]: any;
}

interface MultiRowTextBoxProps {
  values?: MultiRowItem[];
  onChange?: (values: MultiRowItem[]) => void;
  renderItems?: (
    item: MultiRowItem,
    removeRow: (id: number) => void,
    addRow: () => void,
  ) => React.ReactNode;
}

export default function MultiRowTextBox({
  values = [],
  onChange = () => {},
  renderItems = () => null,
}: MultiRowTextBoxProps) {
  function addRow() {
    const newRow = [
      ...values,
      {
        id: values[values.length - 1]?.id + 1 || 0,
      },
    ];
    onChange(newRow);
  }
  function removeRow(id: number) {
    if (values.length <= 0) return;
    const removedMats = values.filter((a) => a.id !== id);
    onChange(removedMats);
  }

  return (
    <div className="flex h-auto w-full flex-col items-center justify-center gap-2">
      {values.map((item) => {
        return (
          <div
            key={item.id}
            dir="rtl"
            className="flex w-full items-center justify-center gap-2"
          >
            {renderItems(item, removeRow, addRow)}
            <div className="flex flex-grow justify-end gap-2 ">
              <Button
                onClick={() => removeRow(item.id)}
                className="bg-atysa-900 hover:ring-atysa-900 group  relative flex items-center  justify-center rounded-full p-2 ring-inset transition-all hover:bg-opacity-50 hover:ring-1 disabled:bg-gray-300 disabled:text-gray-400 "
              >
                <TrashIcon className="h-3 w-3 stroke-white stroke-[1.8px] group-hover:stroke-black group-disabled:stroke-gray-400  " />
              </Button>
            </div>
          </div>
        );
      })}
      <Button
        type="button"
        className="bg-atysa-900 flex h-10 w-40  items-center justify-center rounded-lg text-center text-white"
        onClick={addRow}
      >
        <PlusIcon className="h-3 w-3 stroke-[2px] " />
      </Button>
    </div>
  );
}
