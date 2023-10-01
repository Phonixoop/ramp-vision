import TrashIcon from "ui/icons/trash";
import PlusIcon from "ui/icons/plus";
import CircleButton from "ui/buttons/circle";
import Button from "ui/buttons";
export default function MultiRowTextBox({
  values = [],
  onChange = () => {},
  renderItems = () => {},
}) {
  function addRow() {
    const newRow = [
      ...values,
      {
        id: values[values.length - 1]?.id + 1 || 0,
      },
    ];
    onChange(newRow);
  }
  function removeRow(id) {
    if (values.length <= 0) return;
    const removedMats = values.filter((a) => a.id !== id);
    onChange(removedMats);
  }

  return (
    <div className="flex flex-col justify-center items-center w-full h-auto gap-2">
      {values.map((item) => {
        return (
          <div
            key={item.id}
            dir="rtl"
            className="flex justify-center items-center gap-2 w-full"
          >
            {renderItems(item, removeRow, addRow)}
            <div className="flex justify-end flex-grow gap-2 ">
              <CircleButton
                onClick={() => removeRow(item.id)}
                className="relative flex bg-atysa-900  disabled:bg-gray-300 disabled:text-gray-400 ring-inset  hover:ring-1 hover:ring-atysa-900 transition-all justify-center items-center hover:bg-opacity-50 rounded-full p-2 group "
              >
                <TrashIcon className="group-disabled:stroke-gray-400 stroke-white w-3 h-3 stroke-[1.8px] group-hover:stroke-black  " />
              </CircleButton>
            </div>
          </div>
        );
      })}
      <Button
        type="button"
        className="flex justify-center items-center text-center  text-white w-40 h-10 bg-atysa-900 rounded-lg"
        onClick={addRow}
      >
        <PlusIcon className="w-3 h-3 stroke-[2px] " />
      </Button>
    </div>
  );
}
