"use client";
import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChartIcon,
  ChevronDownIcon,
  ChevronRight,
  ChevronRightIcon,
  HomeIcon,
  PieChartIcon,
  UsersIcon,
  FileTextIcon,
  TrendingUpIcon,
  SettingsIcon,
  HelpCircleIcon,
  InfoIcon,
  BuildingIcon,
  ClipboardListIcon,
  ActivityIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";

// Type definitions
export type MenuItem = {
  id: string;
  value: string;
  link: string;
  icon?: React.ComponentType<{ className?: string }>;
  subMenu?: MenuItem[];
  category?: string;
};

export type MenuCategory = {
  id: string;
  title: string;
  items: MenuItem[];
};

export type NavBarProps = {
  menuItems: MenuItem[];
  className?: string;
};

export function NavBar({ menuItems, className }: NavBarProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [dir, setDir] = useState<null | "l" | "r">(null);

  const handleSetSelected = (val: string | null) => {
    if (selected && val) {
      const selectedIndex = menuItems.findIndex((item) => item.id === selected);
      const newIndex = menuItems.findIndex((item) => item.id === val);
      setDir(selectedIndex > newIndex ? "r" : "l");
    } else if (val === null) {
      setDir(null);
    }

    setSelected(val);
  };

  const itemsWithSubMenu = menuItems.filter(
    (item) => item.subMenu && item.subMenu.length > 0,
  );
  const itemsWithoutSubMenu = menuItems.filter(
    (item) => !item.subMenu || item.subMenu.length === 0,
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Items without submenu - direct links */}
      {itemsWithoutSubMenu.map((item) => (
        <Link
          key={item.id}
          href={item.link}
          className="flex items-start justify-center gap-1 rounded-full px-3 py-1.5 text-sm text-primary/70 transition-colors hover:text-primary"
        >
          {item.icon && <item.icon className="size-4" />}
          <span>{item.value}</span>
        </Link>
      ))}

      {/* Items with submenu - dropdown */}
      <div
        onMouseLeave={() => handleSetSelected(null)}
        className="relative flex h-fit gap-2"
      >
        {itemsWithSubMenu.map((item) => (
          <Tab
            key={item.id}
            selected={selected}
            handleSetSelected={handleSetSelected}
            item={item}
          >
            {item.value}
          </Tab>
        ))}

        <Content dir={dir} selected={selected} menuItems={menuItems} />
      </div>
    </div>
  );
}

function Tab({
  children,
  item,
  handleSetSelected,
  selected,
}: {
  children: ReactNode;
  item: MenuItem;
  handleSetSelected: (val: string | null) => void;
  selected: string | null;
}) {
  return (
    <button
      id={`shift-tab-${item.id}`}
      onMouseEnter={() => handleSetSelected(item.id)}
      onClick={() => handleSetSelected(item.id)}
      className={cn(
        "flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors",
        selected === item.id ? "bg-secbuttn text-primary" : "text-primary/70",
      )}
    >
      <span>{children}</span>
      <ChevronDownIcon
        className={cn(
          "size-3.5 stroke-[3px] transition-transform",
          selected === item.id ? "rotate-180" : "",
        )}
      />
    </button>
  );
}

function Content({
  selected,
  dir,
  menuItems,
}: {
  selected: string | null;
  dir: null | "l" | "r";
  menuItems: MenuItem[];
}) {
  const selectedItem = menuItems.find((item) => item.id === selected);

  if (!selectedItem || !selectedItem.subMenu) return null;

  return (
    <motion.div
      id="overlay-content"
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: 8,
      }}
      className=" absolute left-0 top-[calc(100%_+_24px)] w-96 rounded-lg bg-secbuttn p-4 supports-[backdrop-filter]:bg-secbuttn/50 supports-[backdrop-filter]:backdrop-blur-lg"
    >
      <Bridge />
      <Nub selected={selected} />

      {menuItems.map((item) => {
        return (
          <div className="overflow-hidden" key={item.id}>
            {selected === item.id && item.subMenu && (
              <motion.div
                initial={{
                  opacity: 0,
                  x: dir === "l" ? 100 : dir === "r" ? -100 : 0,
                }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: dir === "l" ? 100 : dir === "r" ? -100 : 0,
                }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <SubMenuContent subMenu={item.subMenu} />
              </motion.div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}

function SubMenuContent({ subMenu }: { subMenu: MenuItem[] }) {
  // Group items by category if they have categories
  const categorizedItems = subMenu.reduce(
    (acc, item) => {
      const category = item.category || "default";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, MenuItem[]>,
  );

  const categories = Object.keys(categorizedItems);

  if (categories.length === 1 && categories[0] === "default") {
    // Single column layout for uncategorized items
    return (
      <div className="grid grid-cols-1 gap-4">
        {subMenu.map((item) => (
          <SubMenuItem key={item.id} item={item} />
        ))}
      </div>
    );
  }

  // Multi-column layout for categorized items
  return (
    <div className="grid grid-cols-2 gap-4">
      {categories.map((category) => (
        <div
          key={category}
          className="flex flex-col items-center justify-stretch"
        >
          <h3 className="mb-2 text-sm font-medium text-primary/20">
            {category === "default" ? "سایر" : category}
          </h3>
          <div className="space-y-1">
            {categorizedItems[category].map((item) => (
              <SubMenuItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SubMenuItem({ item }: { item: MenuItem }) {
  const IconComponent = item.icon;

  return (
    <Link
      href={item.link}
      className="flex w-full flex-col  items-center justify-center py-2 text-primary/70 transition-colors hover:text-primary"
    >
      {IconComponent && <IconComponent className="mb-2 text-xl " />}
      <span className="text-xs">{item.value}</span>
    </Link>
  );
}

function Bridge() {
  return <div className="absolute -top-[24px] left-0 right-0 h-[24px]" />;
}

function Nub({ selected }: { selected: string | null }) {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    moveNub();
  }, [selected]);

  const moveNub = () => {
    if (selected) {
      const hoveredTab = document.getElementById(`shift-tab-${selected}`);
      const overlayContent = document.getElementById("overlay-content");

      if (!hoveredTab || !overlayContent) return;

      const tabRect = hoveredTab.getBoundingClientRect();
      const { left: contentLeft } = overlayContent.getBoundingClientRect();

      const tabCenter = tabRect.left + tabRect.width / 2 - contentLeft;

      setLeft(tabCenter);
    }
  };

  return (
    <motion.span
      style={{
        clipPath: "polygon(0 0, 100% 0, 50% 50%, 0% 100%)",
      }}
      animate={{ left }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-tl-md border border-secbuttn bg-inherit"
    />
  );
}
