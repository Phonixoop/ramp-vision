import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/shadcn/sheet";

import React from "react";
import Button from "~/ui/buttons";
import { FilterIcon } from "lucide-react";

export default function SheetView({
  children,
  className = "",
  title = "",
  icon = <FilterIcon />,
}) {
  return (
    <>
      <Sheet>
        <SheetTrigger className="bg-secondary p-2">{icon}</SheetTrigger>
        <SheetContent className="w-full ">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>

          {children}
          <SheetFooter>
            <SheetClose>
              <Button className="w-full text-center">بستن</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
