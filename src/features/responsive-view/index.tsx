import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import DrawerView from "~/features/drawer-view";
import SheetView from "~/features/sheet-view";
import Button from "~/ui/buttons";
import Modal from "~/ui/modals";

export default function ResponsiveView({
  children,
  title = "",
  icon = <></>,
  className,
  drawerClassName,
  dir,
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className={twMerge(className, "flex sm:hidden")} dir={dir}>
        <Button onClick={() => setIsOpen(true)}>{icon}</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
          }}
          title={title}
        >
          <div className={twMerge(className, "flex sm:hidden")} dir={dir}>
            {children}
          </div>
        </Modal>
      </div>
      <div className={twMerge(className, "hidden sm:flex")} dir={dir}>
        {children}
      </div>
    </>
  );
}
