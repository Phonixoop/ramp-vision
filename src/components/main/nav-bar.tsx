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
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSetSelected = (val: string | null) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (val !== null && selected !== null && val !== selected) {
      const currentIndex = menuItems.findIndex((item) => item.id === selected);
      const nextIndex = menuItems.findIndex((item) => item.id === val);

      // Use math to determine direction: positive = going right, negative = going left
      const direction = nextIndex - currentIndex;
      setDir(direction > 0 ? "r" : "l");
    } else if (val === null) {
      setDir(null);
    }

    setSelected(val);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Add a delay before closing the menu
    hoverTimeoutRef.current = setTimeout(() => {
      handleSetSelected(null);
    }, 150); // 150ms delay
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

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
          href={{
            pathname: item.link,
          }}
          className="flex items-start justify-center gap-1 rounded-full px-3 py-1.5 text-sm text-primary-muted transition-colors hover:text-primary"
        >
          {item.icon && <item.icon className="size-4" />}
          <span>{item.value}</span>
        </Link>
      ))}

      {/* Items with submenu - dropdown */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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

        {selected && (
          <Content
            dir={dir}
            selected={selected}
            menuItems={itemsWithSubMenu}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        )}
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
        selected === item.id
          ? "bg-secbuttn text-primary"
          : "text-primary-muted",
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
  onMouseEnter,
  onMouseLeave,
}: {
  selected: string | null;
  dir: null | "l" | "r";
  menuItems: MenuItem[];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const selectedItem = menuItems.find((item) => item.id === selected);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const measureRef = React.useRef(null);

  // Recalculate dimensions whenever selection changes
  React.useLayoutEffect(() => {
    if (measureRef.current) {
      setDimensions({
        width: measureRef.current.offsetWidth,
        height: measureRef.current.offsetHeight + 20,
      });
    }
  }, [selected]);
  return (
    <motion.div
      layout
      id="overlay-content"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
      className=" absolute left-0 top-[calc(100%_+_24px)] min-w-96 rounded-lg border  border-primary/5 bg-secbuttn supports-[backdrop-filter]:bg-secondary/80 supports-[backdrop-filter]:backdrop-blur-lg"
    >
      <Bridge />
      <Nub selected={selected} />

      <motion.div
        className="relative  w-full overflow-hidden"
        animate={{ height: dimensions.height }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {/* A normal-flow measuring node for the selected content */}
        <div className="pointer-events-none invisible">
          <div ref={measureRef}>
            {selectedItem && <SubMenuContent subMenu={selectedItem.subMenu} />}
          </div>
        </div>
        {menuItems.map((item, i) => {
          const isSelected = selected === item.id;
          const currentIndex = menuItems.findIndex(
            (menuItem) => menuItem.id === item.id,
          );
          const selectedIndex = selected
            ? menuItems.findIndex((menuItem) => menuItem.id === selected)
            : -1;

          // Use math to determine animation values
          const indexDiff = currentIndex - selectedIndex;
          const isSelectedItem = isSelected;

          // Calculate x values using math
          const xInitial = isSelectedItem
            ? dir === null
              ? 0 // First time or after reset - no directional animation
              : dir === "r"
              ? "100%"
              : "-100%"
            : 0;

          const xAnimate = isSelectedItem
            ? 0
            : indexDiff < 0
            ? "-100%"
            : "100%";

          // Determine data-motion based on position relative to selected
          const dataMotion = isSelectedItem
            ? dir === null
              ? "from-center" // First time or after reset
              : dir === "r"
              ? "from-end"
              : "from-start"
            : indexDiff < 0
            ? "to-start"
            : "to-end";

          return (
            <motion.div
              key={item.id}
              className="absolute left-0 top-0 flex h-full w-full items-stretch justify-center p-4"
              data-motion={dataMotion}
              aria-hidden={!isSelectedItem}
              initial={{
                opacity: isSelectedItem ? 1 : 0,
                x: xInitial,
              }}
              animate={{
                opacity: isSelectedItem ? 1 : 0,
                x: xAnimate,
              }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <SubMenuContent subMenu={item.subMenu} />
            </motion.div>
          );
        })}
      </motion.div>
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
    <div className="grid w-full grid-cols-2 gap-4">
      {categories.map((category) => (
        <div
          key={category}
          className="flex flex-col items-center justify-stretch"
        >
          <h3 className="mb-2 text-sm font-medium text-primary-muted">
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
      href={{
        pathname: item.link,
      }}
      className="group flex w-full  flex-col items-center justify-center py-2 text-primary-muted transition-colors hover:text-primary"
    >
      {IconComponent && (
        <IconComponent className="mb-2 size-10 rounded-md border border-primary/10 p-2 text-xl group-hover:bg-primary group-hover:stroke-secondary " />
      )}
      <span className="text-sm">{item.value}</span>
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
