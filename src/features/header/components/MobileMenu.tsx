"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import DrawerView from "~/features/drawer-view";
import { checkStatusForMenu } from "../utils/menuUtils";

interface MobileMenuProps {
  sessionStatus: string;
  user: any;
}

export function MobileMenu({ sessionStatus, user }: MobileMenuProps) {
  const pathName = usePathname();
  const filteredMenu = checkStatusForMenu(sessionStatus, user);

  return (
    <div className="flex sm:hidden">
      <DrawerView className="bg-secondary" title="منو">
        <div dir="rtl" className="flex flex-col gap-4 p-4 text-right">
          {filteredMenu.map((item, i) => (
            <React.Fragment key={i}>
              <Link
                className={cn(
                  "rounded-lg bg-secbuttn p-2 text-primary",
                  item.link === pathName ? "bg-accent/20 text-accent" : "",
                )}
                href={item.link}
              >
                {item.value}
              </Link>

              {item.subMenu?.map((subItem, j) => (
                <div key={j} dir="rtl" className="flex flex-col pr-4">
                  <Link
                    className={cn(
                      "w-fit self-start rounded-lg bg-secbuttn p-2  text-primary",
                      subItem.link === pathName
                        ? "bg-accent/20 text-accent"
                        : "",
                    )}
                    href={subItem.link}
                  >
                    {subItem.value}
                  </Link>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </DrawerView>
    </div>
  );
}
