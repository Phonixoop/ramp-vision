import {
  BarChartIcon,
  UsersIcon,
  TrendingUpIcon,
  ClipboardListIcon,
  FileTextIcon,
  HomeIcon,
  InfoIcon,
  HelpCircleIcon,
  ActivityIcon,
  BuildingIcon,
  PieChartIcon,
} from "lucide-react";
import { MenuItem } from "~/components/main/nav-bar";
import { BarChartSkeletonLoading } from "~/features/loadings/bar-chart";

// Categorized and organized MENU constant
export const MENU: MenuItem[] = [
  // Main pages
  {
    id: "home",
    value: "خانه",
    link: "/",
    icon: HomeIcon,
  },
  {
    id: "guide",
    value: "راهنما",
    link: "/guide",
    icon: HelpCircleIcon,
  },
  {
    id: "about",
    value: "درباره RAMP",
    link: "/about",
    icon: InfoIcon,
  },

  // Performance & Analytics
  {
    id: "performance",
    value: "عملکرد",
    link: "/dashboard/depo",
    icon: ActivityIcon,
    subMenu: [
      {
        id: "depo-performance",
        value: "جزئیات عملکرد شعب",
        link: "/dashboard/depo",
        icon: BuildingIcon,
        category: "عملکرد شعب",
        skeletonPreview: DepoPerformanceSkeleton,
      },
      {
        id: "province-gauge",
        value: "گیج عملکرد استان ها",
        link: "/dashboard/gauges",
        icon: TrendingUpIcon,
        category: "عملکرد شعب",
        skeletonPreview: ProvinceGaugeSkeleton,
      },
      {
        id: "personnel-chart",
        value: "عملکرد پرسنل (نمودار)",
        link: "/dashboard/personnel_performance/chart",
        icon: PieChartIcon,
        category: "عملکرد پرسنل",
        skeletonPreview: PersonnelPerformanceChartSkeleton,
      },
      {
        id: "personnel-table",
        value: "عملکرد پرسنل (جدول)",
        link: "/dashboard/personnel_performance/table",
        icon: ClipboardListIcon,
        category: "عملکرد پرسنل",
        skeletonPreview: PersonnelTableSkeleton,
      },
      // {
      //   id: "direct-entry",
      //   value: "ورودی مستقیم اسناد",
      //   link: "/dashboard/personnel_performance/pishkhan",
      //   icon: FileTextIcon,
      //   category: "عملکرد پرسنل",
      // },
    ],
  },

  // Insurance & Claims
  {
    id: "insurance",
    value: "خسارت",
    link: "/dashboard/havale_khesarat",
    icon: FileTextIcon,
    subMenu: [
      {
        id: "damage-order",
        value: "حواله خسارت",
        link: "/dashboard/havale_khesarat",
        icon: FileTextIcon,
        category: "خسارت",
        skeletonPreview: DamageOrderSkeleton,
      },
      {
        id: "monthly-entry",
        value: "ورودی مستقیم ماهانه",
        link: "/dashboard/insurance_metrics",
        icon: TrendingUpIcon,
        category: "ورودی",
        skeletonPreview: MonthlyEntrySkeleton,
      },
    ],
  },

  // Personnel & Reports
  {
    id: "personnel-reports",
    value: "پرسنل و گزارشات",
    link: "/dashboard/personnels",
    icon: UsersIcon,
    subMenu: [
      {
        id: "personnel",
        value: "پرسنل",
        link: "/dashboard/personnels",
        icon: UsersIcon,
        category: "پرسنل",
        skeletonPreview: PersonnelSkeleton,
      },
      {
        id: "bi-reports",
        value: "گزارشات BI",
        link: "/dashboard/bi",
        icon: BarChartIcon,
        category: "گزارشات",
        skeletonPreview: BIReportsSkeleton,
      },
      {
        id: "top-assessors",
        value: "ارزیابان برتر",
        link: "/dashboard/bests",
        icon: TrendingUpIcon,
        category: "گزارشات",
        skeletonPreview: TopAssessorsSkeleton,
      },
    ],
  },
];

export function checkStatusForMenu(status: string, user: any) {
  if (status === "unauthenticated" || !user) {
    return MENU.filter((menu) => {
      // Filter out dashboard items for unauthenticated users
      const restrictedIds = ["performance", "insurance", "personnel-reports"];

      return !restrictedIds.includes(menu.id);
    });
  }
  return MENU;
}

// Skeleton Components for different menu items
function PersonnelPerformanceChartSkeleton() {
  return (
    <div className="flex h-[80px] w-full items-center justify-center gap-1 rounded-lg bg-accent bg-secondary/50 group-hover:bg-primary/10">
      <div className="flex h-full w-4/12 flex-col items-center justify-center gap-1 overflow-hidden rounded-lg bg-secbuttn p-1 group-hover:bg-secondary/10">
        {Array.from({ length: 8 }).map((_, index) => (
          <span
            key={index}
            className="h-[10px] w-full rounded-md bg-primary/10 group-hover:bg-secondary/10"
          ></span>
        ))}
      </div>
      <div className="flex h-full w-4/12 flex-col items-center justify-center gap-1 overflow-hidden rounded-lg bg-secbuttn p-1 group-hover:bg-secondary/10">
        {Array.from({ length: 8 }).map((_, index) => (
          <span
            key={index}
            className="h-[10px] w-full rounded-md bg-primary/10 group-hover:bg-secondary/10"
          ></span>
        ))}
      </div>
      <div className=" grid h-full w-8/12 grid-cols-2 grid-rows-2 items-center justify-center gap-1 rounded-xl bg-secbuttn p-2 group-hover:bg-secondary/10  ">
        <span className="h-full w-full  rounded-xl bg-primary/5 group-hover:bg-secondary/10" />
        <span className="h-full w-full  rounded-xl bg-primary/5 group-hover:bg-secondary/10" />
        <span className="h-full w-full  rounded-xl bg-primary/5 group-hover:bg-secondary/10" />
        <span className="h-full w-full  rounded-xl bg-primary/5 group-hover:bg-secondary/10" />
      </div>
    </div>
  );
}

function DepoPerformanceSkeleton() {
  return (
    <>
      <div className="flex h-[80px] w-full flex-col items-center justify-center gap-2 rounded-lg bg-accent bg-secondary/50 p-2 group-hover:bg-primary/10">
        <div
          role="status"
          className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-lg bg-secbuttn p-2 group-hover:bg-secondary/10"
        >
          <div className="flex items-baseline">
            <div className="ms-1 h-32 w-full rounded-t-lg bg-secondary/50 p-2 group-hover:bg-primary/50 "></div>
            <div className="ms-1 h-14 w-full rounded-t-lg bg-secondary/50 p-2 group-hover:bg-primary/50 "></div>
            <div className="ms-1 h-16 w-full rounded-t-lg bg-secondary/50 p-2 group-hover:bg-primary/50 "></div>
            <div className="ms-1 h-12 w-full rounded-t-lg bg-secondary/50 p-2 group-hover:bg-primary/50 "></div>
            <div className="ms-1 h-14 w-full rounded-t-lg bg-secondary/50 p-2 group-hover:bg-primary/50 "></div>
            <div className="ms-1 h-12 w-full rounded-t-lg bg-secondary/50 p-2 group-hover:bg-primary/50 "></div>
            <div className="ms-1 h-20 w-full rounded-t-lg bg-secondary/50 p-2 group-hover:bg-primary/50 "></div>
            <div className="ms-1 h-12 w-full rounded-t-lg bg-secondary/50 p-2 group-hover:bg-primary/50 "></div>
            <div className="ms-1 h-28 w-full rounded-t-lg bg-secondary/50 p-2 group-hover:bg-primary/50 "></div>
          </div>
        </div>
        <div className="flex h-full w-full items-center justify-center gap-2">
          <div className="flex h-full w-1/3 flex-col items-center justify-center gap-1 rounded-lg bg-secbuttn p-2 group-hover:bg-secondary/10">
            <span className="h-4 w-[98%] rounded-md bg-primary/20 group-hover:bg-secondary/20" />
            <span className="h-3 w-full rounded-md bg-primary/10 group-hover:bg-secondary/10" />
          </div>
          <div className="flex h-full w-1/3 flex-col items-center justify-center gap-1 rounded-lg bg-secbuttn p-2 group-hover:bg-secondary/10">
            <span className="h-4  w-[98%] rounded-md bg-primary/20 group-hover:bg-secondary/20" />
            <span className="h-3 w-12 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
          </div>
          <div className="flex h-full w-1/3 flex-col items-center justify-center gap-1 rounded-lg bg-secbuttn p-2 group-hover:bg-secondary/10">
            <span className="h-4  w-[98%] rounded-md bg-primary/20 group-hover:bg-secondary/20" />
            <span className="h-3 w-12 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
          </div>
        </div>
      </div>
    </>
  );
}

function ProvinceGaugeSkeleton() {
  return (
    <div className="flex h-[80px] w-full items-center justify-center gap-2 rounded-lg bg-accent bg-secondary/50 p-2 group-hover:bg-primary/10">
      <div className="flex h-full w-1/2 items-center justify-center rounded-full bg-secbuttn p-4 group-hover:bg-secondary/10">
        <div className="h-12 w-12 rounded-full bg-primary/20 group-hover:bg-secondary/20" />
      </div>
      <div className="flex h-full w-1/2 flex-col items-center justify-center gap-1 rounded-lg bg-secbuttn p-2 group-hover:bg-secondary/10">
        <span className="h-3 w-20 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
        <span className="h-3 w-16 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
        <span className="h-3 w-14 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
      </div>
    </div>
  );
}

function PersonnelTableSkeleton() {
  return (
    <div className="flex h-[80px] w-full flex-col items-center justify-center gap-1 rounded-lg bg-accent bg-secondary/50 p-2 group-hover:bg-primary/10">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex h-4 w-full items-center gap-2">
          <span className="h-3 w-8 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
          <span className="h-3 w-20 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
          <span className="h-3 w-16 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
          <span className="h-3 w-12 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
        </div>
      ))}
    </div>
  );
}

function DamageOrderSkeleton() {
  return (
    <div className="flex h-[80px] w-full items-center justify-center gap-2 rounded-lg bg-accent bg-secondary/50 p-2 group-hover:bg-primary/10">
      <div className="flex h-full w-1/2 flex-col items-center justify-center gap-1 rounded-lg bg-secbuttn p-2 group-hover:bg-secondary/10">
        <span className="h-4 w-20 rounded-md bg-primary/20 group-hover:bg-secondary/20" />
        <span className="h-3 w-16 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
        <span className="h-3 w-12 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
      </div>
      <div className="flex h-full w-1/2 flex-col items-center justify-center gap-1 rounded-lg bg-secbuttn p-2 group-hover:bg-secondary/10">
        <span className="h-4 w-20 rounded-md bg-primary/20 group-hover:bg-secondary/20" />
        <span className="h-3 w-16 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
        <span className="h-3 w-12 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
      </div>
    </div>
  );
}

function MonthlyEntrySkeleton() {
  return (
    <div className="flex h-[80px] w-full items-center justify-center gap-1 rounded-lg bg-accent bg-secondary/50 p-2 group-hover:bg-primary/10">
      <div className="flex h-full w-1/3 flex-col items-center justify-center gap-1 rounded-lg bg-secbuttn p-2 group-hover:bg-secondary/10">
        <span className="h-4 w-[98%] rounded-md bg-primary/20 group-hover:bg-secondary/20" />
        <span className="h-3 w-12 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
      </div>
      <div className="flex h-full w-1/3 flex-col items-center justify-center gap-1 rounded-lg bg-secbuttn p-2 group-hover:bg-secondary/10">
        <span className="h-4 w-[98%] rounded-md bg-primary/20 group-hover:bg-secondary/20" />
        <span className="h-3 w-12 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
      </div>
      <div className="flex h-full w-1/3 flex-col items-center justify-center gap-1 rounded-lg bg-secbuttn p-2 group-hover:bg-secondary/10">
        <span className="h-4 w-[98%] rounded-md bg-primary/20 group-hover:bg-secondary/20" />
        <span className="h-3 w-12 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
      </div>
    </div>
  );
}

function PersonnelSkeleton() {
  return (
    <div className="flex h-[80px] w-full flex-col items-center justify-center gap-1 rounded-lg bg-accent bg-secondary/50 p-2 group-hover:bg-primary/10">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex h-5 w-full items-center gap-2">
          <span className="h-4 w-4 rounded-full bg-primary/20 group-hover:bg-secondary/20" />
          <span className="h-3 w-24 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
          <span className="h-3 w-16 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
        </div>
      ))}
    </div>
  );
}

function BIReportsSkeleton() {
  return (
    <div className="flex h-[80px] w-full items-center justify-center gap-2 rounded-lg bg-accent bg-secondary/50 p-2 group-hover:bg-primary/10">
      <div className="flex h-full w-1/2 flex-col items-center justify-center gap-1 rounded-lg bg-secbuttn p-2 group-hover:bg-secondary/10">
        <span className="h-4 w-20 rounded-md bg-primary/20 group-hover:bg-secondary/20" />
        <span className="h-3 w-16 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
      </div>
      <div className="flex h-full w-1/2 flex-col items-center justify-center gap-1 rounded-lg bg-secbuttn p-2 group-hover:bg-secondary/10">
        <span className="h-4 w-20 rounded-md bg-primary/20 group-hover:bg-secondary/20" />
        <span className="h-3 w-16 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
      </div>
    </div>
  );
}

function TopAssessorsSkeleton() {
  return (
    <div className="flex h-[80px] w-full flex-col items-center justify-center gap-1 rounded-lg bg-accent bg-secondary/50 p-2 group-hover:bg-primary/10">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex h-5 w-full items-center gap-2">
          <span className="h-4 w-6 rounded-md bg-primary/20 group-hover:bg-secondary/20" />
          <span className="h-3 w-20 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
          <span className="h-3 w-12 rounded-md bg-primary/10 group-hover:bg-secondary/10" />
        </div>
      ))}
    </div>
  );
}
