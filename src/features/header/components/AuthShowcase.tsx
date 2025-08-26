"use client";
import { LogOutIcon, UserCog2Icon } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";
import Link from "next/link";
import Button from "~/ui/buttons";
import { ThemeSwitch } from "./ThemeSwitch";
import { Permission, User } from "~/types";

interface AuthShowcaseProps {
  session: any;
}

export function AuthShowcase({ session }: AuthShowcaseProps) {
  const { data: sessionData, status } = session;
  const user: User = sessionData?.user;

  if (status === "loading") {
    return <div className="h-5 w-20 animate-pulse"></div>;
  }

  if (status === "unauthenticated" || !user) {
    return (
      <div className="flex w-full items-center justify-between gap-5 px-4">
        <Button
          className="flex  min-w-[100px] items-center justify-center gap-2 rounded-lg  bg-primary stroke-accent p-0 px-2 py-1  text-secondary"
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          <span>ورود</span>
        </Button>
        <ThemeSwitch />
      </div>
    );
  }

  const permissions: Permission[] = JSON.parse(user?.role?.permissions);
  const permission = permissions.find((p) => p.id === "ViewAdmin");
  const isAdmin = permission && permission?.isActive === true;

  return (
    <div className="flex  flex-row gap-4 rounded-full ">
      <div className="flex items-center gap-5  px-2 ">
        <ThemeSwitch />
      </div>
      <div className="relative flex  items-center justify-center gap-2 rounded-full  ">
        <Button
          className="flex  items-center justify-center gap-2 rounded-xl border border-primary/20  stroke-accent p-2 text-primary sm:px-4 sm:py-1"
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          <span className="hidden sm:flex">
            {sessionData ? "خروج" : "ورود"}
          </span>
          <LogOutIcon className="h-4 w-4" />
        </Button>
        <span className="hidden items-stretch justify-center gap-2 rounded-full stroke-accent px-3 text-accent sm:flex">
          <span className="">
            {user?.display_name ? user.display_name : user.username}
          </span>
        </span>
        {isAdmin && (
          <>
            <div className="hidden h-[15px] w-[0.5px] bg-accent sm:flex"></div>
            <Link href={"/admin"}>
              <Button className="flex min-w-max items-stretch justify-center gap-2 rounded-xl bg-secondary  stroke-accent  text-accent">
                <div className="flex w-fit items-center justify-center gap-2">
                  <span>پنل ادمین</span>
                  <UserCog2Icon />
                </div>
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
