import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";

import React from "react";
import Button from "~/ui/buttons";
import { twMerge } from "tailwind-merge";

export default function DrawerView({
  children,
  className = "",
  title = "",
  icon = <MenuCustomIcon />,
}) {
  return (
    <>
      <Drawer>
        <DrawerTrigger>
          <Button className="bg-secondary text-primary">{icon}</Button>
        </DrawerTrigger>

        <DrawerContent className={className}>
          <DrawerHeader>
            <DrawerTitle className="text-primary">{title}</DrawerTitle>
          </DrawerHeader>
          {children}
        </DrawerContent>
      </Drawer>
    </>
  );
}

function MenuCustomIcon({ className = "" }) {
  return (
    <>
      <svg
        className={twMerge("stroke-primary stroke-2", className)}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="18" y2="18" />
      </svg>
    </>
  );
}
