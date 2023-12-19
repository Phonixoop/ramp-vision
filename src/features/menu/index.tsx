import React, { useState } from "react";
import Link from "next/link";

import { motion } from "framer-motion";

import { useRouter } from "next/router";
import { getPathName } from "~/utils/util";
import { twMerge } from "tailwind-merge";
import { ChevronDownIcon } from "lucide-react";
export type MenuItem = {
  value: string;
  link: string;
  subMenu?: MenuItem[];
};
type MenuInput = {
  rootPath: String;
  list: MenuItem[];
  theme?: "solid" | "round";
  isSub?: boolean;
};
export default function Menu({
  rootPath = "",
  list = [],
  theme = "solid",
  isSub = false,
}: MenuInput) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const pathName = getPathName(router.asPath);

  return (
    <motion.div
      className={twMerge(
        "  z-0 flex max-w-sm cursor-pointer items-end gap-3 overflow-hidden overflow-x-auto  px-1 py-1  scrollbar-none md:w-fit md:max-w-full",
        theme === "solid" ? "" : "rounded-[30px]  bg-secbuttn",
      )}
      onHoverEnd={() => {
        setActiveIndex(-1);
      }}
    >
      {list.map((item, i) => {
        return (
          <motion.span
            className=" flex w-full min-w-fit items-center justify-center"
            key={i}
            onHoverStart={() => {
              setActiveIndex(i);
            }}
          >
            <MenuItem
              item={item}
              index={i}
              rootPath={rootPath}
              activeIndex={activeIndex}
              pathName={pathName}
              theme={theme}
              isSub={isSub}
            />
          </motion.span>
        );
      })}
    </motion.div>
  );
}

function MenuItem({
  item,
  activeIndex,
  index,
  pathName,
  rootPath,
  theme = "solid",
  isSub = false,
}) {
  const isHovered = activeIndex === index;
  const isActive = pathName === item.link;
  const activeClass = "text-primary";
  const { link, value } = item;
  return (
    <Link href={`${rootPath}/${link}`} className=" group w-full text-center">
      <div
        className={twMerge(
          " relative z-0 flex items-center justify-center gap-2 rounded-sm px-2 py-3 text-sm",
          isActive ? activeClass : "text-primary/50  hover:text-primary",
          theme === "solid" ? "rounded-md" : "rounded-full ",
          isSub ? " bg-secbuttn" : "",
        )}
      >
        {isHovered && (
          <motion.div
            transition={{
              duration: 0.15,
            }}
            layoutId="bg-follower"
            className={twMerge(
              "absolute inset-0 -z-10  bg-primbuttn  opacity-0 transition-opacity duration-1000 group-hover:opacity-100 ",
              theme === "solid" ? "rounded-md" : "rounded-full ",
            )}
          />
        )}

        {isActive && (
          <motion.div
            layoutId="underline"
            className="absolute -bottom-[2px] left-0 -z-10 h-[3px]  w-full  rounded-full bg-primbuttn"
          />
        )}

        <span className="duration-100 ">{value}</span>
        {item.subMenu && <ChevronDownIcon className="" />}
      </div>

      {item.subMenu && item.subMenu.length > 0 && (
        <ul className="absolute hidden rounded group-hover:block">
          <Menu
            list={item.subMenu}
            rootPath={rootPath}
            isSub={!!item.subMenu}
          />
        </ul>
      )}
    </Link>
  );
}

export function InPageMenu({
  className = "",
  startIndex = -1,
  index = -1,
  list = [],
  onChange = (value) => {},
}) {
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [items, setItems] = useState(
    list.map((item, i) => {
      if (startIndex == i) return { name: item, isActive: true };
      return { name: item, isActive: false };
    }),
  );

  const activeMonth = items.find((a) => a.isActive == true)?.name;

  return (
    <motion.div
      className={twMerge(
        "jus group flex cursor-pointer items-center justify-start  gap-3 overflow-hidden overflow-x-auto scrollbar-none ",
        className,
      )}
      onHoverEnd={() => {
        setActiveIndex(-1);
      }}
    >
      {items.map((item, i) => {
        return (
          <motion.span
            className="flex min-w-fit"
            key={i}
            onHoverStart={() => {
              setActiveIndex(i);
            }}
            onClick={() => {
              setItems((prev: any) => {
                return prev.map((a) => {
                  if (a.name === item.name) a.isActive = true;
                  else a.isActive = false;
                  return a;
                });
              });
              onChange({
                item: item,
                index: i,
              });
            }}
          >
            <InPageMenuItem
              text={item.name}
              isHovered={activeIndex === i}
              isActive={item.name === activeMonth}
            />
          </motion.span>
        );
      })}
    </motion.div>
  );
}

function InPageMenuItem({ text, isHovered = false, isActive = false }) {
  const activeClass = "text-primary";
  return (
    <div
      className={`relative z-0 rounded-sm px-5  pb-4 pt-2 text-sm ${
        isActive ? activeClass : "text-primary/50  hover:text-primary"
      } `}
    >
      {isHovered && (
        <motion.div
          transition={{
            duration: 0.15,
          }}
          layoutId="bg-follower-inpage"
          className="absolute inset-0 -z-10 h-[80%] rounded-md bg-primbuttn/30 opacity-0 transition-opacity duration-1000 group-hover:opacity-100 "
        />
      )}

      {isActive && (
        <>
          <motion.div
            layoutId="underline-inpage"
            className="absolute -bottom-[2px] left-0 -z-10 h-[3px]  w-full  rounded-full bg-primbuttn"
          />
          <motion.div
            transition={{
              duration: 0.15,
            }}
            layoutId="bg-follower-inpage"
            className="absolute inset-0 -z-10 h-[80%] rounded-md bg-primbuttn/30  transition-opacity duration-1000  "
          />
        </>
      )}

      <span className=" duration-100 ">{text}</span>
    </div>
  );
}
