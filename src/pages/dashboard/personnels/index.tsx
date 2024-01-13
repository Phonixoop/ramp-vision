import { LayoutGroup } from "framer-motion";
import moment from "jalali-moment";
import React, { useMemo, useState } from "react";
import DatePicker from "react-multi-date-picker";
import { CITIES, Reports_Period } from "~/constants";
import {
  FilterType,
  PeriodType,
  usePersonnelFilter,
} from "~/context/personnel-filter.context";
import Header from "~/features/header";
import { InPageMenu } from "~/features/menu";
import BlurBackground from "~/ui/blur-backgrounds";
import Button from "~/ui/buttons";
import { api } from "~/utils/api";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import {
  DistinctData,
  calculateAggregateByFields,
  en,
  getPerformanceText,
} from "~/utils/util";
import { SelectColumnFilter, SelectControlled } from "~/features/checkbox-list";
import H2 from "~/ui/heading/h2";
import Gauge from "~/features/gauge";
import Table from "~/features/table";
import { ColumnDef } from "@tanstack/react-table";
export default function GaugesPage() {
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
        // CityName,NameFamily, ProjectType,ContractType,Role,RoleType,DateInfo
        // {
        //   header: "استان",
        //   accessorKey: "CityName",
        //   filterFn: "arrIncludesSome",
        //   Filter: ({ column }) => {
        //     return (
        //       <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
        //         <span className="font-bold text-primary">استان ها</span>
        //         {initialFilters.data?.Cities && (
        //           <LayoutGroup id="CityLevelMenu">
        //             <InPageMenu
        //               list={City_Levels.map((a) => a.name)}
        //               value={0}
        //               onChange={(value) => {
        //                 const { setFilterValue } = column;
        //                 const cities = City_Levels.find(
        //                   (a) => a.name === value.item.name,
        //                 ).cities;

        //                 // beacuse our system is permission based we need to only filter allowed cities.
        //                 const canFilterCities = cities.filter((city) =>
        //                   initialFilters.data.Cities.map(
        //                     (a) => a.CityName,
        //                   ).includes(city),
        //                 );

        //                 if (cities.length <= 0) {
        //                   setFilterValue(
        //                     initialFilters.data.Cities.map((a) => a.CityName),
        //                   );
        //                 } else setFilterValue(canFilterCities);
        //               }}
        //             />
        //           </LayoutGroup>
        //         )}

        //         <SelectColumnFilter
        //           column={column}
        //           data={initialFilters.data?.Cities}
        //           onChange={(filter) => {}}
        //         />
        //       </div>
        //     );
        //   },
        // },
        {
          header: "کابران",
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
                    onChange={(filter) => {
                      // setDataFilters((prev) => {
                      //   return {
                      //     ...prev,
                      //     [filter.id]: filter.values,
                      //   };
                      // });
                    }}
                  />
                </div>
              </>
            );
          },
        },
        {
          header: "استان",
          accessorKey: "CityName",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">استان</span>
                <SelectColumnFilter
                  initialFilters={[]}
                  column={column}
                  data={getPersonnls.data}
                  onChange={(filter) => {
                    // setDataFilters((prev) => {
                    //   return {
                    //     ...prev,
                    //     [filter.id]: filter.values,
                    //   };
                    // });
                  }}
                />
              </div>
            );
          },
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
                  initialFilters={["جبران"]}
                  column={column}
                  data={getPersonnls.data}
                  onChange={(filter) => {
                    // setDataFilters((prev) => {
                    //   return {
                    //     ...prev,
                    //     [filter.id]: filter.values,
                    //   };
                    // });
                  }}
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
                  initialFilters={["تمام وقت"]}
                  column={column}
                  data={getPersonnls.data}
                  onChange={(filter) => {
                    // setDataFilters((prev) => {
                    //   return {
                    //     ...prev,
                    //     [filter.id]: filter.values,
                    //   };
                    // });
                  }}
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
                  initialFilters={[
                    "کارشناس ارزیاب اسناد بیمارستانی",
                    "کارشناس ارزیاب اسناد پاراکلینیکی",
                    "کارشناس ارزیاب اسناد دارویی",
                    "کارشناس ارزیاب اسناد دندانپزشکی",
                    "کارشناس پذیرش اسناد",
                    "کارشناس ثبت اسناد خسارت",
                  ]}
                  column={column}
                  data={getPersonnls.data}
                  onChange={(filter) => {
                    // setDataFilters((prev) => {
                    //   return {
                    //     ...prev,
                    //     [filter.id]: filter.values,
                    //   };
                    // });
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
                  column={column}
                  data={getPersonnls.data}
                  onChange={(filter) => {
                    // setDataFilters((prev) => {
                    //   return {
                    //     ...prev,
                    //     [filter.id]: filter.values,
                    //   };
                    // });
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
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">
                  تاریخ گزارش پرسنل
                </span>
                <SelectColumnFilter
                  column={column}
                  singleSelect
                  data={getPersonnls.data}
                  onChange={(filter) => {
                    // setDataFilters((prev) => {
                    //   return {
                    //     ...prev,
                    //     [filter.id]: filter.values,
                    //   };
                    // });
                  }}
                />
              </div>
            );
          },
        },
      ],
      [getPersonnls.data],
    ) || [];

  return (
    <>
      <BlurBackground />

      <div
        className="flex min-h-screen w-full flex-col gap-5 bg-secondary"
        dir="rtl"
      >
        <div className="mx-auto flex w-11/12 flex-col-reverse items-center justify-between  gap-5  py-5 md:flex-row-reverse md:items-start">
          <Table
            isLoading={getPersonnls.isLoading}
            data={getPersonnls.data ?? []}
            columns={columns}
            renderInFilterView={() => {
              return <></>;
            }}
          />
        </div>
      </div>
    </>
  );
}
