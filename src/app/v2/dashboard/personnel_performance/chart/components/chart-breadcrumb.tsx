"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/beui";
import { getEnglishToPersianCity } from "~/utils/util";

const CHART_HREF = "/v2/dashboard/personnel_performance/chart";
const DASHBOARD_HREF = "/v2/dashboard/personnels";

type Crumb = {
  key: string;
  label: string;
  href?: string;
};

export function ChartBreadcrumb() {
  const params = useParams<{ city?: string }>();
  const searchParams = useSearchParams();

  const activeCity = useMemo(() => {
    if (typeof params?.city !== "string") return "";
    try {
      return decodeURIComponent(params.city);
    } catch {
      return params.city;
    }
  }, [params?.city]);

  const query = useMemo(() => {
    const raw = searchParams?.toString() ?? "";
    return raw ? `?${raw}` : "";
  }, [searchParams]);

  const crumbs = useMemo<Crumb[]>(() => {
    const base: Crumb[] = [
      { key: "dashboard", label: "داشبورد", href: `${DASHBOARD_HREF}${query}` },
      {
        key: "personnel",
        label: "عملکرد پرسنل",
        href: `${CHART_HREF}${query}`,
      },
      {
        key: "chart",
        label: "نمودار",
        href: activeCity ? `${CHART_HREF}${query}` : undefined,
      },
    ];

    if (activeCity) {
      base.push({
        key: `city-${activeCity}`,
        label: getEnglishToPersianCity(activeCity) || activeCity,
      });
    }

    return base;
  }, [activeCity, query]);

  const lastIndex = crumbs.length - 1;

  return (
    <Breadcrumb
      labels={{ label: "مسیر صفحه", showHidden: "نمایش مسیرهای پنهان" }}
      className="min-h-8"
    >
      <BreadcrumbList maxItems={4} className="flex-nowrap text-xs">
        {crumbs.map((crumb, index) => {
          const isCurrent = index === lastIndex;
          return (
            <BreadcrumbItem key={crumb.key}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              {isCurrent || !crumb.href ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={crumb.href}
                  render={(linkProps) => (
                    <Link
                      {...linkProps}
                      href={crumb.href!}
                      scroll={false}
                    />
                  )}
                >
                  {crumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
