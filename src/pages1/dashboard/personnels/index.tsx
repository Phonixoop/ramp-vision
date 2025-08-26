import { LayoutGroup } from "framer-motion";
import moment, { Moment } from "jalali-moment";
import React, { ReactNode, useMemo, useState } from "react";
import DatePicker from "react-multi-date-picker";
import { CITIES, City_Levels, Reports_Period } from "~/constants";
import {
  FilterType,
  PeriodType,
  usePersonnelFilter,
} from "~/context/personnel-filter.context";
import Header from "~/features/header";
import { InPageMenu } from "~/features/menu";
import BlurBackground from "~/ui/blur-backgrounds";
import Button from "~/ui/buttons";
import { api } from "~/trpc/react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import {
  DistinctData,
  calculateAggregateByFields,
  en,
  getEnglishToPersianCity,
  getPerformanceText,
  getPersianToEnglishCity,
} from "~/utils/util";
import { SelectColumnFilter, SelectControlled } from "~/features/checkbox-list";
import H2 from "~/ui/heading/h2";
import Gauge from "~/features/gauge";
import Table from "~/features/table";
import { ColumnDef } from "@tanstack/react-table";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
  getDefaultRoleTypesBaseOnContractType,
} from "~/constants/personnel-performance";
import UseUserManager from "~/hooks/userManager";
import Calender from "~/features/calender";
import { getMonthNumber } from "~/utils/date-utils";
import {
  distinctPersonnelPerformanceData,
  getPerformanceMetric,
  sparkChartForPersonnel,
} from "~/utils/personnel-performance";
import { twMerge } from "tailwind-merge";
import ToolTipSimple from "~/features/tooltip-simple-use";
import withConfirmation from "~/ui/with-confirmation";
import Modal from "~/ui/modals";
import { Loader2Icon } from "lucide-react";
import { sortDates } from "~/lib/utils";

import XlsxViewer from "~/features/xlsx-view";

export default function GaugesPage() {
  const { hasManagePersonnelAccess } = UseUserManager();
  const [filters, setFilters] = useState({
    filter: {
      CityName: [],
      ProjectType: [],
      Role: [],
      ContractType: [],
      RoleType: [],
      DateInfo: [],
    },
  });
  const [filtersWithNoNetworkRequest, setFiltersWithNoNetworkRequest] =
    useState({
      filter: {
        ContractType: defualtContractTypes,
        RoleType: getDefaultRoleTypesBaseOnContractType(defualtContractTypes),
      },
    });
  const getPersonnls = api.personnel.getAll.useQuery(
    {
      filter: {
        CityName: filters?.filter?.CityName,
        ProjectType: filters?.filter?.ProjectType,
        Role: filters?.filter?.Role,
        ContractType: filters?.filter?.ContractType,
        RoleType: filters?.filter?.RoleType,
        DateInfo: filters?.filter?.DateInfo,
      },
    },
    {
      onSuccess: (data) => {},

      refetchOnWindowFocus: false,
    },
  );

  const [personnel, setPersonnel] = useState<Personnel | undefined>(undefined);
  const columns =
    useMemo<ColumnDef<any>[]>(
      () => [
        {
          header: "ردیف",
          accessorKey: "Id",
          cell: ({ row }) => {
            return (
              <div className="w-full cursor-pointer rounded-full  px-2 py-2 text-primary">
                {row.index + 1}
              </div>
            );
          },
        },
        //CityName,NameFamily, ProjectType,ContractType,Role,RoleType,DateInfo
        {
          header: "استان",
          accessorKey: "CityName",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            const { getFilterValue } = column;

            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">استان ها</span>

                <LayoutGroup id="CityLevelMenu">
                  <InPageMenu
                    list={City_Levels.map((a) => a.name)}
                    startIndex={-1}
                    onChange={(value) => {
                      const { setFilterValue } = column;
                      const cities = City_Levels.find(
                        (a) => a.name === value.item.name,
                      )?.cities;
                      setFilterValue(cities?.map(getEnglishToPersianCity));
                    }}
                  />
                </LayoutGroup>

                <SelectColumnFilter
                  initialFilters={[]}
                  column={column}
                  data={getPersonnls.data}
                  onChange={(filter) => {}}
                />
              </div>
            );
          },
        },
        {
          header: "نام",
          accessorKey: "NameFamily",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <>
                <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                  <span className="font-bold text-primary">پرسنل</span>
                  <SelectColumnFilter
                    column={column}
                    data={getPersonnls.data}
                    onChange={(filter) => {}}
                  />
                </div>
              </>
            );
          },
        },
        {
          header: "کد ملی",
          accessorKey: "NationalCode",
          filterFn: "arrIncludesSome",
        },
        {
          header: "نوع پروژه",
          accessorKey: "ProjectType",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">نوع پروژه</span>
                <SelectColumnFilter
                  initialFilters={defaultProjectTypes}
                  column={column}
                  data={getPersonnls.data}
                  onChange={(filter) => {}}
                />
              </div>
            );
          },
        },
        {
          header: "سمت",
          accessorKey: "Role",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">سمت</span>
                <SelectColumnFilter
                  initialFilters={defualtRoles}
                  column={column}
                  data={getPersonnls.data}
                  onChange={(filter) => {}}
                />
              </div>
            );
          },
        },
        {
          header: "نوع قرارداد",
          accessorKey: "ContractType",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">نوع قرارداد</span>
                <SelectColumnFilter
                  column={column}
                  data={getPersonnls.data}
                  onChange={(filter) => {
                    setFiltersWithNoNetworkRequest((prev) => {
                      return {
                        ...prev,
                        filter: {
                          ...prev.filter,
                          [filter.id]: filter.values,
                          RoleType: getDefaultRoleTypesBaseOnContractType(
                            filter.values ?? defualtContractTypes,
                          ),
                        },
                      };
                    });
                  }}
                />
              </div>
            );
          },
        },

        {
          header: "نوع سمت",
          accessorKey: "RoleType",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">نوع سمت</span>
                <SelectColumnFilter
                  selectedValues={filtersWithNoNetworkRequest?.filter?.RoleType}
                  column={column}
                  data={getPersonnls.data}
                  onChange={(filter) => {
                    setFiltersWithNoNetworkRequest((prev) => {
                      return {
                        ...prev,
                        filter: {
                          ...prev.filter,
                          RoleType: filter.values,
                        },
                      };
                    });
                  }}
                />
              </div>
            );
          },
        },
        {
          header: "تاریخ گزارش پرسنل",
          accessorKey: "DateInfo",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            const _DateInfos = [
              ...new Set(getPersonnls?.data?.map((a: any) => a.DateInfo)),
            ];

            const DateInfos = sortDates({ dates: _DateInfos });

            if (DateInfos.length <= 0) return null;
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">
                  تاریخ گزارش پرسنل
                </span>
                <SelectColumnFilter
                  column={column}
                  initialFilters={[DateInfos[DateInfos.length - 1] ?? ""]}
                  singleSelect
                  data={getPersonnls.data}
                  onChange={(filter) => {}}
                />
              </div>
            );
          },
        },
      ],
      [getPersonnls.data, filtersWithNoNetworkRequest],
    ) || [];

  return (
    <>
      <BlurBackground />

      <div
        className="flex min-h-screen w-full flex-col gap-5 bg-secondary"
        dir="rtl"
      >
        <div className="mx-auto flex w-11/12 flex-col items-center justify-center  gap-5  py-5  ">
          <Table
            hasClickAction={hasManagePersonnelAccess}
            onClick={(row) => {
              if (!hasManagePersonnelAccess) return;
              const { original } = row;
              setPersonnel({
                cityName: original.CityName,
                dateInfo: original.DateInfo,
                nameFamily: original.NameFamily,
                nationalCode: original.NationalCode,
              });
            }}
            isLoading={getPersonnls.isLoading}
            data={getPersonnls.data ?? []}
            columns={columns}
            renderInFilterView={() => {
              return <></>;
            }}
          />
          {/* <XlsxView /> */}
          {hasManagePersonnelAccess && <XlsxViewer />}
          <Modal
            center
            isOpen={!!personnel}
            onClose={() => {
              setPersonnel(undefined);
            }}
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
      // We’re already narrowed, but this also protects during initial mounts
      enabled: true,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        return distinctPersonnelPerformanceData(
          data ?? [],
          ["NationalCode", "NameFamily", "CityName"],
          [
            "NationalCode",
            "NameFamily",
            "SabtAvalieAsnad",
            "PazireshVaSabtAvalieAsnad",
            "ArzyabiAsanadBimarsetaniDirect",
            "ArzyabiAsnadBimarestaniIndirect",
            "ArzyabiAsnadDandanVaParaDirect",
            "ArzyabiAsnadDandanVaParaIndirect",
            "ArzyabiAsnadDaroDirect",
            "ArzyabiAsnadDaroIndirect",
            "WithScanCount",
            "WithoutScanCount",
            "WithoutScanInDirectCount",
            "ArchiveDirectCount",
            "ArchiveInDirectCount",
            "ArzyabiVisitDirectCount",
            "Role",
            "RoleType",
            "ContractType",
            "ProjectType",
            "TotalPerformance",
            "Start_Date",
            "HasTheDayOff",
            "COUNT",
          ],
          { HasTheDayOff: false },
        );
      },
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
  );

  // Render function for calendar dates; casted to match older Calender types if needed.
  const renderDateCell = (date: Moment, monthNumber: number): ReactNode => {
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
        // If Calender.onDate is typed as () => void in your codebase,
        // the cast below keeps TypeScript happy without changing Calender's file.
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
        className={twMerge(
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
