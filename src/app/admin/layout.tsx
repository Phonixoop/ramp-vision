"use client";

import React, { useState } from "react";
import Button from "~/ui/buttons";
import Link from "next/link";

import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { getPathName } from "~/utils/util";
import { Container, ContainerBottomBorder } from "~/ui/containers";
import NotificationIcon from "~/ui/icons/notification";
import ExitIcon from "~/ui/icons/exits";

import Menu from "~/features/menu";
import BlurBackground from "~/ui/blur-backgrounds";
import ThemeBox from "~/features/theme-box";

import useStatus from "~/hooks/useStatus";
import { LayoutGroup } from "framer-motion";

import Loading from "~/app/admin/loading";

const menuList = [
  {
    value: "کاربر ها",
    link: "/admin/users",
    description: `در این بخش می توانید کاربر های مد نظر خود را بسازید، ویرایش کنید و
    یا حذف کنید و تنظیمات مربوط به آن ها را تغییر دهید`,
  },

  {
    value: "سمت ها",
    description: `در این بخش می توانید سمت های مد نظر خود را بسازید تا در بخش کاربر ها برای آن ها اعمال کنید`,
    link: "/admin/roles",
  },
  {
    value: "کد های تایید رسا",
    description: "",
    link: "/admin/otps",
  },
  {
    value: "تنظیمات روز کاری ماهیانه",
    description: "",
    link: "/admin/month-work-day-settings",
  },

  // {
  //   value: "پرسنل",
  //   description: `در این بخش می توانید بر روی پرسنل ویرایش های لازم را انجام دهید`,
  //   link: "personnel",
  // },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const session = useSession();
  const { isOnline, isDesktop } = useStatus();

  if (session.status === "loading") return <Loading />;

  const currentMenuItem = menuList.find((a) => a.link == getPathName(pathname));

  return (
    <div
      dir="rtl"
      className="bg-sepcondary m-auto flex min-h-screen w-full max-w-[1920px] flex-col items-center"
    >
      <Container className="flex w-full items-center justify-center ">
        <BlurBackground />

        <Container className="flex  flex-col bg-secondary">
          <div
            className="flex flex-col items-center justify-between gap-5  py-8 md:flex-row"
            dir="rtl"
          >
            <div className="flex flex-col  items-center justify-center gap-2 md:flex-row">
              <div className="text-accent">
                <span className="px-2 "> {session.data?.user?.username}</span>
                <Link href={"/admin"}>
                  {isDesktop ? "💻" : "📱"} {session.data?.user?.name}
                </Link>
                <span className="text-accent/80">
                  {currentMenuItem && " / " + currentMenuItem.value}
                </span>
              </div>
              {/* <ThemeBox /> */}
            </div>

            <div className="flex items-center justify-center gap-5 ">
              <Button className="cursor-pointer rounded-full stroke-accent p-1.5  ring-1 ring-accent hover:bg-accent/50 hover:stroke-primary hover:ring-accent/50">
                <NotificationIcon className="h-4 w-4  " />
              </Button>
              <Button
                onClick={() => signOut()}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-full stroke-white p-1.5 text-primary  hover:bg-accent/50 hover:stroke-primary hover:ring-accent/50"
              >
                <ExitIcon className="h-4 w-4" />
                <span className="hidden text-sm text-primary md:flex">
                  خروج
                </span>
              </Button>
            </div>
          </div>
        </Container>
      </Container>
      <ContainerBottomBorder className=" sticky top-0 z-50 flex pt-2 backdrop-blur-lg">
        <Container className=" max2xl:w-full">
          <LayoutGroup id="main-menu">
            <Menu rootPath={"/admin"} list={menuList} />
          </LayoutGroup>
        </Container>
      </ContainerBottomBorder>
      {currentMenuItem && (
        <LayoutSubContainer currentMenuItem={currentMenuItem} />
      )}
      <ContainerBottomBorder className="h-full items-start bg-accent/5 ">
        {children}
      </ContainerBottomBorder>
    </div>
  );
}

function LayoutSubContainer({ currentMenuItem }: { currentMenuItem: any }) {
  return (
    <ContainerBottomBorder>
      <Container className="flex flex-col gap-5 px-5 py-10 ">
        <h1 className=" text-primary">{currentMenuItem.value}</h1>
        {currentMenuItem.description && (
          <p className="text-sm text-primbuttn">
            {currentMenuItem.description}
          </p>
        )}
      </Container>
    </ContainerBottomBorder>
  );
}
