import { ArrowDownAZIcon, ArrowUpAZIcon, EraserIcon } from "lucide-react";
import React, { useState } from "react";
import Button from "~/ui/buttons";

export default function AdvancedList({
  title = <></> || "",
  list = [],
  filteredList = [],
  disabled = false,
  selectProperty = undefined,

  onChange = (action) => {},
  renderItem = (item, i) => <></>,
}) {
  const [sortOrder, setSortOrder] = useState("asc");
  function filterBySearch(query) {
    // Access input value

    // Create copy of item list
    let updatedList = [...list];
    // Include all elements which includes the search query

    //@ts-ignore
    updatedList = list.filter((item) => {
      const selectItem = selectProperty ? item[selectProperty] : item;
      return selectItem.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
    // Trigger render with updated values
    onChange(updatedList);
    // setFilteredList(updatedList);
  }

  function toggleSortOrder() {
    if (list.length <= 0) return;
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);

    const sorted = [...list].sort((a, b) => {
      const aa = selectProperty ? a[selectProperty] : a;
      const bb = selectProperty ? b[selectProperty] : b;
      const comparison = aa.localeCompare(bb);
      return newOrder === "asc" ? comparison : -comparison;
    });
    onChange(sorted);
    //setFilteredList(sorted);
  }
  return (
    <div className="flex w-full max-w-sm flex-col items-center justify-center gap-1">
      {title && (
        <div className="w-full rounded-lg bg-secbuttn p-3 text-center text-lg font-bold text-primary">
          {title}
        </div>
      )}
      <div className="flex max-h-[500px] w-full  flex-col gap-1 overflow-hidden overflow-y-auto rounded-2xl bg-secbuttn p-1">
        <div className="sticky top-0 z-10 flex w-full flex-col items-center justify-center gap-1 bg-secbuttn py-2 drop-shadow-lg ">
          <input
            type="text"
            dir="rtl"
            placeholder="جستجو..."
            className=" w-full rounded-md bg-secondary p-2 text-primary disabled:bg-primary/30 disabled:text-secondary "
            onChange={(e) => filterBySearch(e.target.value)}
            disabled={disabled}
          />
          <div className="flex w-full items-center justify-stretch gap-2 ">
            <Button
              disabled={disabled}
              className="flex w-full items-center justify-around gap-2 bg-secondary  disabled:bg-primary/70 disabled:text-secondary"
            >
              <span>حذف انتخاب</span>
              <EraserIcon />
            </Button>
            <Button
              disabled={disabled}
              onClick={() => toggleSortOrder()}
              className="flex w-full items-center justify-around gap-2 bg-secondary text-accent  disabled:bg-primary/70 disabled:text-secondary"
            >
              <span>مرتب سازی</span>
              {sortOrder === "asc" ? <ArrowDownAZIcon /> : <ArrowUpAZIcon />}
            </Button>
          </div>
        </div>
        {filteredList.map((item, i) => {
          return renderItem(item, i);
        })}
      </div>
    </div>
  );
}
