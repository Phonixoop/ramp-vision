"use client";
import {
  BoltIcon,
  BookOpenIcon,
  ChevronDownIcon,
  Layers2Icon,
  LogOutIcon,
  PinIcon,
  UserCog2Icon,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import React, { useState } from "react";
import Link from "next/link";
import Button from "~/ui/buttons";
import { ThemeSwitch } from "./ThemeSwitch";
import { Permission, User } from "~/types";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/shadcn/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/shadcn/dropdown-menu";
import { cn } from "~/lib/utils";

interface AuthShowcaseProps {
  session: any;
}

export function AuthShowcase({ session }: AuthShowcaseProps) {
  const { data: sessionData, status } = session;
  const user: User = sessionData?.user;
  const [isOpen, setIsOpen] = useState(false);

  if (status === "loading") {
    return <div className="h-5 w-20 animate-pulse"></div>;
  }

  if (status === "unauthenticated" || !user) {
    return (
      <div className="relative flex min-h-10 w-40 items-stretch justify-end gap-4 rounded-lg bg-secbuttn/50 ">
        <ThemeSwitch className="absolute inset-0 right-0 -translate-y-1/2" />

        <Button
          fillWidthOnHover
          className="w-22 flex min-w-[100px] items-center justify-center gap-2 rounded-lg bg-primary stroke-accent p-0 px-2 text-secondary"
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          <span>ورود</span>
        </Button>
      </div>
    );
  }

  const permissions: Permission[] = JSON.parse(user?.role?.permissions);
  const permission = permissions.find((p) => p.id === "ViewAdmin");
  const isAdmin = permission && permission?.isActive === true;

  const displayName = user?.display_name ? user.display_name : user.username;
  const initials = displayName
    ?.split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center justify-evenly gap-4 rounded-lg bg-secbuttn/50">
      <ThemeSwitch />
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button className=" flex items-center gap-2  rounded-lg   bg-secbuttn p-2  hover:bg-secbuttn/80">
            <Avatar>
              <AvatarImage src={user?.image_url || ""} alt="Profile image" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="h-full w-px bg-primary" />
            <ChevronDownIcon
              size={16}
              className={cn("opacity-60 transition-transform duration-300", {
                "rotate-180": isOpen,
              })}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44">
          <DropdownMenuLabel dir="rtl" className="flex min-w-0 flex-col">
            <span className="text-foreground truncate text-sm font-medium">
              {displayName}
            </span>
            <span className="text-muted-foreground truncate text-xs font-normal">
              {user?.username}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {isAdmin && (
            <>
              <DropdownMenuGroup dir="rtl">
                <DropdownMenuItem
                  asChild
                  className="hover:border-none hover:outline-none  hover:ring-0"
                >
                  <Link href="/admin" className="flex items-center">
                    <UserCog2Icon
                      size={16}
                      className="text-primary opacity-60"
                    />
                    <span>پنل ادمین</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem dir="rtl" onClick={() => void signOut()}>
            <LogOutIcon size={16} className="text-primary opacity-60" />
            <span>خروج</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
