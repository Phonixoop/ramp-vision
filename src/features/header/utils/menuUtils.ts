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
      },
      {
        id: "personnel-chart",
        value: "عملکرد پرسنل (نمودار)",
        link: "/dashboard/personnel_performance/cities",
        icon: PieChartIcon,
        category: "عملکرد پرسنل",
      },
      {
        id: "personnel-table",
        value: "عملکرد پرسنل (جدول)",
        link: "/dashboard/personnel_performance",
        icon: ClipboardListIcon,
        category: "عملکرد پرسنل",
      },
      {
        id: "direct-entry",
        value: "ورودی مستقیم اسناد",
        link: "/dashboard/personnel_performance/pishkhan",
        icon: FileTextIcon,
        category: "عملکرد پرسنل",
      },
      {
        id: "province-gauge",
        value: "گیج عملکرد استان ها",
        link: "/dashboard/gauges",
        icon: TrendingUpIcon,
        category: "عملکرد شعب",
      },
    ],
  },

  // Insurance & Claims
  {
    id: "insurance",
    value: "بیمه و خسارت",
    link: "/dashboard/havale_khesarat",
    icon: FileTextIcon,
    subMenu: [
      {
        id: "damage-order",
        value: "حواله خسارت",
        link: "/dashboard/havale_khesarat",
        icon: FileTextIcon,
        category: "خسارت",
      },
      {
        id: "monthly-entry",
        value: "ورودی مستقیم ماهانه",
        link: "/dashboard/insurance_metrics",
        icon: TrendingUpIcon,
        category: "ورودی",
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
      },
      {
        id: "bi-reports",
        value: "گزارشات BI",
        link: "/dashboard/bi",
        icon: BarChartIcon,
        category: "گزارشات",
      },
      {
        id: "top-assessors",
        value: "ارزیابان برتر",
        link: "/dashboard/bests",
        icon: TrendingUpIcon,
        category: "گزارشات",
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
