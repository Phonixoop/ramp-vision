"use client";

import { useDeferredValue, useEffect, useMemo, useRef } from "react";
import { api } from "~/trpc/react";
import moment from "jalali-moment";

import Table from "~/features/table";
import { DepoTableProps } from "../types";
import { useDepo } from "../context";
import { DepoColumns } from "./DepoColumns";
import { DepoFilters } from "./DepoFilters";
import { DepoSummary } from "./DepoSummary";
import { DepoExport } from "./DepoExport";
import { CitiesPerformanceBarChart } from "~/features/cities-performance-chart/cities-performance-barchart";
import { FilterType as PersonnelFilterType } from "~/context/personnel-filter.context";
import { TableDataProvider } from "~/context/table-data.context";
import WorkDaysToggle from "~/features/work-days-toggle";
import WorkDaysToggleView from "~/features/work-days-toggle/view";

export function DepoTable({ sessionData }: DepoTableProps) {
  const { filters, setDataFilters, reportPeriod } = useDepo();
  const hasSetInitialCities = useRef(false);

  // API Queries
  const initialFilters = api.depo.getInitialFilters.useQuery(undefined, {
    enabled: sessionData?.user !== undefined,
    refetchOnWindowFocus: false,
  });

  const deferredFilter = useDeferredValue(filters);

  const depo = api.depo.getAll.useQuery(deferredFilter, {
    enabled: sessionData?.user !== undefined && !initialFilters.isLoading,
    refetchOnWindowFocus: false,
  });

  const depoEstimate = api.depo.getDepoEstimate.useQuery(deferredFilter, {
    enabled: sessionData?.user !== undefined && !initialFilters.isLoading,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (initialFilters.data?.Cities && !hasSetInitialCities.current) {
      hasSetInitialCities.current = true;
      setDataFilters((prev) => ({
        ...prev,
        filter: {
          ...prev.filter,
          CityName: initialFilters.data.Cities.map((a) => a.CityName),
        },
      }));
    }
  }, [initialFilters.data?.Cities, setDataFilters]);

  const columns = useMemo(
    () =>
      DepoColumns({
        initialFilters,
        depo,
        filters,
        setDataFilters,
        reportPeriod,
      }),
    [
      depo.data,
      initialFilters.data,
      depo.isLoading,
      initialFilters.isLoading,
      filters,
      setDataFilters,
      reportPeriod,
    ],
  );

  return (
    <TableDataProvider>
      <div
        className="flex w-full flex-col items-center justify-center gap-5 text-primary"
        dir="rtl"
      >
        <h1 className="py-5 text-right text-2xl text-primary underline underline-offset-[12px]">
          عملکرد شعبه ارزیابی
        </h1>

        <div className="relative flex w-full items-center justify-center rounded-lg py-5 text-center">
          <Table
            isLoading={depo.isLoading}
            data={depo.data?.result ?? []}
            columns={columns}
            renderInFilterView={() => (
              <DepoFilters
                initialFilters={initialFilters}
                depo={depo}
                columns={columns}
              />
            )}
            renderAfterFilterView={(flatRows) => (
              <DepoExport
                columns={columns}
                data={depo.data?.result ?? []}
                isLoading={depo.isLoading}
                flatRows={flatRows}
              />
            )}
            renderChild={(flatRows) => (
              <DepoSummary
                depo={depo}
                depoEstimate={depoEstimate}
                flatRows={flatRows}
              />
            )}
          />
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-5 py-5">
          <div className="sticky top-20 z-30 flex items-center justify-center overflow-hidden rounded-full bg-secondary/80 p-3 ">
            <WorkDaysToggleView filters={filters} />
            <div
              className="absolute inset-0 -z-10"
              data-framer-name="Mask Pattern"
              style={{
                backgroundColor: "transparent",
                backgroundImage:
                  "radial-gradient(transparent 0.1px, rgba(var(--secondary),0.9) 1px)",
                backgroundSize: "3px 3px",
                // backdropFilter: "blur(3px)",
                maskImage:
                  "linear-gradient(rgb(0, 0, 0) 60%, rgba(0, 0, 0, 0) 100%)",
                WebkitMaskImage:
                  "linear-gradient(rgb(0, 0, 0) 60%, rgba(0, 0, 0, 0) 100%)", // For Safari compatibility
                opacity: 1,
              }}
            />
          </div>
          <CitiesPerformanceBarChart filters={filters} />
        </div>
      </div>
    </TableDataProvider>
  );
}
