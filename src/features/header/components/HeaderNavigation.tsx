import React from "react";
import { NavBar } from "~/components/main/nav-bar";
import { MobileMenu } from "./MobileMenu";
import { HeaderBrand } from "./HeaderBrand";
import { checkStatusForMenu } from "../utils/menuUtils";

interface HeaderNavigationProps {
  sessionStatus: string;
  user: any;
}

export function HeaderNavigation({
  sessionStatus,
  user,
}: HeaderNavigationProps) {
  const filteredMenu = checkStatusForMenu(sessionStatus, user);

  return (
    <div className="flex w-full flex-row items-center justify-start gap-4 px-2 sm:w-max sm:px-0">
      <MobileMenu sessionStatus={sessionStatus} user={user} />
      <HeaderBrand />
      <NavBar menuItems={filteredMenu} className="hidden sm:flex" />
    </div>
  );
}
