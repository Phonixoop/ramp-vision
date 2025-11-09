"use client";

import { useMemo, useState } from "react";
import { api } from "~/trpc/react";
import moment, { Moment } from "jalali-moment";
import BlurBackground from "~/ui/blur-backgrounds";
import Button from "~/ui/buttons";
import Table from "~/features/table";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
  getDefaultRoleTypesBaseOnContractType,
} from "~/constants/personnel-performance";
import UseUserManager from "~/hooks/userManager";
import Calender from "~/features/calendar";
import { twMerge } from "tailwind-merge";
import ToolTipSimple from "~/features/tooltip-simple-use";
import withConfirmation from "~/ui/with-confirmation";
import Modal from "~/ui/modals";
import { Loader2Icon } from "lucide-react";
import { cn, sortDates } from "~/lib/utils";
import XlsxViewer from "~/features/xlsx-view";
import { getPersianToEnglishCity } from "~/utils/util";
import { usePersonnels } from "../context";
import { PersonnelsTableProps } from "../types";
import { PersonnelsColumns, CustomColumnDef } from "./PersonnelsColumns";
import { PersonnelsFilters } from "./PersonnelsFilters";
import { TableFiltersContainerSkeleton } from "./TableFilterSkeleton";
import {
  distinctPersonnelPerformanceData,
  getPerformanceMetric,
  sparkChartForPersonnel,
} from "~/utils/personnel-performance";

export function PersonnelsTable({ sessionData }: PersonnelsTableProps) {
  const { hasManagePersonnelAccess } = UseUserManager();
  const {
    filters,
    setFilters,
    filtersWithNoNetworkRequest,
    setFiltersWithNoNetworkRequest,
  } = usePersonnels();
  const [personnel, setPersonnel] = useState<Personnel | undefined>(undefined);

  // API Queries
  const getInitialCities =
    api.personnelPerformance.getInitialCityNames.useQuery(undefined, {
      enabled: sessionData?.user !== undefined,
      refetchOnWindowFocus: false,
    });

  const getPersonnls = api.personnel.getAll.useQuery(
    {
      filter: {
        ProjectType: filters?.filter?.ProjectType,
        Role: filters?.filter?.Role,
        ContractType: filters?.filter?.ContractType,
        RoleType: filters?.filter?.RoleType,
        DateInfo: filters?.filter?.DateInfo,
      },
    },
    {
      refetchOnWindowFocus: false,
    },
  );
  console.log({ leeg: getPersonnls.data?.length });
  const columns = PersonnelsColumns({
    getPersonnls,
    filters,
    setFilters,
    cityNames: getInitialCities?.data?.CityNames ?? [],
    filtersWithNoNetworkRequest,
    setFiltersWithNoNetworkRequest,
  });

  if (getInitialCities.isLoading) {
    return <TableFiltersContainerSkeleton />;
  }

  // Add guard to prevent table rendering until data and columns are available
  if (getPersonnls.isLoading || !getPersonnls.data) {
    return (
      <div
        className="flex min-h-screen w-full flex-col gap-5 bg-secondary"
        dir="rtl"
      >
        <div className="mx-auto flex w-11/12 flex-col items-center justify-center gap-5 py-5">
          <div className="flex items-center justify-center p-8">
            <Loader2Icon className="h-12 w-12 animate-spin stroke-accent" />
            <span className="ml-3 text-primary">
              {getPersonnls.isLoading
                ? "در حال بارگذاری داده‌ها..."
                : "در حال آماده‌سازی جدول..."}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="flex min-h-screen w-full flex-col gap-5 bg-secondary"
        dir="rtl"
      >
        <div className="mx-auto flex w-11/12 flex-col items-center justify-center gap-5 py-5">
          <Table
            hasClickAction={hasManagePersonnelAccess}
            onClick={(row) => {
              if (!hasManagePersonnelAccess) return;

              setPersonnel({
                cityName: row.CityName,
                dateInfo: row.DateInfo,
                nameFamily: row.NameFamily,
                nationalCode: row.NationalCode,
              });
            }}
            isLoading={getPersonnls.isLoading}
            data={getPersonnls.data ?? []}
            columns={columns}
            renderInFilterView={() => {
              return <PersonnelsFilters getInitialFilters={getInitialCities} />;
            }}
          />
          {hasManagePersonnelAccess && <XlsxViewer />}
          <Modal
            center
            isOpen={!!personnel}
            onClose={() => {
              setPersonnel(undefined);
            }}
            className="bg-secondary"
          >
            <SetPersonnelDayOffWizard personnel={personnel} />
          </Modal>
        </div>
      </div>
    </>
  );
}

// ---------------- Types ----------------

type Personnel = {
  cityName: string;
  nameFamily: string;
  nationalCode: string;
  dateInfo: string;
};

// Metric type used in day-off coloring
export type Metric = {
  limit: number;
  color: string;
  tooltip: {
    text: string;
  };
  enText?: string; // tolerate extra key if present upstream
};

const DEFAULT_METRIC: Metric = {
  limit: 0,
  color: "transparent",
  tooltip: { text: "" },
};

export function SetPersonnelDayOffWizard({
  personnel,
}: {
  personnel?: Personnel | undefined; // <- optional at the boundary
}) {
  // 1) Early narrow: everything below "knows" personnel exists.
  if (!personnel) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        پرسنلی انتخاب نشده است
      </div>
    );
  }

  // 2) Destructure after the guard: no need for ?. anymore
  const { cityName, nameFamily, nationalCode, dateInfo } = personnel;

  const getAll = api.personnelPerformance.getAll.useQuery(
    {
      filter: {
        CityName: [cityName],
        Start_Date: [
          moment().locale("fa").add(-1, "month").format("YYYY/MM/DD"),
        ],
        NameFamily: [nameFamily],
        DateInfo: [dateInfo],
      },
      periodType: "ماهانه",
    },
    {
      // We're already narrowed, but this also protects during initial mounts
      enabled: true,
      refetchOnWindowFocus: false,
    },
  );

  if (getAll.isLoading) {
    return (
      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center backdrop-blur-xl">
        <Loader2Icon className="h-12 w-12 animate-spin stroke-accent" />
      </div>
    );
  }

  const sparkData = sparkChartForPersonnel(
    (getAll?.data as any)?.result ?? [],
    "NameFamily",
    nameFamily,
    [],
    {
      // Match aggregation grouping: filter by NationalCode and CityName to ensure consistency
      NationalCode: nationalCode,
      CityName: cityName,
    },
  );

  // Render function for calendar dates; casted to match older Calender types if needed.
  const renderDateCell = (
    date: Moment,
    monthNumber: number,
  ): React.ReactNode => {
    const start = date.format("YYYY/MM/DD");
    const userCalData = (sparkData as any[]).find(
      (d) => d.Start_Date === start,
    );
    const computedMetric = getPerformanceMetric(userCalData?.TotalPerformance);
    const metric: Metric = computedMetric ?? DEFAULT_METRIC; // always defined

    const hasTheDayOff = (getAll?.data as any)?.result?.find(
      (a: any) => a.Start_Date === start && a.NationalCode === nationalCode,
    )?.HasTheDayOff;

    return (
      <>
        {parseInt(date.format("M")) !== monthNumber + 1 ? (
          <span
            className={twMerge(
              "flex w-full items-center justify-center p-2 text-xs text-primary/50",
              "w-full rounded-full",
            )}
            style={{
              backgroundColor: userCalData ? metric.color : undefined,
            }}
          >
            {date.format("D")}
          </span>
        ) : (
          <ToolTipSimple
            className="cursor-default bg-secondary"
            tooltip={
              <span
                style={{ color: userCalData ? metric.color : undefined }}
                className="text-base text-primary"
              >
                {hasTheDayOff
                  ? "مرخصی"
                  : userCalData?.TotalPerformance?.toFixed?.(2)}
              </span>
            }
          >
            <TogglePersonelDayOffButton
              hasTheDayOff={!!hasTheDayOff}
              selectedPerson={{
                cityName,
                nameFamily,
                nationalCode,
                dateInfo,
              }}
              date={date}
              userCalData={userCalData}
              userMetric={metric}
            />
          </ToolTipSimple>
        )}
      </>
    );
  };

  return (
    <div dir="rtl" className="col-span-2 w-full">
      <Calender
        withMonthMenu
        year={moment().jYear()}
        defaultMonth={moment().jMonth()}
        onDate={renderDateCell}
      />
    </div>
  );
}

// ---------------- Toggle Button ----------------

interface TogglePersonelDayOffButtonProps {
  hasTheDayOff: boolean;
  selectedPerson: {
    cityName: string;
    nationalCode: string;
    nameFamily: string;
    dateInfo: string;
  };
  date: Moment;
  userCalData: any;
  userMetric?: Metric; // optional, will be defaulted
}

const ButtonWithConfirmation = withConfirmation(Button);

export function TogglePersonelDayOffButton({
  hasTheDayOff,
  selectedPerson,
  date,
  userCalData,
  userMetric,
}: TogglePersonelDayOffButtonProps) {
  const utils = api.useContext();

  const togglePersonnelDayOffMutation =
    api.personnelPerformance.togglePersonnelDayOff.useMutation({
      onSuccess(data, variables, context) {
        utils.personnelPerformance.getAll.invalidate({
          filter: {
            CityName: [selectedPerson.cityName],
            Start_Date: [
              moment().locale("fa").add(-1, "month").format("YYYY/MM/DD"),
            ],
            NameFamily: [selectedPerson.nameFamily],
            DateInfo: [selectedPerson.dateInfo],
          },
          periodType: "ماهانه",
        });
      },
    });

  const safeMetric = userMetric ?? DEFAULT_METRIC; // ensure defined

  const textForDayOff = `آیا میخواهید این روز را مرخصی رد کنید؟`;
  const textForDayOn = `آیا میخواهید این روز را مرخصی بودن خارج کنید؟`;
  return (
    <>
      <ButtonWithConfirmation
        title={hasTheDayOff ? textForDayOn : textForDayOff}
        confirmText="بله"
        cancelText="خیر"
        className={cn(
          " w-full p-2",
          hasTheDayOff === true ? "bg-white text-secondary" : "bg-secondary",
        )}
        onConfirm={async () => {
          await togglePersonnelDayOffMutation.mutate({
            date: date.format("YYYY/MM/DD"),
            nationalCode: selectedPerson.nationalCode,
            cityName: getPersianToEnglishCity(selectedPerson.cityName),
            nameFamily: selectedPerson.nameFamily,
          });
        }}
      >
        <span
          className={twMerge(
            "flex items-center justify-center text-xs text-inherit ",
            `h-6 w-6 rounded-full `,
          )}
          style={{
            backgroundColor: userCalData ? safeMetric.color : undefined,
          }}
        >
          {date.format("D")}
        </span>
      </ButtonWithConfirmation>
    </>
  );
}
